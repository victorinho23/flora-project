// backend/src/features/access/access.routes.js

import { Router } from "express";
import { accessController } from "./access.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// GET /api/access/check/:permissionCode
// ej: http://localhost:4000/api/access/check/usuarios_crear
router.get("/check/:permissionCode", authenticateToken, accessController.checkPermission);

export default router;
