// backend/src/features/groups/groups.service.js

import { groupsRepository } from "./groups.repository.js";
import { accessService } from "../access/access.service.js";

export const groupsService = {
    async getAll() {
        return await groupsRepository.getAll();
    },

    async getPermissionsByGroupId(groupId) {
        return await groupsRepository.getPermissionsByGroupId(groupId);
    },

    async updatePermissions(groupId, permissionIds = []) {
        const result = await groupsRepository.updatePermissions(groupId, permissionIds.map(Number));
        // los usuarios del grupo pierden o ganan el permiso desde la siguiente peticion
        accessService.invalidate();
        return result;
    },
};
