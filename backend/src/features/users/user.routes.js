// backend/src/features/users/user.routes.js
// Router permite modularizar las rutas por feature
// El router nunca implementa lógica, solo delega la ejecución al controller.

import { Router } from "express";
import { userController } from "./user.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";
import { upload } from "../../config/upload.js";

// Creamos una instancia del router de Express
const router = Router();

// todas las rutas de usuarios piden token
router.use(authenticateToken);

// GET /api/users -> lista de usuarios
router.get("/", requirePermission("usuarios_listar"), userController.getAll);

// GET /api/users/report -> usuarios filtrados para el reporte
// va antes de /:id para que "report" no se tome como un id
router.get("/report", requirePermission("usuarios_reporte"), userController.report);

// GET /api/users/options -> lista corta para los select (meseros, cuentadantes)
router.get("/options", userController.getOptions);

// GET /api/users/:id -> un usuario
router.get("/:id", requirePermission("usuarios_visualizar"), userController.getById);

// POST /api/users -> aqui se procesa multipart/form-data con la foto de perfil
router.post("/", requirePermission("usuarios_crear"), upload.single("userImage"), userController.create);

// PUT /api/users/:id -> actualizar cuenta
router.put("/:id", requirePermission("usuarios_actualizar"), upload.single("userImage"), userController.update);

// PATCH /api/users/:id/status -> habilitar o inhabilitar
router.patch("/:id/status", requirePermission("usuarios_habilitar"), userController.updateStatus);

// permisos individuales del usuario (user_permissions)
router.get("/:id/permissions", requirePermission("permisos_gestionar"), userController.getPermissions);
router.put("/:id/permissions", requirePermission("permisos_gestionar"), userController.updatePermissions);

// Exportamos el router para ser registrado en la aplicacion principal
export default router;
