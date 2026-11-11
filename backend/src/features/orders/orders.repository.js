// backend/src/features/orders/orders.repository.js
// consultas de las ordenes y sus platillos (orden_platillo)

import { pool } from "../../config/db.js";

// cada orden con su mesero, total y la lista de platillos
const ORDER_SELECT = `
    SELECT
        o.id,
        o.numero_mesa::TEXT AS "tableNumber",
        o.mesero_id::TEXT AS "waiterId",
        u.nombre AS waiter,
        o.estado AS status,
        COALESCE(o.observaciones, '') AS notes,
        TO_CHAR(o.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') AS "createdAt",
        COALESCE(SUM(op.cantidad * op.precio_unitario), 0)::INTEGER AS total,
        COALESCE(SUM(op.cantidad), 0)::INTEGER AS quantity,
        COALESCE(STRING_AGG(p.nombre, ', ' ORDER BY p.nombre), '') AS product,
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'dishId', op.platillo_id::TEXT,
                    'dishName', p.nombre,
                    'price', op.precio_unitario,
                    'image', p.imagen,
                    'quantity', op.cantidad
                ) ORDER BY p.nombre
            ) FILTER (WHERE op.platillo_id IS NOT NULL),
            '[]'
        ) AS items
    FROM orden o
    INNER JOIN usuario u ON u.id = o.mesero_id
    LEFT JOIN orden_platillo op ON op.orden_id = o.id
    LEFT JOIN platillo p ON p.id = op.platillo_id
`;

export const ordersRepository = {
    async getAll() {
        const query = `
            ${ORDER_SELECT}
            GROUP BY o.id, u.nombre
            ORDER BY o.fecha_creacion DESC;
        `;

        const result = await pool.query(query);
        return result.rows;
    },

    // ordenes para el reporte, los filtros ya llegan limpios desde el service
    async report({ ids, status, table, waiter, from, to }) {
        const conditions = [];
        const values = [];

        if (ids.length) {
            values.push(ids);
            conditions.push(`o.id = ANY($${values.length}::INT[])`);
        }

        if (status) {
            values.push(status);
            conditions.push(`o.estado = $${values.length}`);
        }

        if (table) {
            values.push(table);
            conditions.push(`o.numero_mesa = $${values.length}`);
        }

        if (waiter) {
            values.push(waiter);
            conditions.push(`o.mesero_id = $${values.length}`);
        }

        // desde el inicio del dia "from"
        if (from) {
            values.push(from);
            conditions.push(`o.fecha_creacion >= $${values.length}::DATE`);
        }

        // hasta el final del dia "to" (menor al dia siguiente)
        if (to) {
            values.push(to);
            conditions.push(`o.fecha_creacion < $${values.length}::DATE + 1`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        // el WHERE va antes del GROUP BY
        const query = `
            ${ORDER_SELECT}
            ${where}
            GROUP BY o.id, u.nombre
            ORDER BY o.fecha_creacion DESC;
        `;

        const result = await pool.query(query, values);
        return result.rows;
    },

    async findById(id) {
        const query = `
            ${ORDER_SELECT}
            WHERE o.id = $1
            GROUP BY o.id, u.nombre;
        `;

        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    // una mesa solo puede tener una orden activa
    async findActiveByTable(tableNumber, excludeId = 0) {
        const query = `
            SELECT id
            FROM orden
            WHERE numero_mesa = $1
              AND estado IN ('ACTIVA', 'LISTA_PARA_ENTREGA')
              AND id <> $2
            LIMIT 1;
        `;

        const result = await pool.query(query, [tableNumber, excludeId]);
        return result.rows[0];
    },

    // precio actual y estado de los platillos que se van a pedir
    async getDishes(dishIds) {
        const query = `
            SELECT id, nombre, precio, estado
            FROM platillo
            WHERE id = ANY($1::INT[]);
        `;

        const result = await pool.query(query, [dishIds]);
        return result.rows;
    },

    async isActiveWaiter(userId) {
        const query = `
            SELECT 1
            FROM usuario
            WHERE id = $1 AND estado = TRUE;
        `;

        const result = await pool.query(query, [userId]);
        return result.rowCount > 0;
    },

    // crea la orden y sus platillos en una sola transaccion
    async create({ waiterId, tableNumber, notes, items }) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const result = await client.query(
                `
                INSERT INTO orden (mesero_id, numero_mesa, observaciones)
                VALUES ($1, $2, $3)
                RETURNING id;
                `,
                [waiterId, tableNumber, notes],
            );

            const orderId = result.rows[0].id;

            for (const item of items) {
                await client.query(
                    `
                    INSERT INTO orden_platillo (orden_id, platillo_id, cantidad, precio_unitario)
                    VALUES ($1, $2, $3, $4);
                    `,
                    [orderId, item.dishId, item.quantity, item.price],
                );
            }

            await client.query("COMMIT");
            return { id: orderId };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },

    // agrega platillos a una orden que ya existe, si el platillo ya estaba suma la cantidad
    async addItems(orderId, { notes, items }) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            for (const item of items) {
                await client.query(
                    `
                    INSERT INTO orden_platillo (orden_id, platillo_id, cantidad, precio_unitario)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (orden_id, platillo_id)
                    DO UPDATE SET cantidad = orden_platillo.cantidad + EXCLUDED.cantidad;
                    `,
                    [orderId, item.dishId, item.quantity, item.price],
                );
            }

            await client.query(
                `
                UPDATE orden
                SET observaciones = CASE WHEN $2 = '' THEN observaciones ELSE TRIM(BOTH ' · ' FROM CONCAT_WS(' · ', NULLIF(observaciones, ''), $2)) END,
                    fecha_actualizacion = NOW()
                WHERE id = $1;
                `,
                [orderId, notes ?? ""],
            );

            await client.query("COMMIT");
            return { id: orderId };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },

    // actualiza la orden y reemplaza sus platillos
    async update(orderId, { waiterId, tableNumber, notes, status, items }) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            await client.query(
                `
                UPDATE orden
                SET mesero_id = $1,
                    numero_mesa = $2,
                    observaciones = $3,
                    estado = $4,
                    fecha_actualizacion = NOW()
                WHERE id = $5;
                `,
                [waiterId, tableNumber, notes, status, orderId],
            );

            await client.query(`DELETE FROM orden_platillo WHERE orden_id = $1`, [orderId]);

            for (const item of items) {
                await client.query(
                    `
                    INSERT INTO orden_platillo (orden_id, platillo_id, cantidad, precio_unitario)
                    VALUES ($1, $2, $3, $4);
                    `,
                    [orderId, item.dishId, item.quantity, item.price],
                );
            }

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },

    async updateStatus(orderId, status) {
        await pool.query(
            `UPDATE orden SET estado = $1, fecha_actualizacion = NOW() WHERE id = $2`,
            [status, orderId],
        );
    },
};
