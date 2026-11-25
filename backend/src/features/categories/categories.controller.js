// backend/src/features/categories/categories.controller.js

import { categoriesService } from "./categories.service.js";

const sendError = (res, err) => {
    console.error("ERROR BACKEND", err);
    res.status(err.status || 500).json({
        error: err.status ? err.message : "Error interno del servidor",
        field: err.field,
    });
};

export const categoriesController = {
    async getAll(req, res) {
        try {
            res.json(await categoriesService.getAll(req.query));
        } catch (err) {
            sendError(res, err);
        }
    },

    async create(req, res) {
        try {
            const id = await categoriesService.create(req.body, req.user.id);
            res.status(201).json({ message: "Categoría creada", categoryId: id });
        } catch (err) {
            sendError(res, err);
        }
    },

    async update(req, res) {
        try {
            await categoriesService.update(Number(req.params.id), req.body, req.user.id);
            res.json({ message: "Categoría actualizada" });
        } catch (err) {
            sendError(res, err);
        }
    },

    async updateStatus(req, res) {
        try {
            await categoriesService.updateStatus(Number(req.params.id), req.body, req.user.id);
            res.json({ message: "Estado de la categoría actualizado" });
        } catch (err) {
            sendError(res, err);
        }
    },
};
