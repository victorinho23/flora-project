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

// mesas desde la base: { total, tables: [mesas activas con zona, capacidad y celda del mapa], open: [ordenes abiertas], map: mapa del restaurante }
// las mesas se crean en Configuracion; todas empiezan libres y solo cambian si tienen una orden abierta.
// Si el backend no responde se arman las mesas 1..12 desde la lista de ordenes
// (el backend igual no deja usar una mesa ocupada)
const defaultTables = () => Array.from({ length: TOTAL_MESAS }, (_, index) => ({ number: index + 1, capacity: 4, zone: "Salón" }));

export async function getTables() {
    try {
        const data = await request(`${ORDERS_URL}/tables`);
        const tables = Array.isArray(data?.tables) ? data.tables : defaultTables();
        return { total: tables.length, tables, open: data?.open ?? [], map: data?.map ?? null };
    } catch {
        try {
            const orders = await getOrders();
            return { total: TOTAL_MESAS, tables: defaultTables(), open: orders.filter(isOpen), map: null };
        } catch {
            return { total: TOTAL_MESAS, tables: defaultTables(), open: [], map: null };
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
