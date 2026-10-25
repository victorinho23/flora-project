// Configuracion del reporte de ordenes
import { orders } from "../../data/orders";

// Textos legibles de cada estado de la orden, tambien los usa la tabla
export const orderStatusLabels = {
    ACTIVA: "Activa",
    LISTA_PARA_ENTREGA: "Lista para entrega",
    PAGADA: "Pagada",
    CANCELADA: "Cancelada",
};

// Campos que se pueden incluir en el reporte
export const orderReportFields = [
    {
        key: "id",
        label: "Id",
        default: true
    },
    {
        key: "createdAt",
        label: "Fecha",
        default: true,
        format: (value) => new Date(value).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })
    },
    {
        key: "tableNumber",
        label: "Mesa",
        default: true
    },
    {
        key: "waiter",
        label: "Mesero",
        default: true
    },
    {
        key: "customer",
        label: "Cliente",
        default: true
    },
    {
        key: "product",
        label: "Producto",
        default: true
    },
    {
        key: "quantity",
        label: "Cantidad",
        default: true
    },
    {
        key: "total",
        label: "Total",
        default: true,
        format: (value) => `$${Number(value ?? 0).toLocaleString("es-CO")}`
    },
    {
        key: "status",
        label: "Estado",
        default: true,
        format: (value) => orderStatusLabels[value] ?? value
    },
];

// Texto con el que se muestra cada orden al elegirla
const orderLabel = (order) => `Orden #${order.id} · Mesa ${order.tableNumber} · ${order.waiter}`;

// Tipos de reporte: todas, individual o personalizado con 2 o mas ordenes
export const orderReportScopes = [
    { value: "all", label: "Todas las órdenes" },
    { value: "single", label: "Reporte individual", pick: { multiple: false, label: orderLabel } },
    { value: "custom", label: "Reporte personalizado (2 o más órdenes)", pick: { multiple: true, min: 2, label: orderLabel } },
];

// Filtros opcionales que se pueden combinar: estado, mesa y mesero
export const orderReportFilters = [
    {
        key: "status",
        label: "Estado",
        options: Object.entries(orderStatusLabels).map(([value, label]) => ({ value, label })),
        match: (order, value) => order.status === value
    },
    {
        key: "table",
        label: "Mesa",
        options: [...new Set(orders.map((order) => order.tableNumber))].sort((a, b) => a - b).map((table) => ({ value: String(table), label: `Mesa ${table}` })),
        match: (order, value) => String(order.tableNumber) === value
    },
    {
        key: "waiter",
        label: "Mesero",
        options: [...new Set(orders.map((order) => order.waiter))].sort().map((waiter) => ({ value: waiter, label: waiter })),
        match: (order, value) => order.waiter === value
    },
];

// Rango de fechas opcional sobre la fecha de la orden
export const orderReportDateRange = { key: "createdAt", label: "Fecha" };
