// backend/src/features/changes/changes.routes.js
// Rutas del registro de cambios

import { Router } from "express";
import { changesController } from "./changes.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

const router = Router();

router.use(authenticateToken);

// cada tabla pide el permiso de ver el detalle de su modulo
const VIEW_PERMISSION = {
    usuario: "usuarios_visualizar",
    platillo: "menu_visualizar",
    categoria: "menu_visualizar",
    orden: "ordenes_visualizar",
    producto: "inventario_visualizar",
    lote: "inventario_visualizar",
    proveedor: "proveedores_visualizar",
    mesa: "mesas_listar",
};

// revisa el permiso segun la tabla que piden
const byTable = (req, res, next) => {
    const permission = VIEW_PERMISSION[req.params.tabla];
    if (!permission) return res.status(400).json({ error: "No se puede consultar el historial de esa tabla" });
    return requirePermission(permission)(req, res, next);
};

// GET /api/changes/:tabla/:id -> historial de un registro (ej: /api/changes/usuario/2)
router.get("/:tabla/:id", byTable, changesController.getHistory);

export default router;
