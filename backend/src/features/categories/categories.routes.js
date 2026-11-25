// backend/src/features/categories/categories.routes.js

import { Router } from "express";
import { categoriesController } from "./categories.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

const router = Router();

router.use(authenticateToken);

// GET /api/categories -> categorias activas para el select (?all=1 trae tambien las inactivas)
router.get("/", categoriesController.getAll);

// POST /api/categories -> nueva categoria (mismo permiso que agregar al menu)
router.post("/", requirePermission("menu_agregar"), categoriesController.create);

// PUT /api/categories/:id -> cambiar el nombre
router.put("/:id", requirePermission("menu_actualizar"), categoriesController.update);

// PATCH /api/categories/:id/status -> habilitar o inhabilitar
router.patch("/:id/status", requirePermission("menu_habilitar"), categoriesController.updateStatus);

export default router;
