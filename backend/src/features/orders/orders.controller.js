// backend/src/features/orders/orders.controller.js

import { ordersService } from "./orders.service.js";

const sendError = (res, err) => {
    console.error("ERROR BACKEND", err);
    res.status(err.status || 500).json({
        error: err.status ? err.message : "Error interno del servidor",
        field: err.field,
        activeOrderId: err.activeOrderId,
    });
};

export const ordersController = {
    async getAll(req, res) {
        try {
            res.json(await ordersService.getAll());
        } catch (err) {
            sendError(res, err);
        }
    },

    // ordenes para el reporte, los filtros llegan en la url (req.query)
    async report(req, res) {
        try {
            res.json(await ordersService.getReport(req.query));
        } catch (err) {
            sendError(res, err);
        }
    },

    async getById(req, res) {
        try {
            res.json(await ordersService.getById(Number(req.params.id)));
        } catch (err) {
            sendError(res, err);
        }
    },

    async create(req, res) {
        try {
            const order = await ordersService.create(req.body, req.user.id);
            res.status(201).json({ message: "La orden fue creada correctamente", orderId: order.id });
        } catch (err) {
            sendError(res, err);
        }
    },

    async update(req, res) {
        try {
            await ordersService.update(Number(req.params.id), req.body);
            res.json({ message: "La orden fue actualizada correctamente" });
        } catch (err) {
            sendError(res, err);
        }
    },

    async cancel(req, res) {
        try {
            await ordersService.cancel(Number(req.params.id), req.body, req.user.id);
            res.json({ message: "La orden ha sido anulada correctamente" });
        } catch (err) {
            sendError(res, err);
        }
    },
};
