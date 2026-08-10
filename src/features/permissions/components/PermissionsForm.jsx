// Gestion de permisos: permite activar/desactivar permisos por usuario o por grupo
import { useState } from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Select, Button } from "@/shared";
import {ToggleSwitch} from "@/shared";
import { permissionsSchema } from "@/shared/schemas/permissionsSchema.js";

// Agrupado segun los modulos reales del proyecto (Usuarios, Inventario,
// Proveedores, Menu, Ordenes), con los permisos de cada RFADMIN correspondiente
const permissionGroups = [
    {
        title: "Usuarios",
        permissions: [
            { id: "usuarios_crear", label: "Crear usuarios" },
            { id: "usuarios_visualizar", label: "Visualizar usuarios" },
            { id: "usuarios_actualizar", label: "Actualizar usuarios" },
            { id: "usuarios_habilitar", label: "Habilitar/Deshabilitar usuarios" },
            { id: "usuarios_listar", label: "Listar usuarios" },
            { id: "usuarios_reporte", label: "Generar reporte de usuarios" },
        ],
    },
    {
        title: "Inventario",
        permissions: [
            { id: "inventario_crear", label: "Crear inventario" },
            { id: "inventario_visualizar", label: "Visualizar inventario" },
            { id: "inventario_actualizar", label: "Actualizar inventario" },
            { id: "inventario_estado", label: "Cambiar estado del inventario" },
            { id: "inventario_listar", label: "Listar inventario" },
            { id: "inventario_reporte", label: "Generar reporte de inventario" },
        ],
    },
    {
        title: "Proveedores",
        permissions: [
            { id: "proveedores_registrar", label: "Registrar proveedor" },
            { id: "proveedores_visualizar", label: "Visualizar proveedor" },
            { id: "proveedores_listar", label: "Listar proveedores" },
            { id: "proveedores_actualizar", label: "Actualizar proveedor" },
            { id: "proveedores_habilitar", label: "Habilitar/Inhabilitar proveedor" },
            { id: "proveedores_reporte", label: "Generar reporte de proveedores" },
        ],
    },
    {
        title: "Menu",
        permissions: [
            { id: "menu_agregar", label: "Agregar menu" },
            { id: "menu_visualizar", label: "Visualizar menu" },
            { id: "menu_listar", label: "Listar menu" },
            { id: "menu_actualizar", label: "Actualizar menu" },
            { id: "menu_habilitar", label: "Habilitar/Deshabilitar menu" },
            { id: "menu_reporte", label: "Generar reporte de menu" },
        ],
    },
    {
        title: "Ordenes",
        permissions: [
            { id: "ordenes_crear", label: "Crear orden" },
            { id: "ordenes_visualizar", label: "Visualizar orden" },
            { id: "ordenes_listar", label: "Listar ordenes" },
            { id: "ordenes_actualizar", label: "Actualizar orden" },
            { id: "ordenes_anular", label: "Anular orden" },
            { id: "ordenes_reporte", label: "Generar reporte de ordenes" },
        ],
    },
];

// Mismos links que el dropdown de Home, como sidebar
const sidebarLinks = [
    { to: "/userCreate", label: "Crear usuarios" },
    { to: "/suppliersCreate", label: "Crear proveedores" },
    { to: "/createDishes", label: "Crear Menu" },
    { to: "/createOrders", label: "Crear Orden" },
    { to: "/createInventory", label: "Crear inventario" },
    { to: "/auth", label: "Cerrar sesion" },
];

// Datos de prueba, mientras no exista el backend
const mockUsers = [
    { id: "user-1", label: "Carlos Alzate" },
    { id: "user-2", label: "Saray Ospina" },
];

const mockGroups = [
    { id: "admin", label: "Administrador" },
    { id: "mesero", label: "Mesero" },
    { id: "cocinero", label: "Cocinero" },
];

export default function PermissionsForm() {
    const [targetUser, setTargetUser] = useState("");
    const [targetGroup, setTargetGroup] = useState("");
    const [permissions, setPermissions] = useState({});
    const [errors, setErrors] = useState({});

    const togglePermission = (id, value) => {
        setPermissions((prev) => ({ ...prev, [id]: value }));
    };

    const handleSave = () => {
        const formData = { targetUser, targetGroup, permissions };
        const result = permissionsSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        // Aqui luego va la llamada real al backend
        // await savePermissions(result.data)

        alert("Permisos guardados correctamente");
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row">

            {/** Sidebar de navegacion, mismos links del dropdown de Home + casita */}
            <aside className="w-full lg:w-64 flex-shrink-0 bg-bg-s900/90 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-bd-w/15 flex flex-col gap-2 p-4">

                <Link
                    to="/home"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-bg-w font-semibold hover:bg-bg-w/10 transition-colors mb-2"
                >
                    <Home className="w-5 h-5" />
                    Inicio
                </Link>

                <div className="border-b border-bd-w/15 mb-2" />

                {sidebarLinks.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="px-4 py-3 rounded-lg text-bg-w/90 hover:bg-bg-w/10 hover:text-bg-w transition-colors"
                    >
                        {link.label}
                    </Link>
                ))}

            </aside>

            {/** Contenido principal */}
            <div className="flex-1 flex items-start justify-center px-4 py-10">
                <div className="w-full max-w-5xl bg-bg-s900/85 backdrop-blur-md border border-bd-w/15 rounded-2xl p-6 sm:p-10">

                    <h1 className="text-title text-bg-w font-bold text-center mb-8">
                        Gestion de permisos
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                        <Select
                            label="Seleccionar usuario"
                            name="targetUser"
                            value={targetUser}
                            htmlFor="targetUser"
                            options={mockUsers}
                            onChange={(e) => setTargetUser(e.target.value)}
                            error={errors.targetUser}
                            variant="cafe"
                        />

                        <Select
                            label="Seleccionar grupo"
                            name="targetGroup"
                            value={targetGroup}
                            htmlFor="targetGroup"
                            options={mockGroups}
                            onChange={(e) => setTargetGroup(e.target.value)}
                            variant="cafe"
                        />
                    </div>

                    <div className="flex flex-col gap-8">
                        {permissionGroups.map((group, index) => (
                            <div key={group.title}>
                                <h2 className="text-subtitle text-br-t400 font-bold mb-4">
                                    {group.title}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                    {group.permissions.map((perm) => (
                                        <ToggleSwitch
                                            key={perm.id}
                                            label={perm.label}
                                            checked={!!permissions[perm.id]}
                                            onChange={(value) => togglePermission(perm.id, value)}
                                        />
                                    ))}
                                </div>
                                {index < permissionGroups.length - 1 && (
                                    <div className="border-b border-bd-w/15 mt-6" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mt-8">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="bg-br-t600 hover:bg-br-t700 text-white font-semibold px-8 py-3 rounded-lg shadow-[0_0_15px_rgba(183,95,6,0.4)] transition-all"
                        >
                            Guardar permisos
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}