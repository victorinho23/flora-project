// backend/src/features/suppliers/suppliers.routes.js

import { Router } from "express";
import { suppliersController } from "./suppliers.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

const router = Router();

router.use(authenticateToken);

// GET /api/suppliers
router.get("/", requirePermission("proveedores_listar"), suppliersController.getAll);

// PUT /api/suppliers/contacts -> guarda telefonos y estados editados en la tabla
router.put("/contacts", requirePermission("proveedores_actualizar"), suppliersController.updateContacts);

// GET /api/suppliers/report -> proveedores filtrados para el reporte (antes de /:id)
router.get("/report", requirePermission("proveedores_reporte"), suppliersController.report);

// GET /api/suppliers/:id
router.get("/:id", requirePermission("proveedores_visualizar"), suppliersController.getById);

// POST /api/suppliers
router.post("/", requirePermission("proveedores_registrar"), suppliersController.create);

// PUT /api/suppliers/:id
router.put("/:id", requirePermission("proveedores_actualizar"), suppliersController.update);

// PATCH /api/suppliers/:id/status
router.patch("/:id/status", requirePermission("proveedores_habilitar"), suppliersController.updateStatus);

export default router;
