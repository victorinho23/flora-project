// backend/src/features/dishes/dishes.repository.js
// consultas de los platillos del menu

import { pool } from "../../config/db.js";

// columnas con los nombres que ya usa el frontend
const DISH_COLUMNS = `
    p.id,
    p.nombre AS name,
    p.precio AS price,
    p.descripcion AS description,
    p.imagen AS image,
    p.estado AS is_active,
    p.categoria_id AS category_id,
    c.nombre AS category
`;

export const dishesRepository = {
    async getAll() {
        const query = `
            SELECT ${DISH_COLUMNS}
            FROM platillo p
            INNER JOIN categoria c ON c.id = p.categoria_id
            ORDER BY p.nombre;
        `;

        const result = await pool.query(query);
        return result.rows;
    },

    // platillos para el reporte, los filtros ya llegan limpios desde el service
    async report({ ids }) {
        const conditions = [];
        const values = [];

        if (ids.length) {
            values.push(ids);
            conditions.push(`p.id = ANY($${values.length}::INT[])`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const query = `
            SELECT ${DISH_COLUMNS}
            FROM platillo p
            INNER JOIN categoria c ON c.id = p.categoria_id
            ${where}
            ORDER BY p.nombre;
        `;

        const result = await pool.query(query, values);
        return result.rows;
    },

    async findById(id) {
        const query = `
            SELECT ${DISH_COLUMNS}
            FROM platillo p
            INNER JOIN categoria c ON c.id = p.categoria_id
            WHERE p.id = $1;
        `;

        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    // no pueden existir dos platillos con el mismo nombre en la misma categoria
    async existsName(name, categoryId, excludeId = 0) {
        const query = `
            SELECT 1
            FROM platillo
            WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1))
              AND categoria_id = $2
              AND id <> $3
            LIMIT 1;
        `;

        const result = await pool.query(query, [name, categoryId, excludeId]);
        return result.rowCount > 0;
    },

    async create(dish) {
        const query = `
            INSERT INTO platillo (categoria_id, nombre, precio, descripcion, imagen, estado)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id;
        `;

        const values = [dish.categoryId, dish.name, dish.price, dish.description, dish.image, dish.isEnabled];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // la imagen solo cambia si llega una nueva
    async update(id, dish) {
        const query = `
            UPDATE platillo
            SET categoria_id = $1,
                nombre = $2,
                precio = $3,
                descripcion = $4,
                imagen = COALESCE($5, imagen),
                estado = $6
            WHERE id = $7
            RETURNING id;
        `;

        const values = [dish.categoryId, dish.name, dish.price, dish.description, dish.image, dish.isEnabled, id];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async updateStatus(id, isActive) {
        const result = await pool.query(
            `UPDATE platillo SET estado = $1 WHERE id = $2 RETURNING id`,
            [isActive, id],
        );
        return result.rows[0];
    },

    // un platillo que esta en una orden en proceso no se puede inhabilitar
    async isInActiveOrder(id) {
        const query = `
            SELECT 1
            FROM orden_platillo op
            INNER JOIN orden o ON o.id = op.orden_id
            WHERE op.platillo_id = $1
              AND o.estado IN ('ACTIVA', 'LISTA_PARA_ENTREGA')
            LIMIT 1;
        `;

        const result = await pool.query(query, [id]);
        return result.rowCount > 0;
    },
};
