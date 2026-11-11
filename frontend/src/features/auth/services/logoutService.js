// src/features/auth/services/logoutService.js
// Cerrar sesión eliminando el JWT y los datos del usuario

export function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
}

// Usuario que inicio sesion (nombre, grupo y permisos)
export function getSessionUser() {
    try {
        return JSON.parse(sessionStorage.getItem("user")) ?? null;
    } catch {
        return null;
    }
}
