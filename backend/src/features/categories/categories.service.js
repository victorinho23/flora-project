// backend/src/features/categories/categories.service.js
// reglas de las categorias: nombre obligatorio y unico, y no se inhabilita si tiene platillos activos

import { categoriesRepository } from "./categories.repository.js";
import { changesRepository } from "../changes/changes.repository.js";

const httpError = (status, message, extra = {}) => Object.assign(new Error(message), { status, ...extra });

// nombre limpio: sin espacios de mas y con la primera letra en mayuscula
const cleanName = (value) => {
    const name = String(value ?? "").trim().replace(/\s+/g, " ");
    if (name.length < 2 || name.length > 60) {
        throw httpError(400, "El nombre debe tener entre 2 y 60 caracteres", { field: "name" });
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
};

const toCategory = (row) => ({ id: String(row.id), label: row.nombre, isActive: row.estado, dishes: row.dishes ?? 0 });

export const categoriesService = {
    // el select del frontend espera { id, label }
    async getAll({ all } = {}) {
        const categories = await categoriesRepository.getAll(all === "1" || all === "true");
        return categories.map(toCategory);
    },

    async create({ name } = {}, currentUserId) {
        const nombre = cleanName(name);
        if (await categoriesRepository.findByName(nombre)) {
            throw httpError(409, `Ya existe la categoría "${nombre}"`, { field: "name" });
        }
        const id = await categoriesRepository.create(nombre);
        await changesRepository.create({ usuarioId: currentUserId, tabla: "categoria", registroId: id, accion: "CREAR" });
        return id;
    },

    async update(id, { name } = {}, currentUserId) {
        if (!(await categoriesRepository.findById(id))) throw httpError(404, "No se encontró la categoría");
        const nombre = cleanName(name);
        if (await categoriesRepository.findByName(nombre, id)) {
            throw httpError(409, `Ya existe la categoría "${nombre}"`, { field: "name" });
        }
        await categoriesRepository.update(id, nombre);
        await changesRepository.create({ usuarioId: currentUserId, tabla: "categoria", registroId: id, accion: "ACTUALIZAR" });
    },

    async updateStatus(id, { isActive, reason } = {}, currentUserId) {
        if (!(await categoriesRepository.findById(id))) throw httpError(404, "No se encontró la categoría");
        const estado = Boolean(isActive);
        if (!estado) {
            const active = await categoriesRepository.countActiveDishes(id);
            if (active > 0) {
                throw httpError(409, `La categoría tiene ${active} platillo(s) activo(s). Muévelos o inhabilítalos primero.`);
            }
        }
        await categoriesRepository.updateStatus(id, estado);
        await changesRepository.create({
            usuarioId: currentUserId,
            tabla: "categoria",
            registroId: id,
            accion: estado ? "HABILITAR" : "INHABILITAR",
            motivo: reason,
        });
    },
};
