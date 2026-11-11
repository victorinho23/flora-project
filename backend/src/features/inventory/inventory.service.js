// backend/src/features/inventory/inventory.service.js

import { inventoryRepository } from "./inventory.repository.js";
import { changesRepository } from "../changes/changes.repository.js";
import { imageUrl } from "../../config/upload.js";
import { parseIds, parseOption } from "../../config/reportFilters.js";

const STATUSES = ["Disponible", "Vencido", "Avería", "Agotado"];

const httpError = (status, message, field) => Object.assign(new Error(message), { status, field });

const toItem = (row) => row && { ...row, image: imageUrl(row.image) };

// los datos llegan como texto desde el formulario (multipart)
const cleanData = (data, file) => ({
    id: data.id?.trim(),
    brand: data.brand?.trim(),
    name: data.name?.trim(),
    barcode: data.barcode?.trim(),
    custodian: Number(data.custodian),
    quantity: Number(data.quantity),
    minQuantity: Number(data.minQuantity ?? 0),
    unitValue: Number(data.unitValue),
    status: data.status,
    expirationDate: data.expirationDate,
    description: data.description?.trim() || null,
    location: data.location?.trim() || null,
    image: file ? `/uploads/${file.filename}` : null,
});

const validate = async (product, excludeId) => {
    if (!product.id) throw httpError(400, "El ID es obligatorio", "id");
    if (!product.brand) throw httpError(400, "Debe seleccionar o agregar una marca", "brand");
    if (!product.name) throw httpError(400, "El nombre del producto es obligatorio", "name");
    if (!product.barcode) throw httpError(400, "El codigo de barras es obligatorio", "barcode");
    if (!product.custodian) throw httpError(400, "Debe seleccionar un cuentadante", "custodian");
    if (!Number.isInteger(product.quantity) || product.quantity < 0) throw httpError(400, "La cantidad debe ser un número entero", "quantity");
    if (!Number.isInteger(product.minQuantity) || product.minQuantity < 0) throw httpError(400, "La cantidad mínima no puede ser negativa", "minQuantity");
    if (!(product.unitValue > 0)) throw httpError(400, "El valor unitario debe ser mayor a 0", "unitValue");
    if (!STATUSES.includes(product.status)) throw httpError(400, "Debe seleccionar un estado", "status");
    if (!product.expirationDate) throw httpError(400, "La fecha de vencimiento es obligatoria", "expirationDate");

    const duplicates = await inventoryRepository.findDuplicates({ ...product, excludeId: excludeId ?? "" });
    if (!excludeId && duplicates.id) throw httpError(409, "Ya existe un producto con este ID", "id");
    if (duplicates.barcode) throw httpError(409, "Ya existe un producto con este código de barras", "barcode");
};

export const inventoryService = {
    async getAll() {
        const items = await inventoryRepository.getAll();
        return items.map(toItem);
    },

    // reporte: ?ids=P001,P002  ?status=Vencido  ?brand=Colanta
    async getReport(query) {
        const filters = {
            ids: parseIds(query.ids, true),
            status: parseOption(query.status, STATUSES, "El estado"),
            brand: query.brand?.trim() || undefined,
        };

        const items = await inventoryRepository.report(filters);
        return items.map(toItem);
    },

    // lista corta para asociar productos a los proveedores
    async getOptions() {
        const items = await inventoryRepository.getAll();
        return items.map((item) => ({ id: item.id, name: item.name, status: item.status }));
    },

    async getById(id) {
        const item = await inventoryRepository.findById(id);
        if (!item) throw httpError(404, "Producto no encontrado");
        return toItem(item);
    },

    async create(data, file) {
        const product = cleanData(data, file);
        await validate(product);

        // la imagen del producto es obligatoria
        if (!product.image) throw httpError(400, "La imagen del producto es obligatoria", "image");

        product.unitValue = Math.round(product.unitValue);
        await inventoryRepository.create(product);
        return { id: product.id };
    },

    async update(id, data, file) {
        const current = await inventoryRepository.findById(id);
        if (!current) throw httpError(404, "Producto no encontrado");

        // el id no se puede cambiar
        const product = { ...cleanData(data, file), id };
        await validate(product, id);

        product.unitValue = Math.round(product.unitValue);
        await inventoryRepository.update(id, product);
    },

    async updateStatus(id, { status, reason }, currentUserId) {
        const current = await inventoryRepository.findById(id);
        if (!current) throw httpError(404, "Producto no encontrado");
        if (!STATUSES.includes(status)) throw httpError(400, "Estado no valido");

        await inventoryRepository.updateStatus(id, status);

        await changesRepository.create({
            usuarioId: currentUserId,
            tabla: "lote",
            registroId: `${id}-${current.batch}`,
            accion: `ESTADO ${current.status} -> ${status}`,
            motivo: reason,
        });
    },

    async updateQuantities(items = []) {
        const clean = items.map((item) => ({ id: String(item.id), quantity: Number(item.quantity) }));
        if (clean.some((item) => !Number.isInteger(item.quantity) || item.quantity < 0)) {
            throw httpError(400, "Las cantidades deben ser numeros enteros mayores o iguales a 0");
        }
        await inventoryRepository.updateQuantities(clean);
    },
};
