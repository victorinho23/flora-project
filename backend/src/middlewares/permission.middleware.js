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

// igual que requirePermission, pero deja pasar a la persona cuando consulta SU propio registro
// (ej. "Mi perfil": cualquiera puede ver sus datos, ver los de otros necesita el permiso)
export const requirePermissionOrSelf = (permissionCode) => {
    const check = requirePermission(permissionCode);
    return (req, res, next) => {
        if (String(req.params.id) === String(req.user.id)) return next();
        return check(req, res, next);
    };
};

// deja pasar si la persona tiene AL MENOS UNO de los permisos
// (ej. el plano de mesas lo necesita quien lista ordenes y tambien quien las crea)
export const requireAnyPermission = (...permissionCodes) => {
    return async (req, res, next) => {
        try {
            for (const code of permissionCodes) {
                if (await accessService.hasPermission(req.user.id, code)) return next();
            }
            return res.status(403).json({ error: "No tienes permisos para realizar esta accion" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error verificando permisos" });
        }
    };
};
