// backend/src/features/users/user.controller.js
// El controller NO implementa lógica de negocio,
// solo delega la operacion al service correspondiente.

import { userService } from "./user.service.js";

// responde el error con su codigo, si no trae codigo es un error del servidor
const sendError = (res, err) => {
    console.error("ERROR BACKEND", err);
    res.status(err.status || 500).json({
        error: err.status ? err.message : "Error interno del servidor",
        field: err.field,
    });
};

export const userController = {
    // Método encargado de manejar la creacion de un usuario
    async create(req, res) {
        try {
            // req.file es la foto de perfil que llega por multer
            const user = await userService.createUser(req.body, req.file);

            // 201: recurso creado correctamente según el estándar REST
            res.status(201).json({
                message: "Usuario creado correctamente",
                userId: user.id,
            });
        } catch (err) {
            sendError(res, err);
        }
    },

    // devuelve la lista de usuarios
    async getAll(req, res) {
        try {
            const users = await userService.getUser();
            res.json(users);
        } catch (err) {
            sendError(res, err);
        }
    },

    // usuarios para el reporte, los filtros llegan en la url (req.query)
    async report(req, res) {
        try {
            const users = await userService.getReport(req.query);
            res.json(users);
        } catch (err) {
            sendError(res, err);
        }
    },

    async getOptions(req, res) {
        try {
            const users = await userService.getOptions();
            res.json(users);
        } catch (err) {
            sendError(res, err);
        }
    },

    async getById(req, res) {
        try {
            const user = await userService.getById(Number(req.params.id));
            res.json(user);
        } catch (err) {
            sendError(res, err);
        }
    },

    async update(req, res) {
        try {
            await userService.updateUser(Number(req.params.id), req.body, req.file, req.user.id);
            res.json({ message: "Cuenta actualizada exitosamente" });
        } catch (err) {
            sendError(res, err);
        }
    },

    async updateStatus(req, res) {
        try {
            await userService.updateStatus(Number(req.params.id), req.body, req.user.id);
            res.json({ message: "Cuenta actualizada exitosamente" });
        } catch (err) {
            sendError(res, err);
        }
    },

    async getPermissions(req, res) {
        try {
            const permissions = await userService.getPermissions(Number(req.params.id));
            res.json(permissions);
        } catch (err) {
            sendError(res, err);
        }
    },

    async updatePermissions(req, res) {
        try {
            await userService.updatePermissions(Number(req.params.id), req.body.permissionIds);
            res.json({ message: "Permisos actualizados correctamente" });
        } catch (err) {
            sendError(res, err);
        }
    },
};
