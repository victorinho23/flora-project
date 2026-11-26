// backend/src/features/users/user.service.js
// El service representa la capa logica de negocio de los usuarios

import { userRepository } from "./user.repository.js";
import { changesRepository } from "../changes/changes.repository.js";
import { accessService } from "../access/access.service.js";
import { imageUrl, imagePath, removeImage } from "../../config/upload.js";
import { parseBoolean, parseIds } from "../../config/reportFilters.js";
import bcrypt from "bcrypt";

// el frontend maneja el tipo de usuario con estos codigos y en la base son los grupos
const GROUP_BY_TYPE = {
    ADMIN: "Administrador",
    MESERO: "Mesero",
    COCINERO: "Cocinero",
};

const TYPE_BY_GROUP = Object.fromEntries(Object.entries(GROUP_BY_TYPE).map(([type, group]) => [group, type]));

// error con codigo http (y el campo que fallo) para que el controller responda bien
const httpError = (status, message, field) => Object.assign(new Error(message), { status, field });

// deja el usuario con la forma que usa el frontend
const toUser = (row) => {
    if (!row) return row;
    const { group_name, ...user } = row;
    return {
        ...user,
        usertype: TYPE_BY_GROUP[group_name] ?? group_name ?? "",
        image: imageUrl(user.image),
    };
};

// los datos llegan como texto desde el formulario (multipart), aqui se limpian
const cleanData = (data, file) => {
    const userType = data.userType;
    return {
        userName: data.userName?.trim(),
        userEmail: data.userEmail?.trim().toLowerCase(),
        userBusinessEmail: data.userBusinessEmail?.trim().toLowerCase() || null,
        userPhone: data.userPhone?.trim(),
        userPhoneSecondary: data.userPhoneSecondary?.trim() || null,
        userDocumentTypes: data.userDocumentTypes,
        userDocumentNumber: data.userDocumentNumber?.trim(),
        userAddress: data.userAddress?.trim(),
        userType,
        userContractStartDate: data.userContractStartDate,
        // el administrador no tiene fecha de fin de contrato
        userContractEndDate: userType === "ADMIN" ? null : data.userContractEndDate || null,
        isActive: String(data.isActive) !== "false",
        isSuperUser: String(data.isSuperUser) === "true",
        // staff = administrador, sale del rol (el superusuario va aparte)
        isStaff: userType === "ADMIN",
        userImage: imagePath(file),
        userPassword: data.userPassword || null,
    };
};

// nombres de los datos que se comparan para el registro de cambios: [dato nuevo, dato guardado, como se llama]
const TRACKED = [
    ["userName", "username", "nombre"],
    ["userEmail", "useremail", "correo"],
    ["userBusinessEmail", "business_email", "correo empresarial"],
    ["userPhone", "userphone", "teléfono"],
    ["userPhoneSecondary", "userphone2", "teléfono secundario"],
    ["userDocumentTypes", "document_type", "tipo de documento"],
    ["userDocumentNumber", "document_number", "documento"],
    ["userAddress", "address", "dirección"],
    ["userContractStartDate", "start_date", "inicio de contrato"],
    ["userContractEndDate", "end_date", "fin de contrato"],
];

// dice que datos cambiaron, ej: "Cambió: teléfono, rol"
const describeChanges = (current, user) => {
    const changed = TRACKED.filter(([next, saved]) => String(user[next] ?? "") !== String(current[saved] ?? "")).map(([, , label]) => label);
    if ((TYPE_BY_GROUP[current.group_name] ?? "") !== user.userType) changed.push("rol");
    if (Boolean(current.is_superuser) !== user.isSuperUser) changed.push("superusuario");
    if (user.userPassword) changed.push("contraseña");
    if (user.userImage) changed.push("foto");
    return changed.length ? `Cambió: ${changed.join(", ")}` : null;
};

// revisa lo minimo antes de guardar
const validate = async (user, { requirePassword, excludeId }) => {
    const required = {
        userName: "El nombre es obligatorio",
        userEmail: "El correo es obligatorio",
        userPhone: "El telefono es obligatorio",
        userDocumentTypes: "Debe seleccionar un tipo de documento",
        userDocumentNumber: "El numero de documento es obligatorio",
        userAddress: "La direccion es obligatoria",
        userContractStartDate: "La fecha de inicio de contrato es obligatoria",
    };

    for (const [field, message] of Object.entries(required)) {
        if (!user[field]) throw httpError(400, message, field);
    }

    if (!GROUP_BY_TYPE[user.userType]) {
        throw httpError(400, "Debe seleccionar un tipo de usuario valido", "userType");
    }

    if (requirePassword && !user.userPassword) {
        throw httpError(400, "La contraseña es obligatoria", "userPassword");
    }

    if (user.userType !== "ADMIN" && !user.userContractEndDate) {
        throw httpError(400, "Debe seleccionar la fecha de fin de contrato", "userContractEndDate");
    }

    // El correo y el documento deben ser unicos en el sistema
    const duplicates = await userRepository.findDuplicates({ ...user, excludeId });
    if (duplicates.email) throw httpError(409, "Este correo ya está registrado", "userEmail");
    if (duplicates.document) throw httpError(409, "Este número de documento ya está en uso", "userDocumentNumber");
};

