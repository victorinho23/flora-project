// backend/src/features/suppliers/suppliers.service.js

import { suppliersRepository } from "./suppliers.repository.js";
import { changesRepository } from "../changes/changes.repository.js";
import { parseIds, parseBoolean, parseOption } from "../../config/reportFilters.js";

// tipos de documento que maneja el formulario de proveedores
const DOCUMENT_TYPES = ["NIT", "CC", "CE", "PEP", "PPT"];

const httpError = (status, message, field) => Object.assign(new Error(message), { status, field });

const cleanData = (data) => ({
    companyName: data.companyName?.trim(),
    documentType: data.documentType,
    documentNumber: String(data.documentNumber ?? "").replace(/\D/g, ""),
    products: [...new Set((data.products ?? []).map(String))],
    phone: data.phone?.trim(),
    email: data.email?.trim().toLowerCase(),
    address: data.address?.trim() || null,
    category: data.category,
    observations: data.observations?.trim() || null,
    isActive: data.isActive !== false && data.isActive !== "false",
});

const validate = async (supplier, excludeId) => {
    if (!supplier.companyName || supplier.companyName.length < 3) throw httpError(400, "El nombre de la empresa debe tener minimo 3 caracteres", "companyName");
    if (!supplier.documentType) throw httpError(400, "Debe seleccionar un tipo de documento", "documentType");
    if (!supplier.documentNumber) throw httpError(400, "El numero de documento es obligatorio", "documentNumber");
    if (!/^[0-9]{7,15}$/.test(supplier.phone ?? "")) throw httpError(400, "El telefono debe tener entre 7 y 15 digitos", "phone");
    if (!supplier.email) throw httpError(400, "El correo es obligatorio", "email");
    if (!supplier.category) throw httpError(400, "Debe seleccionar una categoria", "category");

    // No se permite un numero de documento repetido
    if (await suppliersRepository.existsDocument(supplier.documentNumber, excludeId)) {
        throw httpError(409, "Ya existe otro proveedor con este número de documento", "documentNumber");
    }
};

export const suppliersService = {
    async getAll() {
        return await suppliersRepository.getAll();
    },

    // reporte: ?ids=1,2  ?status=true|false  ?documentType=NIT  ?product=P001
    async getReport(query) {
        const filters = {
            ids: parseIds(query.ids),
            status: parseBoolean(query.status),
            documentType: parseOption(query.documentType, DOCUMENT_TYPES, "El tipo de documento"),
            product: query.product?.trim() || undefined,
        };

        return await suppliersRepository.report(filters);
    },

    async getById(id) {
        const supplier = await suppliersRepository.findById(id);
        if (!supplier) throw httpError(404, "Proveedor no encontrado");
        return supplier;
    },

    async create(data) {
        const supplier = cleanData(data);
        await validate(supplier);

        if (!supplier.isActive && supplier.products.length) {
            throw httpError(400, "Un proveedor inhabilitado no puede asociarse con nuevos productos", "products");
        }

        return await suppliersRepository.save(supplier);
    },

    async update(id, data) {
        const current = await suppliersRepository.findById(id);
        if (!current) throw httpError(404, "Proveedor no encontrado");

        const supplier = cleanData(data);
        await validate(supplier, id);

        // inhabilitado puede conservar sus productos pero no recibir nuevos
        const added = supplier.products.filter((productId) => !current.products.includes(productId));
        if (!supplier.isActive && added.length) {
            throw httpError(400, "Un proveedor inhabilitado no puede asociarse con nuevos productos", "products");
        }

        return await suppliersRepository.save(supplier, id);
    },

    async updateStatus(id, { isActive, reason }, currentUserId) {
        const current = await suppliersRepository.findById(id);
        if (!current) throw httpError(404, "Proveedor no encontrado");

        await suppliersRepository.updateStatus(id, Boolean(isActive));

        await changesRepository.create({
            usuarioId: currentUserId,
            tabla: "proveedor",
            registroId: id,
            accion: isActive ? "HABILITAR" : "INHABILITAR",
            motivo: reason,
        });
    },

    async updateContacts(items = []) {
        const clean = items.map((item) => ({
            id: Number(item.id),
            phone: String(item.phone ?? "").trim(),
            isActive: Boolean(item.isActive),
        }));

        const invalid = clean.find((item) => !/^[0-9]{7,15}$/.test(item.phone));
        if (invalid) throw httpError(400, "Todos los telefonos deben tener entre 7 y 15 digitos");

        await suppliersRepository.updateContacts(clean);
    },
};
