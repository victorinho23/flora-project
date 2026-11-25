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

// mesas del restaurante si el backend no dice otra cantidad
export const TOTAL_MESAS = 12;

const isOpen = (order) => order.status === "ACTIVA" || order.status === "LISTA_PARA_ENTREGA";

// plano de mesas desde la base: { total, open: [ordenes abiertas con su mesa] }
// todas las mesas empiezan libres y solo cambian si tienen una orden abierta.
// Si el backend todavia no tiene /orders/tables (no se ha reiniciado), se sacan de la lista de ordenes,
// y si tampoco se puede, se muestran todas libres (el backend igual no deja usar una mesa ocupada)
export async function getTables() {
    try {
        const data = await request(`${ORDERS_URL}/tables`);
        return { total: Number(data?.total) || TOTAL_MESAS, open: data?.open ?? [] };
    } catch {
        try {
            const orders = await getOrders();
            return { total: TOTAL_MESAS, open: orders.filter(isOpen) };
        } catch {
            return { total: TOTAL_MESAS, open: [] };
        }
    }
}

// crea la orden, el mesero es el usuario de la sesion
// si la mesa esta ocupada el backend responde 409 con activeOrderId (la orden que la tiene)
export async function createOrder(orderData) {
    return await request(ORDERS_URL, {
        method: "POST",
        body: orderData,
    });
}

export async function updateOrder(id, orderData) {
    return await request(`${ORDERS_URL}/${id}`, {
        method: "PUT",
        body: orderData,
    });
}

// mueve la orden en el flujo de la comanda: ACTIVA -> LISTA_PARA_ENTREGA -> PAGADA
export async function changeOrderStatus(id, status) {
    return await request(`${ORDERS_URL}/${id}/status`, {
        method: "PATCH",
        body: { status },
    });
}

// anular deja la orden en CANCELADA y queda en el registro de cambios
export async function cancelOrder(id, reason) {
    return await request(`${ORDERS_URL}/${id}/cancel`, {
        method: "PATCH",
        body: { reason },
    });
}
