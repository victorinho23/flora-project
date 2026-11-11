// src/features/users/services/userServices.js
// Funciones que consumen la API de usuarios del backend

import { request, toFormData } from "@/features/config";

const USERS_URL = "/users";

// Crea un usuario, va con FormData porque lleva la foto de perfil
export async function createUser(userData) {
    return await request(USERS_URL, {
        method: "POST",
        body: toFormData(userData, "userImage"),
        isForm: true,
    });
}

// trae la lista de usuarios del backend
export async function getUsers() {
    return await request(USERS_URL);
}

// trae los usuarios del reporte ya filtrados por el backend
// params es un objeto con los filtros, ej: { status: "true", ids: "1,2" }
export async function getUsersReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`${USERS_URL}/report${query ? `?${query}` : ""}`);
}

// trae un usuario por su id
export async function getUserById(id) {
    return await request(`${USERS_URL}/${id}`);
}

// lista corta (id, nombre, tipo, estado) para los select de meseros y cuentadantes
export async function getUserOptions() {
    return await request(`${USERS_URL}/options`);
}

// actualiza la cuenta, si no se escribe contraseña se conserva la actual
export async function updateUser(id, userData) {
    return await request(`${USERS_URL}/${id}`, {
        method: "PUT",
        body: toFormData(userData, "userImage"),
        isForm: true,
    });
}

// habilita o inhabilita la cuenta, el motivo queda en registro de cambios
export async function updateUserStatus(id, isActive, reason) {
    return await request(`${USERS_URL}/${id}/status`, {
        method: "PATCH",
        body: { isActive, reason },
    });
}

// permisos asignados directamente al usuario
export async function getUserPermissions(id) {
    return await request(`${USERS_URL}/${id}/permissions`);
}

export async function updateUserPermissions(id, permissionIds) {
    return await request(`${USERS_URL}/${id}/permissions`, {
        method: "PUT",
        body: { permissionIds },
    });
}
