// backend/src/features/categories/categories.repository.js
// consultas de las categorias del menu

import { pool } from "../../config/db.js";

export const categoriesRepository = {
    // activas para los select; con all = true tambien las inactivas (pagina de categorias)
    // dishes = cuantos platillos tiene cada una
    async getAll(all = false) {
        const query = `
            SELECT c.id, c.nombre, c.estado, COUNT(p.id)::INTEGER AS dishes
            FROM categoria c
            LEFT JOIN platillo p ON p.categoria_id = c.id
            ${all ? "" : "WHERE c.estado = TRUE"}
            GROUP BY c.id
            ORDER BY c.nombre;
        `;

        const result = await pool.query(query);
        return result.rows;
    },

    async findById(id) {
        const result = await pool.query(`SELECT id, nombre, estado FROM categoria WHERE id = $1;`, [id]);
        return result.rows[0] ?? null;
    },

    // busca otra categoria con el mismo nombre (sin importar mayusculas ni espacios)
    async findByName(nombre, excludeId = null) {
        const result = await pool.query(
            `SELECT id FROM categoria WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1)) AND ($2::INTEGER IS NULL OR id <> $2) LIMIT 1;`,
            [nombre, excludeId],
        );
        return result.rows[0] ?? null;
    },

    async create(nombre) {
        const result = await pool.query(`INSERT INTO categoria (nombre) VALUES ($1) RETURNING id;`, [nombre]);
        return result.rows[0].id;
    },

    async update(id, nombre) {
        await pool.query(`UPDATE categoria SET nombre = $2 WHERE id = $1;`, [id, nombre]);
    },

    async updateStatus(id, estado) {
        await pool.query(`UPDATE categoria SET estado = $2 WHERE id = $1;`, [id, estado]);
    },

    // platillos activos que quedarian sin categoria visible si se inhabilita
    async countActiveDishes(id) {
        const result = await pool.query(`SELECT COUNT(*)::INTEGER AS total FROM platillo WHERE categoria_id = $1 AND estado = TRUE;`, [id]);
        return result.rows[0].total;
    },
};