// reglas de quien puede tocar a quien (el superusuario se las salta todas):
// - superusuarios y administradores solo los crea, cambia o quita un superusuario
// - un administrador puede cambiar sus propios datos, pero no los de otro administrador
// - los demas roles solo se asignan si quien los asigna tiene todos sus permisos
const checkAccountRules = async (actorId, user, current = null) => {
    const actor = await accessService.getAccess(actorId);
    const isSelf = current && Number(current.id) === Number(actorId);

    // nadie se quita el superusuario a si mismo, asi nunca se queda Flora sin uno
    if (isSelf && actor.isSuperUser && !user.isSuperUser) {
        throw httpError(400, "No puedes quitarte el superusuario a ti mismo", "isSuperUser");
    }
    if (actor.isSuperUser) return;

    if (current?.is_superuser) {
        throw httpError(403, "Solo un superusuario puede modificar a otro superusuario");
    }
    if (user.isSuperUser !== Boolean(current?.is_superuser)) {
        throw httpError(403, "Solo un superusuario puede crear o quitar superusuarios", "isSuperUser");
    }

    const targetIsAdmin = current?.group_name === GROUP_BY_TYPE.ADMIN;
    if (targetIsAdmin && !isSelf) {
        throw httpError(403, "Solo un superusuario puede modificar a otro administrador");
    }

    const groupChanged = !current || (TYPE_BY_GROUP[current.group_name] ?? "") !== user.userType;
    if (!groupChanged) return;
    if (targetIsAdmin) {
        throw httpError(403, "Tu rol de administrador solo lo cambia un superusuario", "userType");
    }
    try {
        await accessService.ensureCanAssignGroup(actorId, GROUP_BY_TYPE[user.userType]);
    } catch (error) {
        throw Object.assign(error, { field: "userType" });
    }
};

