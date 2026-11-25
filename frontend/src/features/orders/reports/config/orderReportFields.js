// Configuracion del reporte de ordenes

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
// la key es el nombre del filtro que recibe el backend (?status=...&table=...&waiter=...)
// recibe las ordenes que llegan del backend para armar las opciones
export const orderReportFilters = (orders) => [
    {
        key: "status",
        label: "Estado",
        options: Object.entries(orderStatusLabels).map(([value, label]) => ({ value, label })),
    },
    {
        key: "table",
        label: "Mesa",
        options: [...new Set(orders.map((order) => Number(order.tableNumber)))].sort((a, b) => a - b).map((table) => ({ value: String(table), label: `Mesa ${table}` })),
    },
    {
        key: "waiter",
        label: "Mesero",
        // al backend se manda el id del mesero y en la lista se ve el nombre
        options: [...new Map(orders.map((order) => [order.waiterId, order.waiter])).entries()]
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([id, name]) => ({ value: id, label: name })),
    },
];

// Rango de fechas opcional sobre la fecha de la orden (se manda como ?from=...&to=...)
export const orderReportDateRange = { key: "createdAt", label: "Fecha" };
