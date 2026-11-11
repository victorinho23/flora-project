// src/features/config/api.js
// Centraliza la url del backend y la forma de hacer las peticiones

export const API_URL = import.meta.env.VITE_API_URL;

// Hace la peticion al backend con el token de la sesion
// si el backend responde error se lanza con su mensaje para mostrarlo en la alerta
export async function request(path, { method = "GET", body, isForm = false } = {}) {
    const token = sessionStorage.getItem("token");

    let response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers: {
                ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            // con imagenes se manda FormData, si no se manda JSON
            body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
        });
    } catch {
        throw new Error("Pérdida de conexión con el servidor, intenta de nuevo en unos minutos.");
    }

    const data = await response.json().catch(() => ({}));

    // si el token vencio se cierra la sesion y se manda al login
    if (response.status === 401 && token) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        window.location.href = "/auth";
    }

    if (!response.ok) {
        const error = new Error(data.error || "Ocurrió un error en el servidor");
        error.status = response.status;
        error.field = data.field;
        error.data = data;
        throw error;
    }

    return data;
}

// Arma el FormData para los formularios que llevan imagen
// fileField es el nombre del campo donde va el archivo (ej: userImage)
export function toFormData(data, fileField) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (key === fileField) {
            if (value?.[0]) formData.append(fileField, value[0]);
            return;
        }
        if (value === undefined || value === null) return;
        formData.append(key, value);
    });

    return formData;
}