export const userService = {
    async createUser(data, file, currentUserId) {
        // sin la autorizacion del tratamiento de datos no se crea la cuenta (llega como texto en el form)
        if (String(data.userDataConsent) !== "true") {
            throw httpError(400, "La persona debe autorizar el tratamiento de sus datos personales", "userDataConsent");
        }

        const user = cleanData(data, file);

        await validate(user, { requirePassword: true });
        await checkAccountRules(currentUserId, user);

        // la contraseña se guarda cifrada
        user.userPassword = await bcrypt.hash(user.userPassword, 10);

        const created = await userRepository.create(user, GROUP_BY_TYPE[user.userType]);

        // queda guardado quien creo la cuenta
        if (currentUserId) {
            await changesRepository.create({
                usuarioId: currentUserId,
                tabla: "usuario",
                registroId: created.id,
                accion: "CREAR",
                motivo: `Cuenta creada como ${user.userType === "ADMIN" ? "administrador" : user.userType?.toLowerCase()}`,
            });
        }

        return created;
    },

    async getUser() {
        const users = await userRepository.usersAll();
        return users.map(toUser);
    },

    // reporte: ?status=true|false  ?ids=1,2
    async getReport(query) {
        const filters = {
            status: parseBoolean(query.status),
            ids: parseIds(query.ids),
        };

        const users = await userRepository.report(filters);
        return users.map(toUser);
    },

    async getById(id) {
        const user = await userRepository.findById(id);
        if (!user) throw httpError(404, "Usuario no encontrado");
        return toUser(user);
    },

    async updateUser(id, data, file, currentUserId) {
        const current = await userRepository.findById(id);
        if (!current) throw httpError(404, "Usuario no encontrado");

        const user = cleanData(data, file);

        await validate(user, { requirePassword: false, excludeId: id });
        await checkAccountRules(currentUserId, user, current);

        // si no escriben contraseña nueva se conserva la actual
        if (user.userPassword) {
            user.userPassword = await bcrypt.hash(user.userPassword, 10);
        }

        if (!user.isActive && Number(id) === Number(currentUserId)) {
            throw httpError(400, "No puedes inhabilitar tu propia cuenta");
        }

        const updated = await userRepository.update(id, user, GROUP_BY_TYPE[user.userType]);
        // si llego foto nueva se borra la vieja; y como pudo cambiar de grupo o estado, se refrescan sus permisos
        if (file) removeImage(current.image);
        accessService.invalidate();

        // los datos que cambiaron quedan en el registro (sin el estado, que va aparte)
        const summary = describeChanges(current, user);
        if (summary) {
            await changesRepository.create({
                usuarioId: currentUserId,
                tabla: "usuario",
                registroId: id,
                accion: "ACTUALIZAR",
                motivo: summary,
            });
        }

        // si cambio el estado queda guardado quien lo hizo y el motivo
        if (current.is_active !== user.isActive) {
            await changesRepository.create({
                usuarioId: currentUserId,
                tabla: "usuario",
                registroId: id,
                accion: user.isActive ? "HABILITAR" : "INHABILITAR",
                motivo: data.statusReason,
            });
        }

        return updated;
    },

    // habilita o inhabilita la cuenta y guarda el motivo en registro_cambios
    async updateStatus(id, { isActive, reason }, currentUserId) {
        const user = await userRepository.findById(id);
        if (!user) throw httpError(404, "Usuario no encontrado");

        if (!isActive && Number(id) === Number(currentUserId)) {
            throw httpError(400, "No puedes inhabilitar tu propia cuenta");
        }

        // a un superusuario o a un administrador solo lo habilita o inhabilita un superusuario
        const actor = await accessService.getAccess(currentUserId);
        if ((user.is_superuser || user.group_name === GROUP_BY_TYPE.ADMIN) && !actor.isSuperUser) {
            throw httpError(403, "Solo un superusuario puede habilitar o inhabilitar a un administrador o superusuario");
        }

        if (!isActive && user.group_name === GROUP_BY_TYPE.ADMIN && !(typeof reason === "string" && reason.trim())) {
            throw httpError(400, "El motivo es obligatorio para inhabilitar un administrador");
        }

        await userRepository.updateStatus(id, Boolean(isActive));
        // si lo inhabilitan, pierde el acceso desde la siguiente peticion (no espera a que venza el token)
        accessService.invalidate();

        await changesRepository.create({
            usuarioId: currentUserId,
            tabla: "usuario",
            registroId: id,
            accion: isActive ? "HABILITAR" : "INHABILITAR",
            motivo: reason,
        });
    },

    // lista corta para los select (meseros, cuentadantes, gestion de permisos)
    async getOptions() {
        const users = await userRepository.usersAll();
        return users.map(toUser).map((user) => ({
            id: user.id,
            username: user.username,
            usertype: user.usertype,
            is_active: user.is_active,
            // la gestion de permisos lo necesita para no dejar tocar al superusuario
            is_superuser: user.is_superuser,
        }));
    },

    // lo que necesita la gestion de permisos para un usuario:
    // groupPermissions = los que le da su grupo, granted / denied = los individuales que se le dieron o quitaron
    async getPermissions(userId) {
        const [individual, groupPermissions] = await Promise.all([
            userRepository.getPermissions(userId),
            userRepository.getGroupPermissions(userId),
        ]);
        return {
            groupPermissions,
            granted: individual.filter((permission) => permission.permitido),
            denied: individual.filter((permission) => !permission.permitido),
        };
    },

    // granted = ids que se le dan, denied = ids que se le quitan aunque su grupo los tenga
    // (permissionIds es la forma vieja: solo los que se le dan)
    async updatePermissions(userId, { granted, denied, permissionIds } = {}, currentUserId) {
        const user = await userRepository.findById(userId);
        if (!user) throw httpError(404, "Usuario no encontrado");

        const toIds = (list) => [...new Set((list ?? []).map(Number).filter(Number.isInteger))];
        const give = toIds(granted ?? permissionIds);
        const remove = toIds(denied).filter((id) => !give.includes(id));

        const actor = await accessService.getAccess(currentUserId);
        // el superusuario siempre tiene todo: no tiene sentido darle ni quitarle permisos
        if (user.is_superuser) {
            throw httpError(403, "El superusuario siempre tiene todos los permisos, no se le pueden quitar");
        }
        if (!actor.isSuperUser) {
            // nadie se da permisos a si mismo
            if (Number(userId) === Number(currentUserId)) {
                throw httpError(403, "No puedes cambiar tus propios permisos. Pídeselo a un superusuario");
            }
            // a un administrador solo el superusuario le da o le quita permisos
            if (user.group_name === GROUP_BY_TYPE.ADMIN) {
                throw httpError(403, "Los permisos de un administrador solo los cambia un superusuario");
            }
            // se compara como estaba cada permiso (dado, quitado o como su grupo) con como queda,
            // y solo los que cambian tienen que estar entre los permisos de quien hace el cambio
            const before = new Map((await userRepository.getPermissions(userId)).map((permission) => [permission.permission_id, permission.permitido]));
            const after = new Map([...give.map((id) => [id, true]), ...remove.map((id) => [id, false])]);
            const changed = [...new Set([...before.keys(), ...after.keys()])].filter((id) => before.get(id) !== after.get(id));
            await accessService.ensureCanChange(currentUserId, changed);
        }

        const result = await userRepository.updatePermissions(userId, { granted: give, denied: remove });
        accessService.invalidate();
        return result;
    },
};
