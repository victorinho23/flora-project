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
