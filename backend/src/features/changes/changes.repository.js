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
};
