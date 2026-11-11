// src/features/permissions/services/groupService.js

import { request } from "@/features/config";

const GROUPS_URL = "/groups";

// grupos de usuarios (Administrador, Mesero, Cocinero)
export async function getGroups() {
    return await request(GROUPS_URL);
}

// Función para actualizar permisos del grupo
export async function updateGroupPermissions(groupId, permissionIds) {
    return await request(`${GROUPS_URL}/${groupId}/permissions`, {
        method: "PUT",
        body: { permissionIds },
    });
}
