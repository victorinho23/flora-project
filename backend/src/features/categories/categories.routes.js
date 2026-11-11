// backend/src/features/categories/categories.routes.js

import { Router } from "express";
import { categoriesController } from "./categories.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// GET /api/categories -> categorias del menu para el select
router.get("/", authenticateToken, categoriesController.getAll);

export default router;
