// backend/src/features/auth/auth.service.js
// Logica de autenticacion

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";
import { accessRepository } from "../access/access.repository.js";

// Intentos fallidos permitidos y minutos de bloqueo
const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 15;

// error con codigo http para que el controller responda bien
const httpError = (status, message) => Object.assign(new Error(message), { status });

export const authService = {
    async login({ email, password }) {
        if (!email || !password) {
            throw httpError(400, "Debe ingresar el correo y la contraseña");
        }

        const user = await authRepository.findByEmail(email);

        if (!user) {
            throw httpError(401, "El correo no está registrado en el sistema");
        }

        // si la cuenta esta bloqueada no deja intentar hasta que pase el tiempo
        if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
            const minutes = Math.ceil((new Date(user.bloqueado_hasta) - new Date()) / 60000);
            throw httpError(423, `Superaste los ${MAX_ATTEMPTS} intentos permitidos. Intenta de nuevo en ${minutes} minuto(s) o pide al administrador que desbloquee la cuenta.`);
        }

        if (!user.estado) {
            throw httpError(403, "La cuenta está inhabilitada. Comunícate con el administrador");
        }

        const isMatch = await bcrypt.compare(password, user.contrasena);

        if (!isMatch) {
            const attempt = await authRepository.registerFailedAttempt(user.id, MAX_ATTEMPTS, LOCK_MINUTES);
            if (attempt.bloqueado_hasta && new Date(attempt.bloqueado_hasta) > new Date()) {
                throw httpError(423, `Se bloqueó el acceso durante ${LOCK_MINUTES} minutos por ${MAX_ATTEMPTS} intentos fallidos consecutivos.`);
            }
            throw httpError(401, `Credenciales inválidas. Intento ${attempt.intentos_fallidos} de ${MAX_ATTEMPTS}.`);
        }

        await authRepository.registerSuccess(user.id);

        const token = jwt.sign(
            { id: user.id, email: user.correo_personal },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES },
        );

        // permisos del usuario para que el frontend sepa que puede hacer
        const permissions = user.is_superuser ? ["*"] : await accessRepository.getUserPermissions(user.id);

        return {
            token,
            user: {
                id: user.id,
                name: user.nombre,
                email: user.correo_personal,
                group: await authRepository.getUserGroup(user.id),
                isSuperuser: user.is_superuser,
                permissions,
            },
        };
    },
};
