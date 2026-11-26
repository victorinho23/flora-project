// backend/src/features/auth/auth.service.js
// Logica de autenticacion

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomInt } from "node:crypto";
import { authRepository } from "./auth.repository.js";
import { accessService } from "../access/access.service.js";
import { changesRepository } from "../changes/changes.repository.js";
import { sendMail } from "../../config/mail.js";

// Intentos fallidos permitidos y minutos de bloqueo
const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 15;

// recuperar contraseña: minutos que sirve el codigo y veces que se puede escribir mal
const CODE_MINUTES = 10;
const MAX_CODE_ATTEMPTS = 5;

// mismas reglas de la contraseña que en el formulario de usuarios
const PASSWORD_RULES = [
    [(value) => value.length === 10, "La contraseña debe tener exactamente 10 caracteres"],
    [(value) => /[A-Z]/.test(value), "Debe contener al menos una mayúscula"],
    [(value) => /[a-z]/.test(value), "Debe contener al menos una minúscula"],
    [(value) => /[0-9]/.test(value), "Debe contener al menos un número"],
    [(value) => /[^A-Za-z0-9]/.test(value), "Debe contener al menos un caracter especial"],
];

// correo con el codigo, con los colores de Flora (los correos solo aceptan estilos en linea)
const recoveryMail = (name, code) => ({
    subject: "Tu código para recuperar la contraseña de Flora",
    text: `Hola ${name}, tu código para recuperar la contraseña de Flora es ${code}. Vence en ${CODE_MINUTES} minutos. Si no lo pediste, ignora este correo.`,
    html: `
<div style="background:#f9f8ee;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#2d1f15">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #E1D1CA">
    <div style="background:#2d1f15;padding:24px 28px;color:#ffffff">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#EEB779">Flora</div>
      <div style="font-size:22px;font-weight:bold;margin-top:4px">Recupera tu contraseña</div>
    </div>
    <div style="padding:28px">
      <p style="margin:0 0 12px;font-size:15px">Hola <b>${name}</b>,</p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.5">Escribe este código en Flora para crear una contraseña nueva:</p>
      <div style="text-align:center;margin:0 0 20px">
        <span style="display:inline-block;padding:14px 22px;border-radius:14px;background:#F9F1E6;border:1px solid #EEB779;font-size:32px;font-weight:bold;letter-spacing:10px;color:#613503">${code}</span>
      </div>
      <p style="margin:0 0 8px;font-size:13px;color:#543726">El código vence en ${CODE_MINUTES} minutos y solo se puede usar una vez.</p>
      <p style="margin:0;font-size:13px;color:#543726">Si no pediste cambiar la contraseña, ignora este correo: tu cuenta sigue igual.</p>
    </div>
  </div>
</div>`,
});

// error con codigo http para que el controller responda bien
const httpError = (status, message) => Object.assign(new Error(message), { status });

