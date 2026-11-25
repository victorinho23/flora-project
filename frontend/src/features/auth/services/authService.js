// src/features/auth/services/authService.js
// Consumir API login

import { request } from "@/features/config";

export async function login(userData) {
    return await request("/auth/login", {
        method: "POST",
        body: {
            email: userData.userEmail,
            password: userData.userPassword,
        },
    });
}

// ===== recuperar contraseña =====

// 1. pide el codigo que llega al correo
export async function requestRecoveryCode(email) {
    return await request("/auth/forgot-password", { method: "POST", body: { email } });
}

// 2. revisa el codigo; si esta bien devuelve el permiso para cambiar la contraseña
export async function verifyRecoveryCode(email, code) {
    return await request("/auth/verify-code", { method: "POST", body: { email, code } });
}

// 3. guarda la contraseña nueva
export async function resetPassword(resetToken, password) {
    return await request("/auth/reset-password", { method: "POST", body: { resetToken, password } });
}
