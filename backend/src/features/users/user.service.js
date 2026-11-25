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

export const userService = {
    async createUser(data, file, currentUserId) {
        const user = cleanData(data, file);

        await validate(user, { requirePassword: true });

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
    async updatePermissions(userId, { granted, denied, permissionIds } = {}) {
        const user = await userRepository.findById(userId);
        if (!user) throw httpError(404, "Usuario no encontrado");

        const toIds = (list) => [...new Set((list ?? []).map(Number).filter(Number.isInteger))];
        const give = toIds(granted ?? permissionIds);
        const remove = toIds(denied).filter((id) => !give.includes(id));

        const result = await userRepository.updatePermissions(userId, { granted: give, denied: remove });
        accessService.invalidate();
        return result;
    },
};
