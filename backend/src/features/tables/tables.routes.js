// backend/src/features/tables/tables.routes.js
// CRUD de las mesas (Configuracion)

import { Router } from "express";
import { tablesController } from "./tables.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

const router = Router();

router.use(authenticateToken);

// GET /api/tables -> todas las mesas, las zonas y el mapa (?active=1 solo las activas)
router.get("/", requirePermission("mesas_listar"), tablesController.getAll);

// POST /api/tables -> nueva mesa
router.post("/", requirePermission("mesas_crear"), tablesController.create);

// PUT /api/tables/map -> guardar el mapa del restaurante y donde quedo cada mesa
router.put("/map", requirePermission("mesas_actualizar"), tablesController.saveMap);

// PUT /api/tables/:id -> cambiar numero, capacidad o zona
router.put("/:id", requirePermission("mesas_actualizar"), tablesController.update);

// PATCH /api/tables/:id/status -> habilitar o deshabilitar
router.patch("/:id/status", requirePermission("mesas_habilitar"), tablesController.updateStatus);

export default router;
