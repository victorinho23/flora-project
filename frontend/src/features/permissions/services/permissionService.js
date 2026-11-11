// src/features/permissions/services/permissionService.js

import { request } from "@/features/config";

// trae los permisos que tiene un grupo
export async function getGroupPermissions(groupId) {
    return await request(`/groups/${groupId}/permissions`);
}

// trae todos los permisos que existen en la base (con su modulo)
export async function getAllPermissions() {
    return await request("/permissions");
}
