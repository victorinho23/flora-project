// backend/src/features/changes/changes.service.js
// historial del registro de cambios

import { changesRepository } from "./changes.repository.js";

// error con codigo http para que el controller responda bien
const httpError = (status, message) => Object.assign(new Error(message), { status });

// tablas que se pueden consultar
export const TABLES = ["usuario", "platillo", "categoria", "orden", "producto", "lote", "proveedor", "mesa"];

export const changesService = {
    async getHistory({ tabla, registroId }) {
        if (!TABLES.includes(tabla)) throw httpError(400, "No se puede consultar el historial de esa tabla");
        if (!registroId) throw httpError(400, "Falta el registro a consultar");

        const rows = await changesRepository.findByRecord(tabla, registroId);

        // con la forma que usa el frontend
        return rows.map((row) => ({
            id: row.id,
            action: row.accion,
            reason: row.motivo,
            date: row.fecha,
            userId: row.usuario_id,
            userName: row.usuario_nombre,
        }));
    },
};
