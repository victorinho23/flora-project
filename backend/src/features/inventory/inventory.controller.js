// backend/src/features/inventory/inventory.controller.js

import { inventoryService } from "./inventory.service.js";

const sendError = (res, err) => {
    console.error("ERROR BACKEND", err);
    res.status(err.status || 500).json({
        error: err.status ? err.message : "Error interno del servidor",
        field: err.field,
    });
};

export const inventoryController = {
    async getAll(req, res) {
        try {
            res.json(await inventoryService.getAll());
        } catch (err) {
            sendError(res, err);
        }
    },

    // productos del inventario para el reporte, los filtros llegan en la url (req.query)
    async report(req, res) {
        try {
            res.json(await inventoryService.getReport(req.query));
        } catch (err) {
            sendError(res, err);
        }
    },

    async getOptions(req, res) {
        try {
            res.json(await inventoryService.getOptions());
        } catch (err) {
            sendError(res, err);
        }
    },

    async getById(req, res) {
        try {
            res.json(await inventoryService.getById(req.params.id));
        } catch (err) {
            sendError(res, err);
        }
    },

    async create(req, res) {
        try {
            const product = await inventoryService.create(req.body, req.file);
            res.status(201).json({ message: "El producto fue añadido al inventario correctamente", productId: product.id });
        } catch (err) {
            sendError(res, err);
        }
    },

    async update(req, res) {
        try {
            await inventoryService.update(req.params.id, req.body, req.file);
            res.json({ message: "Inventario actualizado exitosamente" });
        } catch (err) {
            sendError(res, err);
        }
    },

    async updateStatus(req, res) {
        try {
            await inventoryService.updateStatus(req.params.id, req.body, req.user.id);
            res.json({ message: "Estado actualizado" });
        } catch (err) {
            sendError(res, err);
        }
    },

    async updateQuantities(req, res) {
        try {
            await inventoryService.updateQuantities(req.body.items);
            res.json({ message: "Los cambios del inventario se guardaron correctamente" });
        } catch (err) {
            sendError(res, err);
        }
    },
};
