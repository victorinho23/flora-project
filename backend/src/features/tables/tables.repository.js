// backend/src/features/tables/tables.repository.js
// consultas de las mesas del restaurante

import { pool } from "../../config/db.js";

// columnas con los nombres que usa el frontend
const COLUMNS = `id, numero AS "number", capacidad AS capacity, zona AS zone, estado AS active, pos_x AS x, pos_y AS y, rotacion AS rotation, plano_id AS "floorId", ocupada_desde AS "occupiedSince"`;

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

    // clientes sentados sin pedir: se guarda desde cuando (o se borra al liberar la mesa)
    async setOccupied(id, occupied) {
        await pool.query(`UPDATE mesa SET ocupada_desde = ${occupied ? "NOW()" : "NULL"} WHERE id = $1;`, [id]);
    },

    async setOccupiedByNumber(number, occupied) {
        await pool.query(`UPDATE mesa SET ocupada_desde = ${occupied ? "NOW()" : "NULL"} WHERE numero = $1;`, [number]);
    },

    async updateStatus(id, active) {
        await pool.query(`UPDATE mesa SET estado = $2 WHERE id = $1;`, [id, active]);
    },

    // orden abierta (en cocina o lista para entregar) que tenga la mesa
    async findOpenOrder(number) {
        const result = await pool.query(
            `SELECT id FROM orden WHERE numero_mesa = $1 AND estado IN ('ACTIVA', 'LISTA_PARA_ENTREGA', 'ENTREGADA', 'CUENTA_PEDIDA') LIMIT 1;`,
            [number],
        );
        return result.rows[0] ?? null;
    },

    // pisos del mapa del restaurante, en su orden
    async getMaps() {
        const result = await pool.query(`
            SELECT id, nombre AS name, columnas AS cols, filas AS rows, celdas AS cells
            FROM plano
            ORDER BY orden, id;
        `);
        return result.rows;
    },

    async findMap(id) {
        const result = await pool.query(`SELECT id, nombre AS name FROM plano WHERE id = $1;`, [id]);
        return result.rows[0] ?? null;
    },

    // piso nuevo vacio, queda de ultimo
    async createMap(name) {
        const result = await pool.query(
            `INSERT INTO plano (nombre, orden) VALUES ($1, COALESCE((SELECT MAX(orden) FROM plano), 0) + 1) RETURNING id;`,
            [name],
        );
        return result.rows[0].id;
    },

    // guarda el dibujo del piso y la celda de cada mesa en una sola transaccion
    async saveMap(id, { name, cols, rows, cells, positions }) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(
                `UPDATE plano SET nombre = $2, columnas = $3, filas = $4, celdas = $5, fecha_actualizacion = NOW() WHERE id = $1;`,
                [id, name, cols, rows, JSON.stringify(cells)],
            );
            // primero se quitan del piso todas sus mesas y luego se ponen las que llegaron
            // (si una mesa estaba en otro piso, se pasa a este)
            await client.query(`UPDATE mesa SET pos_x = NULL, pos_y = NULL, plano_id = NULL WHERE plano_id = $1;`, [id]);
            for (const position of positions) {
                await client.query(`UPDATE mesa SET pos_x = $2, pos_y = $3, plano_id = $4, rotacion = $5 WHERE id = $1;`, [position.id, position.x, position.y, id, position.rotation]);
            }
            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    },

    // al borrar un piso sus mesas quedan sin ubicar (no se borran)
    async removeMap(id) {
        await pool.query(`UPDATE mesa SET pos_x = NULL, pos_y = NULL, plano_id = NULL WHERE plano_id = $1;`, [id]);
        await pool.query(`DELETE FROM plano WHERE id = $1;`, [id]);
    },
};
