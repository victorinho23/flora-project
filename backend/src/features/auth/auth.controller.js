// backend/src/features/auth/auth.controller.js
// endpoints de login y recuperar contraseña

import { authService } from "./auth.service.js";

// arma un endpoint que llama al servicio y responde con lo que devuelva
const handle = (method) => async (req, res) => {
    try {
        const result = await authService[method](req.body ?? {});
        res.status(200).json(result);
    } catch (err) {
        if (!err.status) console.error(`ERROR ${method}`, err);
        // 42703 = la base no tiene la columna: falta correr la migracion del codigo
        // ECONNREFUSED = PostgreSQL apagado o con otro puerto en el .env
        const message = err.code === "42703"
            ? "Falta correr la migración 0029_alter_usuario_recuperacion.sql en la base de datos"
            : err.code === "ECONNREFUSED" || err.code === "3D000" || err.code === "28P01"
                ? "El servidor no se pudo conectar a la base de datos. Revisa que PostgreSQL esté encendido y los datos DB_ del .env"
                : err.status ? err.message : "No se pudo completar, intenta de nuevo";
        res.status(err.status || 500).json({ error: message, field: err.field });
    }
};

export const authController = {
    async login(req, res) {
        try {
            const result = await authService.login(req.body);

            res.status(200).json({
                message: "Login exitoso",
                ...result,
            });
        } catch (err) {
            // los errores conocidos (credenciales, bloqueo) se muestran; los internos no se cuentan
            if (!err.status) console.error("ERROR LOGIN", err);
            res.status(err.status || 500).json({
                error: err.status ? err.message : "No se pudo iniciar sesión, intenta de nuevo",
            });
        }
    },

    // los tres pasos de recuperar contraseña responden igual: el mensaje o el error conocido
    forgotPassword: handle("forgotPassword"),
    verifyCode: handle("verifyCode"),
    resetPassword: handle("resetPassword"),
};
