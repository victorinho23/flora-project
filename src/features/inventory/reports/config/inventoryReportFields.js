// Configuracion de los campos disponibles para el reporte de inventario
// Mismo patron que userReportFields: key = propiedad del registro, label = texto visible

export const inventoryReportFields = [
    {
        key: "establecimiento",
        label: "Establecimiento",
        default: true,
    },
    {
        key: "fecha",
        label: "Fecha",
        default: true,
    },
    {
        key: "departamento",
        label: "Departamento",
        default: true,
    },
    {
        key: "empleado",
        label: "Empleado",
        default: false,
    },
    {
        key: "nombre",
        label: "Producto",
        default: true,
    },
    {
        key: "cantidad",
        label: "Cantidad",
        default: true,
    },
];
