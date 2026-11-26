// Gestion de permisos: permite activar/desactivar permisos por usuario o por grupo
import { useEffect, useState } from "react";
import { Users, UserRound, RotateCcw } from "lucide-react";
import { Select, Button, Navbar } from "@/shared";
import { ToggleSwitch } from "@/shared";
import { permissionsSchema } from "@/shared/schemas/permissionsSchema.js";
import { showSuccesAlert, showErrorAlert } from "../../../shared/services/alertService";
import { getGroups, updateGroupPermissions } from "../services/groupService";
import { getAllPermissions, getGroupPermissions } from "../services/permissionService";
import { getUserOptions, getUserPermissions, updateUserPermissions } from "@/features/users/services/userServices";
import fotoFondo from "@/assets/images/cafe.png";
import { showConfirmAlert } from "@/shared/services/alertService";


// tipo de usuario -> nombre del grupo, para mostrar de que grupo vienen los permisos
const GROUP_NAMES = { ADMIN: "Administrador", MESERO: "Mesero", COCINERO: "Cocinero" };

export default function PermissionsForm() {
    // "group" = permisos de un grupo, "user" = permisos individuales de un usuario
    const [mode, setMode] = useState("group");
    const [targetUser, setTargetUser] = useState("");
    const [targetGroup, setTargetGroup] = useState("");
    const [permissions, setPermissions] = useState({});
    // permisos que el usuario elegido recibe por su grupo (para saber que se le da o se le quita)
    const [groupOfUser, setGroupOfUser] = useState(new Set());
    const [errors, setErrors] = useState({});

    // datos que llegan del backend
    const [allPermissions, setAllPermissions] = useState([]);
    const [groupOptions, setGroupOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);

    useEffect(() => {
        getAllPermissions().then(setAllPermissions).catch(console.error);
        getGroups().then((groups) => setGroupOptions(groups.map((group) => ({ id: String(group.group_id), label: group.group_name })))).catch(console.error);
        getUserOptions().then((users) => setUserOptions(users.map((user) => ({ id: String(user.id), label: user.username, group: GROUP_NAMES[user.usertype] ?? user.usertype })))).catch(console.error);
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

    // al elegir un usuario se marcan los permisos que de verdad tiene (y se limpia el grupo):
    // los de su grupo + los que se le dieron - los que se le quitaron
    const handleUserChange = async (userId) => {
        setTargetUser(userId);
        setTargetGroup("");
        if (!userId) {
            setGroupOfUser(new Set());
            setPermissions({});
            return;
        }
        const data = await getUserPermissions(userId);
        const fromGroup = new Set(data.groupPermissions ?? []);
        const denied = new Set((data.denied ?? []).map((permission) => permission.permission_codename));
        const effective = { ...Object.fromEntries([...fromGroup].map((code) => [code, true])), ...toChecked(data.granted ?? []) };
        denied.forEach((code) => delete effective[code]);
        setGroupOfUser(fromGroup);
        setPermissions(effective);
    };

    // cambiar de modo limpia lo elegido
    const changeMode = (next) => {
        setMode(next);
        setTargetUser("");
        setTargetGroup("");
        setGroupOfUser(new Set());
        setPermissions({});
        setErrors({});
    };

    // como queda cada permiso del usuario frente a su grupo
    const originOf = (code) => {
        const inGroup = groupOfUser.has(code);
        const on = Boolean(permissions[code]);
        if (inGroup && on) return { label: "Del grupo", style: "bg-bg-t50 text-br-t950 border-bd-t300" };
        if (!inGroup && on) return { label: "Dado a este usuario", style: "bg-m3-success-container text-m3-success border-transparent" };
        if (inGroup && !on) return { label: "Quitado a este usuario", style: "bg-m3-error-container text-m3-on-error-container border-transparent" };
        return null;
    };
    const codes = allPermissions.map((permission) => permission.permission_codename);
    const givenCount = codes.filter((code) => permissions[code] && !groupOfUser.has(code)).length;
    const removedCount = codes.filter((code) => !permissions[code] && groupOfUser.has(code)).length;
    const selectedUser = userOptions.find((user) => user.id === targetUser);

    // deja al usuario igual que su grupo (quita lo que se le dio y devuelve lo que se le quito)
    const resetToGroup = () => setPermissions(Object.fromEntries([...groupOfUser].map((code) => [code, true])));

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

        // cambiar permisos es delicado: se confirma antes de guardar
        const confirmation = await showConfirmAlert({
            title: "¿Guardar los permisos?",
            text: targetGroup ? "Se aplicarán a todos los usuarios de este grupo." : "Se aplicarán solo a este usuario.",
            confirmButtonText: "Guardar permisos",
        });
        if (!confirmation.isConfirmed) return;

         try{

        // mandamos solo los ids de los permisos que quedaron activos
        const permissionIds = allPermissions
            .filter((permission) => permissions[permission.permission_codename])
            .map((permission) => permission.permission_id);

        if (targetGroup) {
            await updateGroupPermissions(targetGroup, permissionIds);
        } else {
            // al usuario solo se le guarda la diferencia con su grupo:
            // granted = encendidos que el grupo no da, denied = apagados que el grupo si da
            const granted = allPermissions
                .filter((permission) => permissions[permission.permission_codename] && !groupOfUser.has(permission.permission_codename))
                .map((permission) => permission.permission_id);
            const denied = allPermissions
                .filter((permission) => !permissions[permission.permission_codename] && groupOfUser.has(permission.permission_codename))
                .map((permission) => permission.permission_id);
            await updateUserPermissions(targetUser, { granted, denied });
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
                <div className="w-full max-w-5xl border border-bd-s100 border-t-5 border-t-bd-t800 rounded-m3-lg bg-bg-w bg-linear-180 from-bg-w to-bg-p50 shadow-m3-1 p-6 sm:p-10">

                    <div className="w-full text-bg-w bg-bg-s950 bg-cover bg-center bg-[linear-gradient(110deg,color-mix(in_srgb,var(--color-bg-s950)_82%,transparent)_0%,color-mix(in_srgb,var(--color-bg-s900)_84%,transparent)_55%,color-mix(in_srgb,var(--color-bg-t950)_88%,transparent)_100%),var(--foto)] flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-4 sm:py-6 bajo:sm:py-2 rounded-m3-lg shadow-m3-2 mb-8" style={{ "--foto": `url(${fotoFondo})` }}>
                        <div className="w-8" />
                        <h1 className="text-title text-bg-w font-bold text-center">Gestion de permisos</h1>
                        <div className="w-8" />
                    </div>

                    {/* pestañas: permisos del grupo o permisos individuales de un usuario */}
                    <div role="tablist" aria-label="Tipo de permisos" className="grid grid-cols-2 gap-2 p-1.5 mb-6 rounded-m3-full bg-bg-s50 border border-bd-s100">
                        {[
                            ["group", "Por grupo", Users],
                            ["user", "Individuales (por usuario)", UserRound],
                        ].map(([id, label, Icon]) => (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                aria-selected={mode === id}
                                onClick={() => changeMode(id)}
                                className={`m3-state h-12 flex items-center justify-center gap-2 rounded-m3-full text-m3-label-large font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${mode === id ? "bg-bg-s950 text-bg-w shadow-m3-1" : "text-br-s900"}`}
                            >
                                <Icon size={18} />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="mb-8 [&_.w-80]:w-full">
                        {mode === "group" ? (
                            <Select
                                label="Seleccionar grupo"
                                name="targetGroup"
                                value={targetGroup}
                                htmlFor="targetGroup"
                                options={groupOptions}
                                onChange={(e) => handleGroupChange(e.target.value)}
                                error={errors.targetUser}
                                variant="latte"
                            />
                        ) : (
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
                        )}
                    </div>

                    {/* explicacion y resumen de los permisos individuales */}
                    {mode === "user" && targetUser && (
                        <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-m3-lg bg-bg-t50 border border-bd-t300">
                            <p className="flex-1 min-w-60 text-m3-body-medium text-br-s900">
                                <b>{selectedUser?.label}</b> pertenece al grupo <b>{selectedUser?.group}</b>. Los marcados como “Del grupo” vienen de ahí;
                                puedes darle permisos extra o quitarle alguno solo a esta persona.
                            </p>
                            <span className="h-8 px-3 inline-flex items-center rounded-m3-full bg-m3-success-container text-m3-success text-m3-label-large font-semibold">{givenCount} dados</span>
                            <span className="h-8 px-3 inline-flex items-center rounded-m3-full bg-m3-error-container text-m3-on-error-container text-m3-label-large font-semibold">{removedCount} quitados</span>
                            <button
                                type="button"
                                onClick={resetToGroup}
                                disabled={!givenCount && !removedCount}
                                className="m3-state h-9 px-3 inline-flex items-center gap-1.5 rounded-m3-full border border-bd-s400 text-m3-label-large font-semibold text-br-s950 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus"
                            >
                                <RotateCcw size={16} />
                                Dejar igual a su grupo
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-8">
                        {permissionGroups.map((group, index) => (
                            <div key={group.title}>
                                <h2 className="text-subtitle text-br-t900 font-bold mb-4">
                                    {group.title}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                    {group.permissions.map((perm) => {
                                        // en individuales se ve si el permiso viene del grupo, se le dio o se le quito
                                        const origin = mode === "user" && targetUser ? originOf(perm.id) : null;
                                        return (
                                            <div key={perm.id} className="flex flex-col gap-1.5">
                                                <ToggleSwitch
                                                    label={perm.label}
                                                    checked={!!permissions[perm.id]}
                                                    onChange={(value) => togglePermission(perm.id, value)}
                                                />
                                                {origin && (
                                                    <span className={`self-start ml-14 h-6 px-2 inline-flex items-center rounded-m3-full border text-m3-label-small font-semibold ${origin.style}`}>
                                                        {origin.label}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
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