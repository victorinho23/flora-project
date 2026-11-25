// backend/src/features/tables/tables.repository.js
// consultas de las mesas del restaurante

import { pool } from "../../config/db.js";

// columnas con los nombres que usa el frontend
const COLUMNS = `id, numero AS "number", capacidad AS capacity, zona AS zone, estado AS active`;

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
};
