// backend/src/features/brands/brands.routes.js

import { Router } from "express";
import { brandsController } from "./brands.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// GET /api/brands -> marcas para el select del inventario
router.get("/", authenticateToken, brandsController.getAll);

export default router;
