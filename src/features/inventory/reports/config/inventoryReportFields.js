// Configuracion de los campos disponibles para el reporte de inventario
// Mismo patron que userReportFields: key = propiedad del registro, label = texto visible

export const inventoryReportFields = [
    {
        key: "id",
        label: "ID",
        default: false,
    },
    {
        key: "brand",
        label: "Marca",
        default: true,
    },
    {
        key: "name",
        label: "Nombre del producto",
        default: true,
    },
    {
        key: "barcode",
        label: "Código de barras",
        default: false,
    },
    {
        key: "quantity",
        label: "Cantidad",
        default: true,
    },
    {
        key: "totalQuantity",
        label: "Cantidad total",
        default: true,
    },
    {
        key: "unitValue",
        label: "Valor unitario",
        default: true,
    },
    {
        key: "totalValue",
        label: "Valor total",
        default: true,
    },
    {
        key: "status",
        label: "Estado",
        default: true,
    },
    {
        key: "expirationDate",
        label: "Fecha de vencimiento",
        default: false,
    },
    {
        key: "description",
        label: "Descripción",
        default: false,
    },
];
