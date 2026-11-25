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

// estados de una orden abierta (la mesa esta ocupada con ella); PAGADA y CANCELADA ya la cierran
export const OPEN_STATUSES = ["ACTIVA", "LISTA_PARA_ENTREGA", "ENTREGADA", "CUENTA_PEDIDA"];
const isOpen = (order) => OPEN_STATUSES.includes(order.status);

// en que va cada mesa y su color (el mapa usa "tile", fuerte; las cajitas usan "box", suave)
// attention = la mesa necesita que alguien vaya (pedido listo o pidio la cuenta): sale con un punto que titila
export const TABLE_STATES = {
    LIBRE: { label: "Libre", tile: "bg-bg-w border-2 border-bd-s500 text-br-s950", box: "bg-bg-w border-bd-s300 text-br-s950", dot: "bg-bg-w border-2 border-bd-s500" },
    OCUPADA: { label: "Ocupada · sin pedir", tile: "bg-m3-info-container border-2 border-m3-info text-m3-info", box: "bg-bg-w border-2 border-dashed border-m3-info text-m3-info", dot: "bg-m3-info-container border-2 border-m3-info" },
    ACTIVA: { label: "Esperando pedido", tile: "bg-bg-t300 border-2 border-bg-w text-br-s950", box: "bg-bg-t100 border-bd-t800 text-br-t950", dot: "bg-bg-t300" },
    LISTA_PARA_ENTREGA: { label: "Pedido listo · llevar", tile: "bg-m3-success border-2 border-bg-w text-bg-w", box: "bg-m3-success-container border-m3-success text-m3-success", dot: "bg-m3-success", attention: true },
    ENTREGADA: { label: "Pedido entregado", tile: "bg-m3-info border-2 border-bg-w text-bg-w", box: "bg-m3-info-container border-m3-info text-m3-info", dot: "bg-m3-info" },
    CUENTA_PEDIDA: { label: "Pidió la cuenta", tile: "bg-m3-error border-2 border-bg-w text-m3-on-error", box: "bg-m3-error-container border-m3-error text-m3-on-error-container", dot: "bg-m3-error", attention: true },
};

// el mesero marca la mesa ocupada cuando se sientan los clientes, o la libera si se fueron sin pedir
export async function setTableOccupied(tableId, occupied) {
    return await request(`/tables/${tableId}/occupancy`, { method: "PATCH", body: { occupied } });
}

// mesas desde la base: { total, tables: [mesas activas con zona, capacidad y celda del mapa], open: [ordenes abiertas], maps: pisos del mapa del restaurante }
// las mesas se crean en Configuracion; todas empiezan libres y solo cambian si tienen una orden abierta.
// Si el backend no responde se arman las mesas 1..12 desde la lista de ordenes
// (el backend igual no deja usar una mesa ocupada)
const defaultTables = () => Array.from({ length: TOTAL_MESAS }, (_, index) => ({ number: index + 1, capacity: 4, zone: "Salón" }));

export async function getTables() {
    try {
        const data = await request(`${ORDERS_URL}/tables`);
        const tables = Array.isArray(data?.tables) ? data.tables : defaultTables();
        return { total: tables.length, tables, open: data?.open ?? [], maps: data?.maps ?? [] };
    } catch {
        try {
            const orders = await getOrders();
            return { total: TOTAL_MESAS, tables: defaultTables(), open: orders.filter(isOpen), maps: [] };
        } catch {
            return { total: TOTAL_MESAS, tables: defaultTables(), open: [], maps: [] };
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

// mueve la orden en el flujo de la comanda: ACTIVA -> LISTA_PARA_ENTREGA -> ENTREGADA -> CUENTA_PEDIDA -> PAGADA
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
