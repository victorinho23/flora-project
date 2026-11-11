// backend/src/features/categories/categories.repository.js

import { pool } from "../../config/db.js";

export const categoriesRepository = {
    async getAll() {
        const query = `
            SELECT id, nombre, estado
            FROM categoria
            WHERE estado = TRUE
            ORDER BY id;
        `;

        const result = await pool.query(query);
        return result.rows;
    },
};
