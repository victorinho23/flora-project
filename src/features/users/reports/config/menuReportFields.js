// Campos que se pueden incluir en el reporte del menu
// format convierte el valor a texto legible dentro del archivo
export const menuReportFields = [
    {
        key: "name",
        label: "Nombre del platillo",
        default: true
    },
    {
        key: "price",
        label: "Precio",
        default: true,
        format: (value) => `$${Number(value ?? 0).toLocaleString("es-CO")}`
    },
    {
        key: "image",
        label: "Imagen",
        default: true,
        format: (value) => (value ? "Con imagen" : "Sin imagen")
    },
    {
        key: "category",
        label: "Categoría",
        default: true
    },
    {
        key: "description",
        label: "Descripción",
        default: true
    },
    {
        key: "is_active",
        label: "Estado",
        default: true,
        format: (value) => (value ? "Habilitado" : "Inhabilitado")
    },
];

// Tipos de reporte: todo el menu o personalizado con uno o varios platillos
export const menuReportScopes = [
    { value: "all", label: "Completo (todo el menú)" },
    { value: "pick", label: "Personalizado (uno o varios platillos)", pick: { multiple: true, min: 1, label: (dish) => `${dish.name} · ${dish.category}` } },
];
