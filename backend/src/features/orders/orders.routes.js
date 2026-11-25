// backend/src/features/orders/orders.routes.js

import { Router } from "express";
import { ordersController } from "./orders.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission, requireAnyPermission } from "../../middlewares/permission.middleware.js";

const router = Router();

router.use(authenticateToken);

// GET /api/orders
router.get("/", requirePermission("ordenes_listar"), ordersController.getAll);

// GET /api/orders/tables -> plano de mesas: cuantas hay y cuales estan ocupadas (antes de /:id)
router.get("/tables", requireAnyPermission("ordenes_listar", "ordenes_crear", "ordenes_actualizar"), ordersController.getTables);

// GET /api/orders/report -> ordenes filtradas para el reporte (antes de /:id)
router.get("/report", requirePermission("ordenes_reporte"), ordersController.report);

// GET /api/orders/:id
router.get("/:id", requirePermission("ordenes_visualizar"), ordersController.getById);

// POST /api/orders
router.post("/", requirePermission("ordenes_crear"), ordersController.create);

// PUT /api/orders/:id
router.put("/:id", requirePermission("ordenes_actualizar"), ordersController.update);

// PATCH /api/orders/:id/status -> avanzar la orden (lista para entrega, pagada), usa el mismo permiso de actualizar
router.patch("/:id/status", requirePermission("ordenes_actualizar"), ordersController.changeStatus);

// PATCH /api/orders/:id/cancel -> anular orden
router.patch("/:id/cancel", requirePermission("ordenes_anular"), ordersController.cancel);

export default router;
