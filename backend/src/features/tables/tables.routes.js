// backend/src/features/tables/tables.routes.js
// CRUD de las mesas (Configuracion)

import { Router } from "express";
import { tablesController } from "./tables.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission, requireAnyPermission } from "../../middlewares/permission.middleware.js";

const router = Router();

router.use(authenticateToken);

// GET /api/tables -> todas las mesas, las zonas y los pisos del mapa (?active=1 solo las activas)
router.get("/", requirePermission("mesas_listar"), tablesController.getAll);

// POST /api/tables -> nueva mesa
router.post("/", requirePermission("mesas_crear"), tablesController.create);

// PATCH /api/tables/:id/occupancy -> el mesero marca la mesa ocupada (clientes sentados) o la libera
router.patch("/:id/occupancy", requireAnyPermission("ordenes_crear", "ordenes_actualizar"), tablesController.setOccupied);

// pisos del mapa del restaurante (solo quien puede actualizar mesas, o sea el administrador)
// POST /api/tables/map -> piso nuevo; PUT /api/tables/map/:id -> guardar el dibujo y las mesas del piso
// DELETE /api/tables/map/:id -> borrar el piso (sus mesas quedan sin ubicar)
router.post("/map", requirePermission("mesas_actualizar"), tablesController.createMap);
router.put("/map/:id", requirePermission("mesas_actualizar"), tablesController.saveMap);
router.delete("/map/:id", requirePermission("mesas_actualizar"), tablesController.removeMap);

// PUT /api/tables/:id -> cambiar numero, capacidad o zona
router.put("/:id", requirePermission("mesas_actualizar"), tablesController.update);

// PATCH /api/tables/:id/status -> habilitar o deshabilitar
router.patch("/:id/status", requirePermission("mesas_habilitar"), tablesController.updateStatus);

export default router;
