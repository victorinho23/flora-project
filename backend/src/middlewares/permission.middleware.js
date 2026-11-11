// backend/src/middlewares/permission.middleware.js
// revisa si el usuario del token tiene el permiso que pide la ruta

import { accessService } from "../features/access/access.service.js";

export const requirePermission = (permissionCode) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;

            const granted = await accessService.hasPermission(userId, permissionCode);

            if (!granted) {
                return res.status(403).json({
                    error: "No tienes permisos para realizar esta accion",
                });
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: "Error verificando permisos",
            });
        }
    };
};
