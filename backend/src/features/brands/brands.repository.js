// backend/src/features/brands/brands.repository.js

import { pool } from "../../config/db.js";

export const brandsRepository = {
    async getAll() {
        const query = `
            SELECT id, nombre AS name
            FROM marca
            WHERE estado = TRUE
            ORDER BY nombre;
        `;

        const result = await pool.query(query);
        return result.rows;
    },

    // busca la marca por nombre y si no existe la crea, devuelve el id
    async findOrCreate(name, db = pool) {
        const query = `
            INSERT INTO marca (nombre)
            VALUES ($1)
            ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
            RETURNING id;
        `;

        const result = await db.query(query, [name]);
        return result.rows[0].id;
    },
};
