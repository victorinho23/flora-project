// backend/src/features/access/access.service.js
// regla: superusuario -> permisos directos del usuario -> permisos de su grupo -> si no, se niega

import { accessRepository } from "./access.repository.js";

export const accessService = {
  async hasPermission(userId, permissionCode) {
    const isSuperUser = await accessRepository.isSuperUser(userId);

    if (isSuperUser) {
      return true;
    }

    const permissions = await accessRepository.getUserPermissions(userId);

    return permissions.includes(permissionCode);
  },
};
