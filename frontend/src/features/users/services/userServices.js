// src/features/users/services/userServices.js
// Funciones que consumen la API de usuarios del backend

import documentTypes from "@/data/select/documentTypes.json";
import typesUser from "@/data/select/typesUser.json";
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

// granted = permisos que se le dan, denied = los que se le quitan aunque su grupo los tenga
export async function updateUserPermissions(id, { granted = [], denied = [] }) {
    return await request(`${USERS_URL}/${id}/permissions`, {
        method: "PUT",
        body: { granted, denied },
    });
}

// Busca el texto legible de un id en una lista (tipo de documento, tipo de usuario)
const labelOf = (list, id) => list.find((item) => item.id === id)?.label ?? id;

// pasa un usuario como llega del backend al formato que usa la vista "Ver usuario"
// (la pagina de ver y la ventana del listado usan la misma)
export function toUserView(data) {
    return {
        id: data.id,
        userName: data.username,
        userDocumentTypeLabel: labelOf(documentTypes, data.document_type),
        userDocumentNumber: data.document_number,
        userTypeLabel: labelOf(typesUser, data.usertype),
        userEmail: data.useremail,
        userBusinessEmail: data.business_email,
        userAddress: data.address,
        userPhone: data.userphone,
        userPhoneSecondary: data.userphone2,
        userContractStartDate: data.start_date,
        userContractEndDate: data.end_date,
        // fecha en que autorizo el tratamiento de datos (vacia en cuentas viejas)
        userDataConsentDate: data.data_consent_date,
        isActive: data.is_active,
        imageUrl: data.image,
        // el usuario tal cual llega del backend, para mandarlo a editar
        raw: data,
    };
}

// historial del registro de cambios de un usuario (lo mas nuevo primero)
export async function getUserHistory(id) {
    return await request(`/changes/usuario/${id}`);
}
