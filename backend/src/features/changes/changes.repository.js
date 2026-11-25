// backend/src/features/changes/changes.repository.js
// guarda en registro_cambios quien hizo un cambio, en que tabla y por que

import { pool } from "../../config/db.js";

export const changesRepository = {
    // db puede ser el pool o el client de una transaccion
    async create({ usuarioId, tabla, registroId, accion, motivo = null }, db = pool) {
        const query = `
            INSERT INTO registro_cambios (usuario_id, tabla, registro_id, accion, motivo)
            VALUES ($1, $2, $3, $4, $5);
        `;

        // el motivo solo se guarda si es un texto con algo escrito
        const reason = typeof motivo === "string" && motivo.trim() ? motivo.trim() : null;

        await db.query(query, [usuarioId, tabla, String(registroId), accion, reason]);
    },

    // historial de un registro: lo mas nuevo primero, con el nombre de quien hizo el cambio
    async findByRecord(tabla, registroId, limit = 30) {
        const query = `
            SELECT rc.id, rc.accion, rc.motivo, rc.fecha,
                   u.id AS usuario_id, u.nombre AS usuario_nombre
            FROM registro_cambios rc
            INNER JOIN usuario u
                ON u.id = rc.usuario_id
            WHERE rc.tabla = $1
              AND rc.registro_id = $2
            ORDER BY rc.fecha DESC, rc.id DESC
            LIMIT $3;
        `;

        const result = await pool.query(query, [tabla, String(registroId), limit]);

        return result.rows;
    },
};
