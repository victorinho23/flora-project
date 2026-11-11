// Configuracion del reporte de proveedores

// Campos que se pueden incluir en el reporte
export const supplierReportFields = [
    {
        key: "companyName",
        label: "Nombre",
        default: true
    },
    {
        key: "documentType",
        label: "Tipo de documento",
        default: true
    },
    {
        key: "nit",
        label: "Número de documento",
        default: true
    },
    {
        key: "productList",
        label: "Productos que suministra",
        default: true,
        format: (value = []) => value.map((product) => product.name).sort((a, b) => a.localeCompare(b)).join(", ")
    },
    {
        key: "phone",
        label: "Teléfono",
        default: true
    },
    {
        key: "email",
        label: "Correo electrónico",
        default: true
    },
    {
        key: "address",
        label: "Dirección",
        default: true
    },
    {
        key: "isActive",
        label: "Estado",
        default: true,
        format: (value) => (value ? "Habilitado" : "Inhabilitado")
    },
    {
        key: "observations",
        label: "Observaciones",
        default: false
    },
];

// Tipos de reporte: todos o seleccion de uno o varios proveedores
export const supplierReportScopes = [
    { value: "all", label: "Todos los proveedores" },
    { value: "pick", label: "Selección individual (uno o varios)", pick: { multiple: true, min: 1, label: (supplier) => `${supplier.companyName} · ${supplier.nit}` } },
];

// Filtros opcionales que se pueden combinar: estado, tipo de documento y producto
// la key es el nombre del filtro que recibe el backend (?status=...&documentType=...&product=...)
// recibe los productos del inventario que llegan del backend
export const supplierReportFilters = (inventory) => [
    {
        key: "status",
        label: "Estado",
        options: [
            { value: "true", label: "Habilitados" },
            { value: "false", label: "Inhabilitados" },
        ],
    },
    {
        key: "documentType",
        label: "Tipo de documento",
        options: ["NIT", "CC", "CE", "PEP", "PPT"].map((type) => ({ value: type, label: type })),
    },
    {
        key: "product",
        label: "Producto suministrado",
        options: inventory.map((item) => ({ value: item.id, label: item.name })),
    },
];
