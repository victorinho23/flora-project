// backend/src/features/dishes/dishes.controller.js

import { dishesService } from "./dishes.service.js";

const sendError = (res, err) => {
    console.error("ERROR BACKEND", err);
    res.status(err.status || 500).json({
        error: err.status ? err.message : "Error interno del servidor",
        field: err.field,
    });
};

export const dishesController = {
    async getAll(req, res) {
        try {
            res.json(await dishesService.getAll());
        } catch (err) {
            sendError(res, err);
        }
    },

    // platillos para el reporte, los filtros llegan en la url (req.query)
    async report(req, res) {
        try {
            res.json(await dishesService.getReport(req.query));
        } catch (err) {
            sendError(res, err);
        }
    },

    async getById(req, res) {
        try {
            res.json(await dishesService.getById(Number(req.params.id)));
        } catch (err) {
            sendError(res, err);
        }
    },

    async create(req, res) {
        try {
            const dish = await dishesService.create(req.body, req.file);
            res.status(201).json({ message: "Platillo registrado correctamente", dishId: dish.id });
        } catch (err) {
            sendError(res, err);
        }
    },

    async update(req, res) {
        try {
            await dishesService.update(Number(req.params.id), req.body, req.file);
            res.json({ message: "El menú ha sido actualizado correctamente" });
        } catch (err) {
            sendError(res, err);
        }
    },

    async updateStatus(req, res) {
        try {
            await dishesService.updateStatus(Number(req.params.id), req.body, req.user.id);
            res.json({ message: "Estado actualizado" });
        } catch (err) {
            sendError(res, err);
        }
    },
};