export const authService = {
    async login({ email, password }) {
        if (!email || !password) {
            throw httpError(400, "Debe ingresar el correo y la contraseña");
        }

        const user = await authRepository.findByEmail(email);

        // mismo mensaje si el correo no existe o si la clave esta mal,
        // asi nadie puede averiguar que correos estan registrados
        if (!user) {
            throw httpError(401, "Correo o contraseña incorrectos");
        }

        // si la cuenta esta bloqueada no deja intentar hasta que pase el tiempo
        if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
            const minutes = Math.ceil((new Date(user.bloqueado_hasta) - new Date()) / 60000);
            throw httpError(423, `Superaste los ${MAX_ATTEMPTS} intentos permitidos. Intenta de nuevo en ${minutes} minuto(s) o pide al administrador que desbloquee la cuenta.`);
        }

        const isMatch = await bcrypt.compare(password, user.contrasena);

        if (!isMatch) {
            const attempt = await authRepository.registerFailedAttempt(user.id, MAX_ATTEMPTS, LOCK_MINUTES);
            if (attempt.bloqueado_hasta && new Date(attempt.bloqueado_hasta) > new Date()) {
                throw httpError(423, `Se bloqueó el acceso durante ${LOCK_MINUTES} minutos por ${MAX_ATTEMPTS} intentos fallidos consecutivos.`);
            }
            throw httpError(401, `Correo o contraseña incorrectos. Intento ${attempt.intentos_fallidos} de ${MAX_ATTEMPTS}.`);
        }

        // la cuenta inhabilitada solo se avisa cuando la clave es correcta
        if (!user.estado) {
            throw httpError(403, "La cuenta está inhabilitada. Comunícate con el administrador");
        }

        await authRepository.registerSuccess(user.id);

        const token = jwt.sign(
            { id: user.id, email: user.correo_personal },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES || "8h" },
        );

        // permisos del usuario para que el frontend sepa que puede hacer
        // (salen del mismo lugar que /access/me, asi al que no es staff no le llega gestionar permisos)
        const access = await accessService.getMyAccess(user.id);

        return {
            token,
            user: {
                id: user.id,
                name: user.nombre,
                email: user.correo_personal,
                group: await authRepository.getUserGroup(user.id),
                isSuperuser: access.isSuperuser,
                isStaff: access.isStaff,
                permissions: access.permissions,
            },
        };
    },

    // ===== recuperar contraseña =====

    // 1. manda el codigo al correo. Siempre responde lo mismo, exista o no el correo,
    // asi nadie puede averiguar que correos estan registrados
    async forgotPassword({ email }) {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw httpError(400, "Escribe un correo válido");
        }

        const user = await authRepository.findRecovery(email);

        // a las cuentas inhabilitadas no se les manda codigo
        if (user && user.estado) {
            // codigo de 6 numeros (randomInt es seguro, Math.random no)
            const code = String(randomInt(0, 1000000)).padStart(6, "0");
            await authRepository.saveRecoveryCode(user.id, await bcrypt.hash(code, 10), CODE_MINUTES);
            try {
                // llega al correo personal y tambien al empresarial si lo tiene (sin repetir)
                const to = [...new Set([user.correo_personal, user.correo_empresarial].filter(Boolean).map((mail) => mail.toLowerCase()))];
                await sendMail({ to, ...recoveryMail(user.nombre, code) });
            } catch (error) {
                // el detalle (usuario o clave SMTP mal) queda en la consola
                console.error("ERROR CORREO", error);
                throw httpError(502, "No se pudo enviar el correo. Revisa los datos SMTP del archivo .env del backend.");
            }
        }

        return { message: `Si el correo está registrado, te llegará un código que sirve por ${CODE_MINUTES} minutos.` };
    },

    // 2. revisa el codigo; si esta bien devuelve un permiso corto para cambiar la contraseña
    async verifyCode({ email, code }) {
        if (!email || !code) {
            throw httpError(400, "Escribe el código que te llegó al correo");
        }

        const user = await authRepository.findRecovery(email);
        const expired = !user?.codigo_recuperacion || !user.codigo_expira || new Date(user.codigo_expira) < new Date();

        if (!user || expired) {
            if (user?.codigo_recuperacion) await authRepository.clearRecovery(user.id);
            throw httpError(400, "El código venció o no es válido. Pide uno nuevo.");
        }

        const isMatch = await bcrypt.compare(String(code).trim(), user.codigo_recuperacion);

        if (!isMatch) {
            const attempts = await authRepository.addCodeAttempt(user.id);
            if (attempts >= MAX_CODE_ATTEMPTS) {
                await authRepository.clearRecovery(user.id);
                throw httpError(429, "Escribiste mal el código muchas veces. Pide uno nuevo.");
            }
            throw httpError(400, `Código incorrecto. Te quedan ${MAX_CODE_ATTEMPTS - attempts} intento(s).`);
        }

        // este token solo sirve para cambiar la contraseña y dura lo mismo que el codigo
        const resetToken = jwt.sign({ id: user.id, purpose: "reset" }, process.env.JWT_SECRET, { expiresIn: `${CODE_MINUTES}m` });

        return { resetToken };
    },

    // 3. guarda la contraseña nueva y anula el codigo (solo se puede usar una vez)
    async resetPassword({ resetToken, password }) {
        let payload;
        try {
            payload = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch {
            throw httpError(400, "El tiempo para cambiar la contraseña se acabó. Pide un código nuevo.");
        }
        if (payload.purpose !== "reset") {
            throw httpError(400, "El permiso para cambiar la contraseña no es válido.");
        }

        const failed = PASSWORD_RULES.find(([check]) => !check(String(password ?? "")));
        if (failed) {
            throw Object.assign(httpError(400, failed[1]), { field: "newPassword" });
        }

        // si el codigo ya se uso (o se pidio otro) el permiso ya no sirve
        const user = await authRepository.findRecoveryById(payload.id);
        if (!user?.codigo_recuperacion) {
            throw httpError(400, "Este código ya se usó. Pide uno nuevo.");
        }

        await authRepository.updatePassword(user.id, await bcrypt.hash(password, 10));

        // queda en el registro de cambios: la misma persona cambio su contraseña
        await changesRepository.create({
            usuarioId: user.id,
            tabla: "usuario",
            registroId: user.id,
            accion: "RECUPERAR_CONTRASENA",
            motivo: "Recuperó la contraseña con el código enviado al correo",
        });

        return { message: "Tu contraseña se cambió. Ya puedes iniciar sesión." };
    },
};
