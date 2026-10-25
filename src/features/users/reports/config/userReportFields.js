// Configuracion del reporte de usuarios
// Textos legibles de cada tipo de usuario
const userTypeLabels = { ADMIN: "Administrador", MESERO: "Mesero", COCINERO: "Cocinero" };

// Campos que se pueden incluir en el reporte, nunca se incluye la contrasena
export const userReportFields = [
    {
        key: "username",
        label: "Nombre completo",
        default: true
    },
    {
        key: "document_type",
        label: "Tipo de documento",
        default: true
    },
    {
        key: "document_number",
        label: "Número de documento",
        default: true
    },
    {
        key: "usertype",
        label: "Tipo de usuario",
        default: true,
        format: (value) => userTypeLabels[value] ?? value
    },
    {
        key: "start_date",
        label: "Fecha de inicio",
        default: true
    },
    {
        key: "end_date",
        label: "Fecha de finalización",
        default: true
    },
    {
        key: "useremail",
        label: "Correo personal",
        default: true
    },
    {
        key: "business_email",
        label: "Segundo correo",
        default: false
    },
    {
        key: "userphone",
        label: "Teléfono",
        default: true
    },
    {
        key: "address",
        label: "Dirección",
        default: true
    },
    {
        key: "is_active",
        label: "Estado",
        default: true,
        format: (value) => (value ? "Habilitado" : "Inhabilitado")
    },
];

// Tipos de reporte: todos, habilitados, deshabilitados o individual
export const userReportScopes = [
    { value: "all", label: "Todos los usuarios" },
    { value: "enabled", label: "Usuarios habilitados", filter: (user) => user.is_active },
    { value: "disabled", label: "Usuarios deshabilitados", filter: (user) => !user.is_active },
    { value: "pick", label: "Reporte individual", pick: { multiple: false, label: (user) => `${user.username} · ${user.document_number}` } },
];
