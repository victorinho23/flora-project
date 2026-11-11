// backend/src/features/suppliers/suppliers.controller.js

import { suppliersService } from "./suppliers.service.js";

const sendError = (res, err) => {
    console.error("ERROR BACKEND", err);
    res.status(err.status || 500).json({
        error: err.status ? err.message : "Error interno del servidor",
        field: err.field,
    });
};

export const suppliersController = {
    async getAll(req, res) {
        try {
            res.json(await suppliersService.getAll());
        } catch (err) {
            sendError(res, err);
        }
    },

    // proveedores para el reporte, los filtros llegan en la url (req.query)
    async report(req, res) {
        try {
            res.json(await suppliersService.getReport(req.query));
        } catch (err) {
            sendError(res, err);
        }
    },

    async getById(req, res) {
        try {
            res.json(await suppliersService.getById(Number(req.params.id)));
        } catch (err) {
            sendError(res, err);
        }
    },

    async create(req, res) {
        try {
            const supplier = await suppliersService.create(req.body);
            res.status(201).json({ message: "Proveedor registrado correctamente.", supplierId: supplier.id });
        } catch (err) {
            sendError(res, err);
        }
    },

    async update(req, res) {
        try {
            await suppliersService.update(Number(req.params.id), req.body);
            res.json({ message: "Proveedor actualizado correctamente." });
        } catch (err) {
            sendError(res, err);
        }
    },

    async updateStatus(req, res) {
        try {
            await suppliersService.updateStatus(Number(req.params.id), req.body, req.user.id);
            res.json({ message: "Estado actualizado" });
        } catch (err) {
            sendError(res, err);
        }
    },

    async updateContacts(req, res) {
        try {
            await suppliersService.updateContacts(req.body.items);
            res.json({ message: "Proveedores actualizados correctamente" });
        } catch (err) {
            sendError(res, err);
        }
    },
};
