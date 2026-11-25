// backend/src/features/orders/orders.controller.js

import { ordersService } from "./orders.service.js";

// 42P01 = no existe la tabla, 42703 = no existe la columna: pasa cuando falta correr una migracion
const MISSING_MIGRATION = ["42P01", "42703"];

const sendError = (res, err) => {
    if (MISSING_MIGRATION.includes(err.code)) {
        console.error("FALTA CORRER UNA MIGRACION", err.message);
        return res.status(500).json({ error: "La base de datos está desactualizada: corre las migraciones 0030 a 0036 y reinicia el backend" });
    }
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

    // plano de mesas: total de mesas del restaurante y las que tienen una orden abierta
    async getTables(req, res) {
        try {
            res.json(await ordersService.getTables());
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
            await ordersService.update(Number(req.params.id), req.body, req.user.id);
            res.json({ message: "La orden fue actualizada correctamente" });
        } catch (err) {
            sendError(res, err);
        }
    },

    // cambia el estado de la orden (lista para entrega, pagada...)
    async changeStatus(req, res) {
        try {
            await ordersService.changeStatus(Number(req.params.id), req.body, req.user.id);
            res.json({ message: "El estado de la orden fue actualizado" });
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
