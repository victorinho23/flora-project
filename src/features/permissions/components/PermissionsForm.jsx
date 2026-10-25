// Gestion de permisos: permite activar/desactivar permisos por usuario o por grupo
import { useState } from "react";
import { Select, Button, Navbar } from "@/shared";
import { ToggleSwitch } from "@/shared";
import { permissionsSchema } from "@/shared/schemas/permissionsSchema.js";
import { showSuccesAlert } from "../../../shared/services/alertService";
import fotoFondo from "@/assets/images/cafe.png";


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
         try{

        showSuccesAlert({
            title:"Permisos concebidos",
            text: "Permisos guardados correctamente",
            timer: 3000.
        })
        
       
    } catch(error){

        //Capturanmos errores de red o errores lanzados por el service
        console.log("Error: ", error.message)

    }
        
        
    };

    return (
        <div className="min-h-screen w-full flex flex-col">
            <Navbar variant="links" image={fotoFondo} />

            {/** Contenido principal */}
            <div className="flex-1 flex items-start justify-center px-4 py-10 w-full">
                <div className="w-full max-w-5xl border border-bd-s100 border-t-[5px] border-t-bd-t800 rounded-[1.25rem] bg-bg-w bg-linear-180 from-bg-w to-bg-p50 shadow-[0_26px_50px_-28px_color-mix(in_srgb,var(--color-bg-s950)_55%,transparent)] p-6 sm:p-10">

                    <div className="w-full text-bg-w bg-bg-s950 bg-cover bg-center bg-[linear-gradient(110deg,color-mix(in_srgb,var(--color-bg-s950)_82%,transparent)_0%,color-mix(in_srgb,var(--color-bg-s900)_84%,transparent)_55%,color-mix(in_srgb,var(--color-bg-t950)_88%,transparent)_100%),var(--foto)] flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-4 sm:py-6 bajo:sm:py-2 rounded-2xl shadow-lg mb-8" style={{ "--foto": `url(${fotoFondo})` }}>
                        <div className="w-8" />
                        <h1 className="text-title text-bg-w font-bold text-center">Gestion de permisos</h1>
                        <div className="w-8" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 [&_select]:w-full">
                        <Select
                            label="Seleccionar usuario"
                            name="targetUser"
                            value={targetUser}
                            htmlFor="targetUser"
                            options={mockUsers}
                            onChange={(e) => setTargetUser(e.target.value)}
                            error={errors.targetUser}
                            variant="latte"
                        />

                        <Select
                            label="Seleccionar grupo"
                            name="targetGroup"
                            value={targetGroup}
                            htmlFor="targetGroup"
                            options={mockGroups}
                            onChange={(e) => setTargetGroup(e.target.value)}
                            variant="latte"
                        />
                    </div>

                    <div className="flex flex-col gap-8">
                        {permissionGroups.map((group, index) => (
                            <div key={group.title}>
                                <h2 className="text-subtitle text-br-t900 font-bold mb-4">
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
                                    <div className="border-b border-bd-s100 mt-6" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center sm:justify-end mt-8">
                        <Button
                            type="button"
                            onClick={handleSave}
                            variant="caramelo"
                        >
                            Guardar permisos
                        </Button>
                    </div>

                </div>
            </div>

        </div>
    );
}