// backend/src/features/auth/auth.routes.js
// Rutas de autenticacion

import { Router } from "express";
import { authController } from "./auth.controller.js";
import { rateLimit } from "../../middlewares/rateLimit.middleware.js";

const router = Router();

// maximo 10 intentos de login cada 15 minutos desde el mismo equipo
const loginLimit = rateLimit({ max: 10, windowMinutes: 15, message: "Demasiados intentos de inicio de sesión." });

// recuperar contraseña: pocas veces por equipo para que no lo usen para mandar correos sin fin
const recoveryLimit = rateLimit({ max: 5, windowMinutes: 15, message: "Ya pediste varios códigos." });
const codeLimit = rateLimit({ max: 15, windowMinutes: 15, message: "Demasiados intentos con el código." });

// POST /api/auth/login
router.post("/login", loginLimit, authController.login);

// POST /api/auth/forgot-password  -> manda el codigo al correo
router.post("/forgot-password", recoveryLimit, authController.forgotPassword);

// POST /api/auth/verify-code  -> revisa el codigo y da permiso para cambiar la contraseña
router.post("/verify-code", codeLimit, authController.verifyCode);

// POST /api/auth/reset-password  -> guarda la contraseña nueva
router.post("/reset-password", codeLimit, authController.resetPassword);

export default router;
