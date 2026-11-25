// backend/src/features/tables/tables.repository.js
// consultas de las mesas del restaurante

import { pool } from "../../config/db.js";

// columnas con los nombres que usa el frontend
const COLUMNS = `id, numero AS "number", capacidad AS capacity, zona AS zone, estado AS active, pos_x AS x, pos_y AS y`;

export const tablesRepository = {
    // todas (pagina de configuracion) o solo las activas (plano de las ordenes)
    async getAll(onlyActive = false) {
        const result = await pool.query(`
            SELECT ${COLUMNS}
            FROM mesa
            ${onlyActive ? "WHERE estado = TRUE" : ""}
            ORDER BY numero;
        `);
        return result.rows;
    },

    async findById(id) {
        const result = await pool.query(`SELECT ${COLUMNS} FROM mesa WHERE id = $1;`, [id]);
        return result.rows[0] ?? null;
    },

    async findByNumber(number) {
        const result = await pool.query(`SELECT ${COLUMNS} FROM mesa WHERE numero = $1;`, [number]);
        return result.rows[0] ?? null;
    },

    async create({ number, capacity, zone }) {
        const result = await pool.query(
            `INSERT INTO mesa (numero, capacidad, zona) VALUES ($1, $2, $3) RETURNING id;`,
            [number, capacity, zone],
        );
        return result.rows[0].id;
    },

    async update(id, { number, capacity, zone }) {
        await pool.query(`UPDATE mesa SET numero = $2, capacidad = $3, zona = $4 WHERE id = $1;`, [id, number, capacity, zone]);
    },

    async updateStatus(id, active) {
        await pool.query(`UPDATE mesa SET estado = $2 WHERE id = $1;`, [id, active]);
    },

    // orden abierta (en cocina o lista para entregar) que tenga la mesa
    async findOpenOrder(number) {
        const result = await pool.query(
            `SELECT id FROM orden WHERE numero_mesa = $1 AND estado IN ('ACTIVA', 'LISTA_PARA_ENTREGA') LIMIT 1;`,
            [number],
        );
        return result.rows[0] ?? null;
    },

    // el mapa del restaurante (solo hay uno)
    async getMap() {
        const result = await pool.query(`SELECT columnas AS cols, filas AS rows, celdas AS cells FROM plano WHERE id = 1;`);
        return result.rows[0] ?? null;
    },

    // guarda el dibujo y la celda de cada mesa en una sola transaccion
    async saveMap({ cols, rows, cells, positions }) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(
                `INSERT INTO plano (id, columnas, filas, celdas, fecha_actualizacion) VALUES (1, $1, $2, $3, NOW())
                 ON CONFLICT (id) DO UPDATE SET columnas = $1, filas = $2, celdas = $3, fecha_actualizacion = NOW();`,
                [cols, rows, JSON.stringify(cells)],
            );
            // primero se quitan todas del mapa y luego se ponen las que llegaron
            await client.query(`UPDATE mesa SET pos_x = NULL, pos_y = NULL;`);
            for (const { id, x, y } of positions) {
                await client.query(`UPDATE mesa SET pos_x = $2, pos_y = $3 WHERE id = $1;`, [id, x, y]);
            }
            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    },
};
