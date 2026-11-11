// src/features/inventory/services/inventoryService.js
// Funciones que consumen la API de inventario (productos, lotes y marcas)

import { request, toFormData } from "@/features/config";

const INVENTORY_URL = "/inventory";

// cada producto llega con los datos de su ultimo lote
export async function getInventory() {
    return await request(INVENTORY_URL);
}

// trae los productos del inventario del reporte ya filtrados por el backend
// params es un objeto con los filtros, ej: { status: "true", ids: "1,2" }
export async function getInventoryReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`${INVENTORY_URL}/report${query ? `?${query}` : ""}`);
}

// lista corta (id, nombre, estado) para asociar productos a los proveedores
export async function getInventoryOptions() {
    return await request(`${INVENTORY_URL}/options`);
}

// registra el producto con su primer lote, va con FormData por la imagen
export async function createInventoryItem(productData) {
    return await request(INVENTORY_URL, {
        method: "POST",
        body: toFormData(productData, "image"),
        isForm: true,
    });
}

export async function updateInventoryItem(id, productData) {
    return await request(`${INVENTORY_URL}/${id}`, {
        method: "PUT",
        body: toFormData(productData, "image"),
        isForm: true,
    });
}

// cambia el estado del lote (Disponible, Vencido, Avería, Agotado)
export async function updateInventoryStatus(id, status, reason) {
    return await request(`${INVENTORY_URL}/${id}/status`, {
        method: "PATCH",
        body: { status, reason },
    });
}

// guarda las cantidades editadas en la tabla de actualizar inventario
export async function updateInventoryQuantities(items) {
    return await request(`${INVENTORY_URL}/quantities`, {
        method: "PUT",
        body: { items },
    });
}

// marcas registradas para el select
export async function getBrands() {
    return await request("/brands");
}
