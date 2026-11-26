// backend/src/features/groups/groups.service.js

import { groupsRepository } from "./groups.repository.js";
import { accessService, ADMIN_GROUP } from "../access/access.service.js";

// error con codigo http para que el controller responda bien
const httpError = (status, message) => Object.assign(new Error(message), { status });

export const groupsService = {
    async getAll() {
        return await groupsRepository.getAll();
    },

    async getPermissionsByGroupId(groupId) {
        return await groupsRepository.getPermissionsByGroupId(groupId);
    },

    async updatePermissions(groupId, permissionIds = [], actorId) {
        const ids = [...new Set(permissionIds.map(Number).filter(Number.isInteger))];
        const actor = await accessService.getAccess(actorId);

        if (!actor.isSuperUser) {
            // los permisos del grupo Administrador solo los cambia el superusuario
            const group = (await groupsRepository.getAll()).find((item) => item.group_id === groupId);
            if (group?.group_name === ADMIN_GROUP) {
                throw httpError(403, "Los permisos del grupo Administrador solo los cambia un superusuario");
            }
            // nadie se sube los permisos cambiando los de su propio grupo
            if (actor.groupIds.includes(groupId)) {
                throw httpError(403, "No puedes cambiar los permisos de tu propio grupo. Pídeselo a un superusuario");
            }
            // solo se revisan los que cambian: los que ya tenia el grupo y no se tocan pueden quedarse
            const current = (await groupsRepository.getPermissionsByGroupId(groupId)).map((permission) => permission.permission_id);
            const changed = [...ids.filter((id) => !current.includes(id)), ...current.filter((id) => !ids.includes(id))];
            await accessService.ensureCanChange(actorId, changed);
        }

        const result = await groupsRepository.updatePermissions(groupId, ids);
        // los usuarios del grupo pierden o ganan el permiso desde la siguiente peticion
        accessService.invalidate();
        return result;
    },
};
