// backend/src/features/tables/tables.controller.js

import { tablesService } from "./tables.service.js";

// 42P01 = no existe la tabla, 42703 = no existe la columna: pasa cuando falta correr una migracion
const MISSING_MIGRATION = ["42P01", "42703"];

const sendError = (res, err) => {
    if (MISSING_MIGRATION.includes(err.code)) {
        console.error("FALTA CORRER UNA MIGRACION", err.message);
        return res.status(500).json({ error: "La base de datos está desactualizada: corre las migraciones 0030 a 0035 y reinicia el backend" });
    }
    if (!err.status) console.error("ERROR BACKEND", err);
    res.status(err.status || 500).json({
        error: err.status ? err.message : "Error interno del servidor",
        field: err.field,
    });
};

export const tablesController = {
    async getAll(req, res) {
        try {
            res.json(await tablesService.getAll(req.query));
        } catch (err) {
            sendError(res, err);
        }
    },

    async create(req, res) {
        try {
            const id = await tablesService.create(req.body, req.user.id);
            res.status(201).json({ message: "Mesa creada", tableId: id });
        } catch (err) {
            sendError(res, err);
        }
    },

    async update(req, res) {
        try {
            await tablesService.update(Number(req.params.id), req.body, req.user.id);
            res.json({ message: "Mesa actualizada" });
        } catch (err) {
            sendError(res, err);
        }
    },

    async updateStatus(req, res) {
        try {
            await tablesService.updateStatus(Number(req.params.id), req.body, req.user.id);
            res.json({ message: "Estado de la mesa actualizado" });
        } catch (err) {
            sendError(res, err);
        }
    },


    async saveMap(req, res) {
        try {
            await tablesService.saveMap(req.body, req.user.id);
            res.json({ message: "Mapa guardado" });
        } catch (err) {
            sendError(res, err);
        }
    },
};
