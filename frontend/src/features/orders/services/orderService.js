// src/features/orders/services/orderService.js
// Funciones que consumen la API de ordenes

import { request } from "@/features/config";

const ORDERS_URL = "/orders";

export async function getOrders() {
    return await request(ORDERS_URL);
}

// trae los ordenes del reporte ya filtrados por el backend
// params es un objeto con los filtros, ej: { status: "true", ids: "1,2" }
export async function getOrdersReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`${ORDERS_URL}/report${query ? `?${query}` : ""}`);
}

export async function getOrderById(id) {
    return await request(`${ORDERS_URL}/${id}`);
}

// crea la orden, el mesero es el usuario de la sesion
// si la mesa ya tiene una orden activa el backend responde 409 con activeOrderId
// y con merge: true los platillos se agregan a esa orden
export async function createOrder(orderData, merge = false) {
    return await request(ORDERS_URL, {
        method: "POST",
        body: { ...orderData, merge },
    });
}

export async function updateOrder(id, orderData) {
    return await request(`${ORDERS_URL}/${id}`, {
        method: "PUT",
        body: orderData,
    });
}

// anular deja la orden en CANCELADA y queda en el registro de cambios
export async function cancelOrder(id, reason) {
    return await request(`${ORDERS_URL}/${id}/cancel`, {
        method: "PATCH",
        body: { reason },
    });
}
