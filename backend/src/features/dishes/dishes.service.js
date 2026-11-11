// backend/src/features/dishes/dishes.service.js

import { dishesRepository } from "./dishes.repository.js";
import { changesRepository } from "../changes/changes.repository.js";
import { imageUrl } from "../../config/upload.js";
import { parseIds } from "../../config/reportFilters.js";

const httpError = (status, message, field) => Object.assign(new Error(message), { status, field });

// arma la url completa de la imagen
const toDish = (row) => row && { ...row, image: imageUrl(row.image) };

// los datos llegan como texto desde el formulario (multipart)
const cleanData = (data, file) => ({
    name: data.dishName?.trim(),
    price: Number(data.dishPrice),
    categoryId: Number(data.dishCategory),
    description: data.dishDescription?.trim() || null,
    isEnabled: String(data.isEnabled) !== "false",
    image: file ? `/uploads/${file.filename}` : null,
});

const validate = async (dish, excludeId) => {
    if (!dish.name || dish.name.length < 3) throw httpError(400, "El nombre debe tener minimo 3 caracteres", "dishName");
    if (!Number.isInteger(dish.price) || dish.price <= 0) throw httpError(400, "El precio debe ser un numero positivo", "dishPrice");
    if (!dish.categoryId) throw httpError(400, "Debe seleccionar una categoria", "dishCategory");

    if (await dishesRepository.existsName(dish.name, dish.categoryId, excludeId)) {
        throw httpError(409, "Ya existe un platillo con este nombre en la misma categoría", "dishName");
    }
};

export const dishesService = {
    async getAll() {
        const dishes = await dishesRepository.getAll();
        return dishes.map(toDish);
    },

    // reporte: ?ids=1,2
    async getReport(query) {
        const dishes = await dishesRepository.report({ ids: parseIds(query.ids) });
        return dishes.map(toDish);
    },

    async getById(id) {
        const dish = await dishesRepository.findById(id);
        if (!dish) throw httpError(404, "No se encontro el platillo solicitado");
        return toDish(dish);
    },

    async create(data, file) {
        const dish = cleanData(data, file);
        await validate(dish);
        return await dishesRepository.create(dish);
    },

    async update(id, data, file) {
        const current = await dishesRepository.findById(id);
        if (!current) throw httpError(404, "No se encontro el platillo solicitado");

        const dish = cleanData(data, file);
        await validate(dish, id);

        if (!dish.isEnabled && current.is_active && await dishesRepository.isInActiveOrder(id)) {
            throw httpError(409, `${current.name} está en una orden en proceso. Inhabilítalo cuando la orden se pague o se cancele.`);
        }

        return await dishesRepository.update(id, dish);
    },

    async updateStatus(id, { isActive, reason }, currentUserId) {
        const dish = await dishesRepository.findById(id);
        if (!dish) throw httpError(404, "No se encontro el platillo solicitado");

        if (!isActive && await dishesRepository.isInActiveOrder(id)) {
            throw httpError(409, `${dish.name} está en una orden en proceso. Inhabilítalo cuando la orden se pague o se cancele.`);
        }

        await dishesRepository.updateStatus(id, Boolean(isActive));

        await changesRepository.create({
            usuarioId: currentUserId,
            tabla: "platillo",
            registroId: id,
            accion: isActive ? "HABILITAR" : "INHABILITAR",
            motivo: reason,
        });
    },
};
