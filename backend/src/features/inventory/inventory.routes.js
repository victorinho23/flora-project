// backend/src/features/inventory/inventory.routes.js

import { Router } from "express";
import { inventoryController } from "./inventory.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { upload } from "../../config/upload.js";

const router = Router();

router.use(authenticateToken);

// GET /api/inventory
router.get("/", requirePermission("inventario_listar"), inventoryController.getAll);

// GET /api/inventory/options -> productos para asociar a proveedores
router.get("/options", inventoryController.getOptions);

// PUT /api/inventory/quantities -> guarda las cantidades editadas en la tabla
router.put("/quantities", requirePermission("inventario_actualizar"), inventoryController.updateQuantities);

// GET /api/inventory/report -> productos filtrados para el reporte (antes de /:id)
router.get("/report", requirePermission("inventario_reporte"), inventoryController.report);

// GET /api/inventory/:id
router.get("/:id", requirePermission("inventario_visualizar"), inventoryController.getById);

// POST /api/inventory -> llega la imagen en image
router.post("/", requirePermission("inventario_crear"), upload.single("image"), inventoryController.create);

// PUT /api/inventory/:id
router.put("/:id", requirePermission("inventario_actualizar"), upload.single("image"), inventoryController.update);

// PATCH /api/inventory/:id/status
router.patch("/:id/status", requirePermission("inventario_estado"), inventoryController.updateStatus);

export default router;
