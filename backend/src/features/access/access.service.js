// backend/src/features/access/access.service.js
// regla: usuario inhabilitado -> se niega; superusuario o administrador -> todo;
// si no, permisos directos del usuario + permisos de sus grupos activos
//
// superusuario vs administrador:
//   los dos tienen TODOS los permisos de Flora
//   superusuario  = ademas es el unico que puede crear o quitar administradores y superusuarios,
//                   y el unico que puede modificar a un administrador
//   administrador = gestiona usuarios y permisos, pero nunca por encima de lo que el tiene
//                   (no puede crear administradores ni superusuarios)
// staff = puede entrar a gestionar permisos: lo son el superusuario y los administradores

import { accessRepository } from "./access.repository.js";

// permisos que solo le sirven al staff: aunque a alguien se los den, si no es staff no los puede usar
const STAFF_ONLY = new Set(["permisos_gestionar"]);

// nombre del grupo de los administradores (asi esta en la tabla groups)
export const ADMIN_GROUP = "Administrador";

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
    const isAdmin = Boolean(user?.is_admin);
    const isStaff = isSuperUser || isAdmin;

    // el administrador tiene todos los permisos que existan (aunque se creen nuevos despues)
    let list = [];
    if (isAdmin && !isSuperUser) list = await accessRepository.getAllCodenames();
    else if (!isSuperUser) list = await accessRepository.getUserPermissions(userId);

    const access = {
        active: Boolean(user?.estado),
        isSuperUser,
        isAdmin,
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

  // administrador o superusuario con la cuenta activa (Configuracion es solo de ellos)
  async isStaff(userId) {
    const access = await loadAccess(userId);
    return access.active && access.isStaff;
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
      isAdmin: access.isAdmin,
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

  // para poner a alguien en un grupo (tipo de usuario):
  // - administradores solo los crea el superusuario
  // - en los demas hay que tener todos los permisos del grupo (asi nadie da mas de lo que tiene)
  async ensureCanAssignGroup(actorId, groupName) {
    const actor = await loadAccess(actorId);
    if (actor.isSuperUser) return;

    if (groupName === ADMIN_GROUP) {
      throw forbidden("Solo un superusuario puede crear o asignar administradores");
    }

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
