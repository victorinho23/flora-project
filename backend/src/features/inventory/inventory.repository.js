// backend/src/features/inventory/inventory.repository.js
// cada fila del inventario es un producto con los datos de su ultimo lote

import { pool } from "../../config/db.js";
import { brandsRepository } from "../brands/brands.repository.js";

const PRODUCT_SELECT = `
    SELECT
        p.id,
        m.nombre AS brand,
        p.nombre AS name,
        p.codigo_barras AS barcode,
        p.imagen AS image,
        l.cantidad AS quantity,
        totals.total_quantity AS "totalQuantity",
        p.valor_unitario AS "unitValue",
        (totals.total_quantity * p.valor_unitario)::INTEGER AS "totalValue",
        l.estado AS status,
        TO_CHAR(l.fecha_vencimiento, 'DD/MM/YYYY') AS "expirationDate",
        COALESCE(p.descripcion, '') AS description,
        p.cuentadante_id::TEXT AS custodian,
        u.nombre AS "custodianName",
        p.cantidad_minima AS "minQuantity",
        l.numero_lote AS batch,
        COALESCE(p.ubicacion, '') AS location
    FROM producto p
    INNER JOIN marca m ON m.id = p.marca_id
    INNER JOIN usuario u ON u.id = p.cuentadante_id
    -- ultimo lote del producto
    INNER JOIN LATERAL (
        SELECT cantidad, estado, fecha_vencimiento, numero_lote
        FROM lote
        WHERE producto_id = p.id
        ORDER BY numero_lote DESC
        LIMIT 1
    ) l ON TRUE
    -- suma de todos los lotes
    INNER JOIN LATERAL (
        SELECT COALESCE(SUM(cantidad), 0)::INTEGER AS total_quantity
        FROM lote
        WHERE producto_id = p.id
    ) totals ON TRUE
`;

export const inventoryRepository = {
    async getAll() {
        const result = await pool.query(`${PRODUCT_SELECT} ORDER BY p.nombre;`);
        return result.rows;
    },

    // productos para el reporte, los filtros ya llegan limpios desde el service
    async report({ ids, status, brand }) {
        const conditions = [];
        const values = [];

        // los ids del inventario son texto (ej: P001)
        if (ids.length) {
            values.push(ids);
            conditions.push(`p.id = ANY($${values.length}::TEXT[])`);
        }

        // el estado es el del ultimo lote (l)
        if (status) {
            values.push(status);
            conditions.push(`l.estado = $${values.length}`);
        }

        if (brand) {
            values.push(brand);
            conditions.push(`m.nombre = $${values.length}`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const result = await pool.query(`${PRODUCT_SELECT} ${where} ORDER BY p.nombre;`, values);
        return result.rows;
    },

    async findById(id) {
        const result = await pool.query(`${PRODUCT_SELECT} WHERE p.id = $1;`, [id]);
        return result.rows[0];
    },

    // revisa que el id y el codigo de barras no esten repetidos
    async findDuplicates({ id, barcode, excludeId = "" }) {
        const query = `
            SELECT
                BOOL_OR(id = $1) AS id,
                BOOL_OR(codigo_barras = $2) AS barcode
            FROM producto
            WHERE id <> $3;
        `;

        const result = await pool.query(query, [id, barcode, excludeId]);
        return result.rows[0];
    },

    // crea la marca si es nueva, el producto y su primer lote
    async create(product) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const brandId = await brandsRepository.findOrCreate(product.brand, client);

            await client.query(
                `
                INSERT INTO producto (
                    id, marca_id, cuentadante_id, codigo_barras, nombre, imagen,
                    cantidad_minima, valor_unitario, descripcion, ubicacion
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
                `,
                [product.id, brandId, product.custodian, product.barcode, product.name, product.image,
                 product.minQuantity, product.unitValue, product.description, product.location],
            );

            await client.query(
                `
                INSERT INTO lote (producto_id, numero_lote, cantidad, fecha_vencimiento, estado)
                VALUES ($1, 1, $2, $3, $4);
                `,
                [product.id, product.quantity, product.expirationDate, product.status],
            );

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },

    // actualiza el producto y su ultimo lote, la imagen solo si llega una nueva
    async update(id, product) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const brandId = await brandsRepository.findOrCreate(product.brand, client);

            await client.query(
                `
                UPDATE producto
                SET marca_id = $1,
                    cuentadante_id = $2,
                    codigo_barras = $3,
                    nombre = $4,
                    imagen = COALESCE($5, imagen),
                    cantidad_minima = $6,
                    valor_unitario = $7,
                    descripcion = $8,
                    ubicacion = $9
                WHERE id = $10;
                `,
                [brandId, product.custodian, product.barcode, product.name, product.image,
                 product.minQuantity, product.unitValue, product.description, product.location, id],
            );

            await client.query(
                `
                UPDATE lote
                SET cantidad = $1,
                    fecha_vencimiento = $2,
                    estado = $3
                WHERE producto_id = $4
                  AND numero_lote = (SELECT MAX(numero_lote) FROM lote WHERE producto_id = $4);
                `,
                [product.quantity, product.expirationDate, product.status, id],
            );

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },

    // cambia el estado del ultimo lote del producto
    async updateStatus(id, status) {
        await pool.query(
            `
            UPDATE lote
            SET estado = $1
            WHERE producto_id = $2
              AND numero_lote = (SELECT MAX(numero_lote) FROM lote WHERE producto_id = $2);
            `,
            [status, id],
        );
    },

    // guarda las cantidades editadas en la tabla de actualizar inventario
    async updateQuantities(items) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            for (const item of items) {
                await client.query(
                    `
                    UPDATE lote
                    SET cantidad = $1
                    WHERE producto_id = $2
                      AND numero_lote = (SELECT MAX(numero_lote) FROM lote WHERE producto_id = $2);
                    `,
                    [item.quantity, item.id],
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
