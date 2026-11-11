// backend/src/features/permissions/permissions.routes.js

import { Router } from "express";
import { permissionsController } from "./permissions.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// GET /api/permissions
router.get("/", authenticateToken, permissionsController.getAll);

export default router;
