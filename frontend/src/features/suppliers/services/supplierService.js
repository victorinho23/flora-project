// src/features/suppliers/services/supplierService.js
// Funciones que consumen la API de proveedores

import { request } from "@/features/config";

const SUPPLIERS_URL = "/suppliers";

// cada proveedor llega con products (ids) y productList (id, nombre y estado)
export async function getSuppliers() {
    return await request(SUPPLIERS_URL);
}

// trae los proveedores del reporte ya filtrados por el backend
// params es un objeto con los filtros, ej: { status: "true", ids: "1,2" }
export async function getSuppliersReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`${SUPPLIERS_URL}/report${query ? `?${query}` : ""}`);
}

export async function createSupplier(supplierData) {
    return await request(SUPPLIERS_URL, {
        method: "POST",
        body: supplierData,
    });
}

export async function updateSupplier(id, supplierData) {
    return await request(`${SUPPLIERS_URL}/${id}`, {
        method: "PUT",
        body: supplierData,
    });
}

// habilita o inhabilita, el motivo queda en registro de cambios
export async function updateSupplierStatus(id, isActive, reason) {
    return await request(`${SUPPLIERS_URL}/${id}/status`, {
        method: "PATCH",
        body: { isActive, reason },
    });
}

// guarda los telefonos y estados editados en la tabla de actualizar proveedores
export async function updateSupplierContacts(items) {
    return await request(`${SUPPLIERS_URL}/contacts`, {
        method: "PUT",
        body: { items },
    });
}
