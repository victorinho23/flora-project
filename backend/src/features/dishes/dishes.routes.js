// backend/src/features/dishes/dishes.routes.js
// rutas del menu (platillos)

import { Router } from "express";
import { dishesController } from "./dishes.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { upload } from "../../config/upload.js";

const router = Router();

router.use(authenticateToken);

// GET /api/dishes
router.get("/", requirePermission("menu_listar"), dishesController.getAll);

// GET /api/dishes/report -> platillos filtrados para el reporte (antes de /:id)
router.get("/report", requirePermission("menu_reporte"), dishesController.report);

// GET /api/dishes/:id
router.get("/:id", requirePermission("menu_visualizar"), dishesController.getById);

// POST /api/dishes -> llega la imagen en dishImage
router.post("/", requirePermission("menu_agregar"), upload.single("dishImage"), dishesController.create);

// PUT /api/dishes/:id
router.put("/:id", requirePermission("menu_actualizar"), upload.single("dishImage"), dishesController.update);

// PATCH /api/dishes/:id/status
router.patch("/:id/status", requirePermission("menu_habilitar"), dishesController.updateStatus);

export default router;
