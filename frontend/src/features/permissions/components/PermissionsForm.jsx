// Gestion de permisos: permite activar/desactivar permisos por usuario o por grupo
import { useEffect, useState } from "react";
import { Select, Button, Navbar } from "@/shared";
import { ToggleSwitch } from "@/shared";
import { permissionsSchema } from "@/shared/schemas/permissionsSchema.js";
import { showSuccesAlert, showErrorAlert } from "../../../shared/services/alertService";
import { getGroups, updateGroupPermissions } from "../services/groupService";
import { getAllPermissions, getGroupPermissions } from "../services/permissionService";
import { getUserOptions, getUserPermissions, updateUserPermissions } from "@/features/users/services/userServices";
import fotoFondo from "@/assets/images/cafe.png";


export default function PermissionsForm() {
    const [targetUser, setTargetUser] = useState("");
    const [targetGroup, setTargetGroup] = useState("");
    const [permissions, setPermissions] = useState({});
    const [errors, setErrors] = useState({});

    // datos que llegan del backend
    const [allPermissions, setAllPermissions] = useState([]);
    const [groupOptions, setGroupOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);

    useEffect(() => {
        getAllPermissions().then(setAllPermissions).catch(console.error);
        getGroups().then((groups) => setGroupOptions(groups.map((group) => ({ id: String(group.group_id), label: group.group_name })))).catch(console.error);
        getUserOptions().then((users) => setUserOptions(users.map((user) => ({ id: String(user.id), label: user.username })))).catch(console.error);
    }, []);

    // Agrupar permisos por módulo (display_name de content_type)
    const permissionGroups = Object.values(
        allPermissions.reduce((groupedPermissions, permission) => {
            const moduleName = permission.display_name;
            groupedPermissions[moduleName] ??= { title: moduleName, permissions: [] };
            groupedPermissions[moduleName].permissions.push({
                id: permission.permission_codename,
                permissionId: permission.permission_id,
                label: permission.permission_name,
            });
            return groupedPermissions;
        }, {})
    );

    // pasa la lista de permisos de la base al objeto { codename: true } que usan los switch
    const toChecked = (list) => Object.fromEntries(list.map((permission) => [permission.permission_codename, true]));

    // al elegir un grupo se cargan sus permisos (y se limpia el usuario)
    const handleGroupChange = async (groupId) => {
        setTargetGroup(groupId);
        setTargetUser("");
        setPermissions(groupId ? toChecked(await getGroupPermissions(groupId)) : {});
    };

    // al elegir un usuario se cargan sus permisos individuales (y se limpia el grupo)
    const handleUserChange = async (userId) => {
        setTargetUser(userId);
        setTargetGroup("");
        setPermissions(userId ? toChecked(await getUserPermissions(userId)) : {});
    };

    const togglePermission = (id, value) => {
        setPermissions((prev) => ({ ...prev, [id]: value }));
    };

    const handleSave = async () => {
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

        // mandamos solo los ids de los permisos que quedaron activos
        const permissionIds = allPermissions
            .filter((permission) => permissions[permission.permission_codename])
            .map((permission) => permission.permission_id);

        if (targetGroup) {
            await updateGroupPermissions(targetGroup, permissionIds);
        } else {
            await updateUserPermissions(targetUser, permissionIds);
        }

        await showSuccesAlert({
            title:"Permisos concebidos",
            text: "Permisos guardados correctamente",
            timer: 3000.
        })
        
       
    } catch(error){

        //Capturanmos errores de red o errores lanzados por el service
        console.log("Error: ", error.message)
        await showErrorAlert({
            title: "No se pudieron guardar los permisos",
            text: error.message,
            confirmButtonText: "Entendido",
            timer: 4000,
        })

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
                            options={userOptions}
                            onChange={(e) => handleUserChange(e.target.value)}
                            error={errors.targetUser}
                            variant="latte"
                        />

                        <Select
                            label="Seleccionar grupo"
                            name="targetGroup"
                            value={targetGroup}
                            htmlFor="targetGroup"
                            options={groupOptions}
                            onChange={(e) => handleGroupChange(e.target.value)}
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