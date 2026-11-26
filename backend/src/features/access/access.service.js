// backend/src/features/access/access.service.js
// regla: usuario inhabilitado -> se niega; superusuario -> todo;
// si no, permisos directos del usuario + permisos de sus grupos activos
//
// superusuario vs staff:
//   superusuario = tiene todos los permisos sin que se los den y puede cambiar lo que sea
//   staff        = personal administrativo: es el unico que puede gestionar permisos,
//                  pero solo los que el mismo tiene (no puede dar lo que no tiene)

import { accessRepository } from "./access.repository.js";

// permisos que solo le sirven al staff: aunque a alguien se los den, si no es staff no los puede usar
const STAFF_ONLY = new Set(["permisos_gestionar"]);

// error con codigo http para que el controller responda 403 con el mensaje
const forbidden = (message) => Object.assign(new Error(message), { status: 403 });

// pone los nombres en una lista corta: "A, B y 3 más"
const shortList = (names) => {
    if (names.length <= 3) return names.join(", ");
    return `${names.slice(0, 3).join(", ")} y ${names.length - 3} más`;
};

// Los permisos de cada usuario se guardan un ratico en memoria (Set = busqueda directa)
// asi cada peticion no vuelve a preguntarle a la base. Cuando el admin cambia permisos
// se borra todo con invalidate() y la siguiente peticion ya ve el cambio de verdad
const CACHE_MS = 30 * 1000;
const cache = new Map();

const loadAccess = async (userId) => {
    const saved = cache.get(userId);
    if (saved && saved.expires > Date.now()) return saved;

    const user = await accessRepository.getAccessUser(userId);
    const isSuperUser = Boolean(user?.is_superuser);
    // el superusuario siempre cuenta como staff
    const isStaff = isSuperUser || Boolean(user?.is_staff);
    const list = isSuperUser ? [] : await accessRepository.getUserPermissions(userId);

    const access = {
        active: Boolean(user?.estado),
        isSuperUser,
        isStaff,
        permissions: new Set(isStaff ? list : list.filter((code) => !STAFF_ONLY.has(code))),
        groupIds: await accessRepository.getUserGroupIds(userId),
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

  // todo lo que se sabe del acceso de una persona (lo usan las reglas de abajo y otros services)
  async getAccess(userId) {
    return await loadAccess(userId);
  },

  // lo que el frontend necesita para mostrar u ocultar vistas y botones
  async getMyAccess(userId) {
    const access = await loadAccess(userId);
    return {
      active: access.active,
      isSuperuser: access.isSuperUser,
      isStaff: access.isStaff,
      groupIds: access.groupIds,
      permissions: access.isSuperUser ? ["*"] : [...access.permissions],
    };
  },

  // quien cambia permisos solo puede dar o quitar los que el mismo tiene
  // (permissionIds = los permisos que cambian, no todos los que quedan)
  async ensureCanChange(actorId, permissionIds = []) {
    const actor = await loadAccess(actorId);
    if (actor.isSuperUser || !permissionIds.length) return;

    const rows = await accessRepository.getPermissionsByIds(permissionIds);
    const missing = rows.filter((row) => !actor.permissions.has(row.permission_codename));
    if (missing.length) {
      throw forbidden(`No puedes dar ni quitar permisos que tú no tienes: ${shortList(missing.map((row) => row.permission_name))}`);
    }
  },

  // para poner a alguien en un grupo (tipo de usuario) hay que tener todos los permisos de ese grupo,
  // si no, un supervisor podria crear administradores y asi darse mas poder por la puerta de atras
  async ensureCanAssignGroup(actorId, groupName) {
    const actor = await loadAccess(actorId);
    if (actor.isSuperUser) return;

    const rows = await accessRepository.getGroupPermissionsByName(groupName);
    const missing = rows.filter((row) => !actor.permissions.has(row.permission_codename));
    if (missing.length) {
      throw forbidden(`No puedes asignar el rol ${groupName} porque tiene permisos que tú no tienes: ${shortList(missing.map((row) => row.permission_name))}`);
    }
  },

  // se llama cuando cambian permisos, grupos o el estado de un usuario
  invalidate() {
    cache.clear();
  },
};
