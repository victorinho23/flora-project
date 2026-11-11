// backend/src/features/suppliers/suppliers.repository.js
// consultas de proveedores y de los productos que suministran (proveedor_producto)

import { pool } from "../../config/db.js";

const SUPPLIER_SELECT = `
    SELECT
        s.id,
        s.nombre AS "companyName",
        s.tipo_documento AS "documentType",
        s.numero_documento AS nit,
        '' AS "contactName",
        s.numero_contacto AS phone,
        s.correo_empresa AS email,
        COALESCE(s.direccion, '') AS address,
        s.categoria AS category,
        s.estado AS "isActive",
        COALESCE(s.observaciones, '') AS observations,
        COALESCE(
            JSON_AGG(sp.producto_id ORDER BY sp.producto_id) FILTER (WHERE sp.producto_id IS NOT NULL),
            '[]'
        ) AS products,
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', p.id,
                    'name', p.nombre,
                    -- estado del ultimo lote del producto
                    'status', (SELECT l.estado FROM lote l WHERE l.producto_id = p.id ORDER BY l.numero_lote DESC LIMIT 1)
                ) ORDER BY p.nombre
            ) FILTER (WHERE p.id IS NOT NULL),
            '[]'
        ) AS "productList"
    FROM proveedor s
    LEFT JOIN proveedor_producto sp ON sp.proveedor_id = s.id
    LEFT JOIN producto p ON p.id = sp.producto_id
`;

export const suppliersRepository = {
    async getAll() {
        const result = await pool.query(`${SUPPLIER_SELECT} GROUP BY s.id ORDER BY s.nombre;`);
        return result.rows;
    },

    // proveedores para el reporte, los filtros ya llegan limpios desde el service
    async report({ ids, status, documentType, product }) {
        const conditions = [];
        const values = [];

        if (ids.length) {
            values.push(ids);
            conditions.push(`s.id = ANY($${values.length}::INT[])`);
        }

        if (status !== undefined) {
            values.push(status);
            conditions.push(`s.estado = $${values.length}`);
        }

        if (documentType) {
            values.push(documentType);
            conditions.push(`s.tipo_documento = $${values.length}`);
        }

        // con EXISTS se revisa el producto sin quitar los demas productos de la lista
        if (product) {
            values.push(product);
            conditions.push(`EXISTS (
                SELECT 1 FROM proveedor_producto pp
                WHERE pp.proveedor_id = s.id AND pp.producto_id = $${values.length}
            )`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const result = await pool.query(`${SUPPLIER_SELECT} ${where} GROUP BY s.id ORDER BY s.nombre;`, values);
        return result.rows;
    },

    async findById(id) {
        const result = await pool.query(`${SUPPLIER_SELECT} WHERE s.id = $1 GROUP BY s.id;`, [id]);
        return result.rows[0];
    },

    async existsDocument(documentNumber, excludeId = 0) {
        const result = await pool.query(
            `SELECT 1 FROM proveedor WHERE numero_documento = $1 AND id <> $2 LIMIT 1`,
            [documentNumber, excludeId],
        );
        return result.rowCount > 0;
    },

    // guarda el proveedor (nuevo o editado) y reemplaza sus productos
    async save(supplier, id = null) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const values = [
                supplier.documentType,
                supplier.documentNumber,
                supplier.companyName,
                supplier.phone,
                supplier.email,
                supplier.address,
                supplier.category,
                supplier.isActive,
                supplier.observations,
            ];

            let supplierId = id;

            if (id) {
                await client.query(
                    `
                    UPDATE proveedor
                    SET tipo_documento = $1,
                        numero_documento = $2,
                        nombre = $3,
                        numero_contacto = $4,
                        correo_empresa = $5,
                        direccion = $6,
                        categoria = $7,
                        estado = $8,
                        observaciones = $9
                    WHERE id = $10;
                    `,
                    [...values, id],
                );
            } else {
                const result = await client.query(
                    `
                    INSERT INTO proveedor (
                        tipo_documento, numero_documento, nombre, numero_contacto,
                        correo_empresa, direccion, categoria, estado, observaciones
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id;
                    `,
                    values,
                );
                supplierId = result.rows[0].id;
            }

            await client.query(`DELETE FROM proveedor_producto WHERE proveedor_id = $1`, [supplierId]);

            for (const productId of supplier.products) {
                await client.query(
                    `
                    INSERT INTO proveedor_producto (proveedor_id, producto_id)
                    VALUES ($1, $2);
                    `,
                    [supplierId, productId],
                );
            }

            await client.query("COMMIT");
            return { id: supplierId };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },

    async updateStatus(id, isActive) {
        await pool.query(`UPDATE proveedor SET estado = $1 WHERE id = $2`, [isActive, id]);
    },

    // guarda el telefono y el estado editados en la tabla de actualizar proveedores
    async updateContacts(items) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            for (const item of items) {
                await client.query(
                    `UPDATE proveedor SET numero_contacto = $1, estado = $2 WHERE id = $3`,
                    [item.phone, item.isActive, item.id],
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
};
