// backend/src/features/access/access.service.js
// regla: usuario inhabilitado -> se niega; superusuario -> todo;
// si no, permisos directos del usuario + permisos de sus grupos activos

import { accessRepository } from "./access.repository.js";

// Los permisos de cada usuario se guardan un ratico en memoria (Set = busqueda directa)
// asi cada peticion no vuelve a preguntarle a la base. Cuando el admin cambia permisos
// se borra todo con invalidate() y la siguiente peticion ya ve el cambio de verdad
const CACHE_MS = 30 * 1000;
const cache = new Map();

const loadAccess = async (userId) => {
    const saved = cache.get(userId);
    if (saved && saved.expires > Date.now()) return saved;

    const user = await accessRepository.getAccessUser(userId);
    const access = {
        active: Boolean(user?.estado),
        isSuperUser: Boolean(user?.is_superuser),
        permissions: new Set(user?.is_superuser ? [] : await accessRepository.getUserPermissions(userId)),
        expires: Date.now() + CACHE_MS,
    };
    cache.set(userId, access);
    return access;
};

export const accessService = {
  async hasPermission(userId, permissionCode) {
    const access = await loadAccess(userId);
    if (!access.active) return false;
    if (access.isSuperUser) return true;
    return access.permissions.has(permissionCode);
  },

  // lo que el frontend necesita para mostrar u ocultar vistas y botones
  async getMyAccess(userId) {
    const access = await loadAccess(userId);
    return {
      active: access.active,
      isSuperuser: access.isSuperUser,
      permissions: access.isSuperUser ? ["*"] : [...access.permissions],
    };
  },

  // se llama cuando cambian permisos, grupos o el estado de un usuario
  invalidate() {
    cache.clear();
  },
};
