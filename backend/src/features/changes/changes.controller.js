// backend/src/features/changes/changes.controller.js
// endpoint del historial de cambios

import { changesService } from "./changes.service.js";

export const changesController = {
    async getHistory(req, res) {
        try {
            const history = await changesService.getHistory({ tabla: req.params.tabla, registroId: req.params.id });
            res.status(200).json(history);
        } catch (err) {
            if (!err.status) console.error("ERROR HISTORIAL", err);
            res.status(err.status || 500).json({ error: err.status ? err.message : "No se pudo cargar el historial" });
        }
    },
};
