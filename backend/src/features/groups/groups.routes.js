// backend/src/features/groups/groups.routes.js

import { Router } from "express";
import { groupsController } from "./groups.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

const router = Router();

// GET /api/groups
router.get("/", authenticateToken, groupsController.getAll);

// GET /api/groups/:groupId/permissions
router.get("/:groupId/permissions", authenticateToken, groupsController.getPermissionsByGroupId);

// PUT /api/groups/:groupId/permissions
router.put("/:groupId/permissions", authenticateToken, requirePermission("permisos_gestionar"), groupsController.updatePermissions);

export default router;
