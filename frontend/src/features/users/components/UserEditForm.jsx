// src/features/users/components/UserEditForm.jsx
// Formulario para actualizar una cuenta de usuario
// Caja clara: a la izquierda la persona y las secciones, a la derecha la seccion elegida
import { useState, useEffect, useMemo } from "react";
import { IdCard, KeyRound, Phone, CalendarDays, Camera, Check, UserCog, Lock, ShieldCheck } from "lucide-react";
import { Input, Select, Button, Navbar, ToggleSwitch } from "@/shared";
import { getDocumentTypes } from "@/services/selectServices";
import { getTypeUser } from "@/services/selectServices";
import { useNavigate, useLocation } from "react-router-dom"
import { userSchema } from "../schemas/userSchema";
import { showSuccesAlert, showUnexpectedErrorAlert, showConfirmAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/fondo-users.png";
import { updateUser } from "../services/userServices";
import { useAccessProfile } from "@/features/auth/services/accessService";


// secciones del riel: titulo, descripcion y campos que tiene cada una
const SECTIONS = [
    { id: "datos", title: "Datos personales", sub: "Nombre, rol y documento", icon: IdCard, fields: ["userName", "userType", "userDocumentTypes", "userDocumentNumber"] },
    { id: "acceso", title: "Acceso y seguridad", sub: "Correo para entrar y contraseña", icon: KeyRound, fields: ["userEmail", "userEmailConfirm", "userBusinessEmail", "userPassword"] },
    { id: "contacto", title: "Contacto", sub: "Teléfonos y dirección", icon: Phone, fields: ["userPhone", "userPhoneSecondary", "userAddress", "userImage"] },
    { id: "contrato", title: "Contrato", sub: "Fechas del contrato", icon: CalendarDays, fields: ["userContractStartDate", "userContractEndDate"] },
    { id: "estado", title: "Estado de la cuenta", sub: "Si puede entrar y qué tanto puede administrar", icon: Lock, fields: ["isActive", "isSuperUser"] },
];

export default function UserEditForm({ user }){
    // si se abrio desde el listado se vuelve al listado, si no al detalle del usuario
    const location = useLocation();

    const navigate = useNavigate();

    const [errors, setErrors] = useState({});   


    // Estado del formulario precargado con los datos del usuario seleccionado
    // (initial se guarda para saber que cambio)
    const [initial] = useState(() => ({
        userName: user.userName || "",
        userEmail: user.userEmail || "",
        userEmailConfirm: user.userEmail || "",
        userBusinessEmail: user.userBusinessEmail || "",
        userPhone: user.userPhone || "",
        userPhoneSecondary: user.userPhoneSecondary || "",
        userDocumentTypes: user.userDocumentTypes || "",
        userType: user.userType || "",
        userDocumentNumber: user.userDocumentNumber || "",
        userPassword: "",
        userImage: [],
        userAddress: user.userAddress || "",
        userContractStartDate: user.userContractStartDate || "",
        userContractEndDate: user.userContractEndDate || "",

        isStaff: user.isStaff || false,
        isActive: user.isActive || false,
        isSuperUser: user.isSuperUser || false,
    }));
    const [formData, setFormData] = useState(initial);

    // superusuarios y administradores solo los nombra un superusuario
    const { isSuperuser: iAmSuperuser } = useAccessProfile();

    const toggleSuperUser = async (next) => {
        const result = await showConfirmAlert({
            title: next ? "¿Hacerlo superusuario?" : "¿Quitarle el superusuario?",
            text: next
                ? "Tendrá todos los permisos de Flora sin que se los den y podrá cambiar a cualquier usuario."
                : "Quedará solo con los permisos de su grupo y los que se le den.",
            confirmButtonText: next ? "Hacer superusuario" : "Quitar superusuario",
        });
        if (!result.isConfirmed) return;
        setFormData((prev) => ({ ...prev, isSuperUser: next }));
    };


    
    // Actualiza el campo que cambio
    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked: value,
    }))
};

    // Habilita o inhabilita la cuenta, para inhabilitar pide el motivo
    const toggleActiveStatus = async () => {
        const next = !formData.isActive;
        const result = await showConfirmAlert({
            title: `¿Deseas ${next ? "habilitar" : "inhabilitar"} la cuenta?`,
            text: "El cambio se aplicará al guardar.",
            confirmButtonText: next ? "Habilitar" : "Inhabilitar",
            reasonLabel: next ? undefined : "Motivo de inactivación (obligatorio)",
        });
        if (!result.isConfirmed) return;
        setFormData((prev) => ({
            ...prev,
            isActive: next,
            // el motivo se guarda en el registro de cambios al guardar
            statusReason: typeof result.value === "string" ? result.value : "",
        }));
    };

    // Valida, revisa correo y documento repetidos y confirma antes de guardar
    const handleSubmit = async (e) => {
        e.preventDefault();

    const result = userSchema.safeParse(formData)
    // La contrasena y la foto son opcionales al editar: si se dejan vacias se conservan las actuales
    const issues = result.success ? [] : result.error.issues.filter((issue) => !(issue.path[0] === "userPassword" && !formData.userPassword) && !(issue.path[0] === "userImage" && !formData.userImage.length));

    if (issues.length){
        const fieldErrors = {};

    issues.forEach((issue) => {
    fieldErrors[issue.path[0]] = issue.message;
    });

    setErrors(fieldErrors);
    // se abre la primera seccion que tenga un error
    const firstSection = SECTIONS.find((item) => item.fields.some((name) => fieldErrors[name]));
    if (firstSection) setSection(firstSection.id);
    return;
}
    const confirmation = await showConfirmAlert({
        title: "¿Guardar los cambios de la cuenta?",
        text: "Se actualizarán los datos del usuario.",
        confirmButtonText: "Guardar cambios",
    });
    if (!confirmation.isConfirmed) return;

    setErrors({});

    try{
        // El backend revisa que el correo y el documento no los tenga otro usuario
        await updateUser(user.id, formData);
        await showSuccesAlert({
            title: "Usuario actualizado",
            text: "Cuenta actualizada exitosamente",
            timer: 3000,
        });
        goBack(true);
    } catch(error){
        console.log("Error: ", error.message)
        if (error.field) {
            setErrors({ [error.field]: error.message });
            const fieldSection = SECTIONS.find((item) => item.fields.includes(error.field));
            if (fieldSection) setSection(fieldSection.id);
        }
        await showUnexpectedErrorAlert({
            text: error.message,
            timer: 3000,
        })
    }

};

    // seccion abierta en la caja
    const [section, setSection] = useState("datos");
    const current = SECTIONS.find((item) => item.id === section);

    // que campos cambiaron: la foto y la contraseña cuentan si escribieron algo
    const isChanged = (name) => {
        if (name === "userImage") return formData.userImage.length > 0;
        if (name === "userPassword") return formData.userPassword !== "";
        return String(formData[name] ?? "") !== String(initial[name] ?? "");
    };
    const changes = SECTIONS.flatMap((item) => item.fields).filter((name) => name !== "userEmailConfirm" && isChanged(name)).length;

    const [documentTypes, setDocumentTypes] = useState([])
    const [typesUser, setTypeUser] = useState([])
    
    
    
        useEffect(()=>{
            getDocumentTypes().then((data) => {
                setDocumentTypes(data);
            });
        },[])

         useEffect(()=>{
            getTypeUser().then((data) => {
                setTypeUser(data);
            });
        },[])


    // foto del encabezado: la nueva si eligieron una, si no la actual (la url temporal se libera al cambiar)
    const newImage = useMemo(() => (formData.userImage[0] ? URL.createObjectURL(formData.userImage[0]) : null), [formData.userImage]);
    useEffect(() => () => {
        if (newImage) URL.revokeObjectURL(newImage);
    }, [newImage]);
    const avatar = newImage ?? user.imageUrl;
    const initials = formData.userName.trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("");
    const roleLabel = typesUser.find((type) => type.id === formData.userType)?.label ?? "Sin rol";
    // el rol Administrador solo lo da o lo quita el superusuario: a los demas no les sale
    // (si la persona ya es administradora se deja la opcion para que se vea su rol, y el select queda bloqueado)
    const lockedRole = !iAmSuperuser && initial.userType === "ADMIN";
    const roleOptions = iAmSuperuser || lockedRole ? typesUser : typesUser.filter((type) => type.id !== "ADMIN");

    // datos rapidos del contrato, calculados con las fechas del formulario (la fecha de hoy se toma una vez al abrir)
    const [today] = useState(() => Date.now());
    const contract = useMemo(() => {
        const day = 24 * 60 * 60 * 1000;
        const start = Date.parse(formData.userContractStartDate);
        const end = Date.parse(formData.userContractEndDate);
        if (Number.isNaN(end)) return { left: "Sin fecha de fin", pct: null };
        const left = Math.ceil((end - today) / day);
        const pct = Number.isNaN(start) || end <= start ? null : Math.min(100, Math.max(0, Math.round(((today - start) / (end - start)) * 100)));
        return { left: left > 0 ? `${left} días restantes` : "Contrato vencido", pct };
    }, [formData.userContractStartDate, formData.userContractEndDate, today]);

    // a donde vuelve la flecha, el boton cancelar y el guardar: al listado con el usuario abierto
    // o, si se edito la propia cuenta desde Mi perfil, al inicio con Mi perfil abierto
    const goBack = (replace = false) => (location.state?.from === "/userList"
        ? navigate("/userList", { replace, state: { openUser: user.id } })
        : navigate("/home", { replace, state: { openProfile: true } }));

    // un campo de texto con lo de siempre (mismo estilo en todas las tarjetas)
    const field = (name, type, label, placeholder, htmlFor) => (
        <Input
            name={name}
            type={type}
            label={label}
            value={formData[name]}
            placeholder={placeholder}
            htmlFor={htmlFor}
            variant="latte"
            onChange={handleChange}
            error={errors[name]}
        />
    );

    return(
        <div className="min-h-screen w-full flex flex-col">

            <Navbar
                variant="banda"
                image={fotoFondo}
                icon={UserCog}
                title="Modificar usuario"
                onBack={() => goBack()}
            />

            {/* fondo con manchas de luz; se mueven un poco al cambiar de seccion */}
            <main className="relative flex-1 flex overflow-hidden bg-bg-p50 px-4 sm:px-10 py-8">
                <span aria-hidden="true" className="pointer-events-none absolute -top-40 -left-40 w-[46rem] h-[34rem] rounded-m3-full bg-bg-t300/60 blur-3xl transition-transform duration-700 ease-out" style={{ transform: `translate(${SECTIONS.indexOf(current) * 12}%, ${SECTIONS.indexOf(current) * 6}%)` }} />
                <span aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-40 w-[42rem] h-[32rem] rounded-m3-full bg-bg-t100 blur-3xl transition-transform duration-700 ease-out" style={{ transform: `translate(-${SECTIONS.indexOf(current) * 8}%, -${SECTIONS.indexOf(current) * 5}%)` }} />

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="relative w-full max-w-[100rem] mx-auto my-auto flex flex-col lg:flex-row bg-bg-w/95 border border-bd-w rounded-m3-xl shadow-m3-3 overflow-hidden [&_.w-80]:w-full"
                >

                    {/* ===== Riel claro: la persona y las secciones ===== */}
                    <aside className="lg:w-80 shrink-0 flex flex-col gap-2 p-6 bg-linear-170 from-bg-t50 to-bg-p50 border-b lg:border-b-0 lg:border-r border-bd-t300">
                        <div className="flex flex-col items-center gap-2 pb-5 mb-2 border-b border-bd-t300 text-center">
                            <div className="relative w-22 h-22">
                                <div className="w-full h-full rounded-m3-full overflow-hidden ring-4 ring-bg-w bg-bg-t800 text-bg-w grid place-items-center">
                                    {avatar ? (
                                        <img src={avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-m3-headline-small font-bold">{initials || "?"}</span>
                                    )}
                                </div>
                                {/* boton para cambiar la foto: abre el selector de archivos */}
                                <label
                                    htmlFor="user-photo"
                                    title="Cambiar foto"
                                    className="m3-state absolute -right-1 -bottom-1 w-9 h-9 rounded-m3-full border-2 border-bd-w bg-bg-s950 text-bg-w grid place-items-center cursor-pointer focus-within:ring-2 focus-within:ring-m3-focus"
                                >
                                    <Camera size={16} />
                                    <span className="sr-only">Cambiar foto de perfil</span>
                                    <input
                                        id="user-photo"
                                        type="file"
                                        accept="image/png,image/jpeg"
                                        className="sr-only"
                                        onChange={(e) => setFormData((prev) => ({ ...prev, userImage: e.target.files?.[0] ? [e.target.files[0]] : [] }))}
                                    />
                                </label>
                            </div>
                            <h2 className="text-m3-title-large font-bold text-br-s950 break-words">{formData.userName || "Nombre del usuario"}</h2>
                            <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-m3-sm bg-bg-t50 border border-bd-t300 text-m3-label-large font-semibold text-br-t950">
                                <ShieldCheck size={14} />
                                {roleLabel}
                            </span>
                            {errors.userImage && <p className="text-m3-body-small font-semibold text-m3-error">{errors.userImage}</p>}
                        </div>

                        {/* secciones: la que tiene cambios muestra "editado" */}
                        <nav aria-label="Secciones del usuario" className="flex flex-col gap-1">
                            {SECTIONS.map((item) => {
                                const on = item.id === section;
                                const edited = item.fields.some(isChanged);
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSection(item.id)}
                                        aria-current={on ? "page" : undefined}
                                        className={`m3-state flex items-center gap-3 px-4 py-3 rounded-m3-lg border text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${on ? "bg-bg-w border-bd-t300 shadow-m3-1 text-br-s950" : "border-transparent text-br-s900"}`}
                                    >
                                        <item.icon size={20} className="shrink-0 text-br-t900" />
                                        <span className="flex-1 text-m3-title-small font-bold">{item.title}</span>
                                        {edited && <span className="h-5 px-2 inline-flex items-center rounded-m3-full bg-bg-t100 text-br-t950 text-m3-label-small font-bold">editado</span>}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* ===== La seccion elegida ===== */}
                    <section className="flex-1 min-w-0 flex flex-col" aria-labelledby="edit-section">
                        <div className="flex-1 flex flex-col gap-7 p-6 sm:p-10">
                            <div className="flex flex-col gap-1">
                                <h3 id="edit-section" className="text-m3-headline-medium font-bold text-br-s950">{current.title}</h3>
                                <p className="text-m3-body-medium text-br-s800">{current.sub}</p>
                            </div>

                            {section === "datos" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 items-start">
                                    {field("userName", "text", "Nombre completo", "Escribe el nombre", "user-name")}
                                    <Select label="Tipo de usuario" name="userType" value={formData.userType} htmlFor="userType" options={roleOptions} onChange={handleChange} error={errors.userType} variant="latte" disabled={lockedRole} />
                                    <Select label="Tipo de documento" name="userDocumentTypes" value={formData.userDocumentTypes} htmlFor="userDocumentTypes" options={documentTypes} onChange={handleChange} error={errors.userDocumentTypes} variant="latte" />
                                    {field("userDocumentNumber", "text", "Número de documento", "Solo números", "user-document-number")}
                                </div>
                            )}

                            {section === "acceso" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 items-start">
                                    {field("userEmail", "email", "Correo electrónico", "nombre@correo.com", "user-email")}
                                    {field("userEmailConfirm", "email", "Confirmar correo", "Escríbelo otra vez", "user-email-confirm")}
                                    {field("userBusinessEmail", "email", "Correo empresarial", "nombre@flora.com", "user-business-email")}
                                    {field("userPassword", "password", "Nueva contraseña (opcional)", "Déjala vacía para conservarla", "user-password")}
                                </div>
                            )}

                            {section === "contacto" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 items-start">
                                    {field("userPhone", "tel", "Teléfono", "Ej: 3001234567", "user-Phone")}
                                    {field("userPhoneSecondary", "tel", "Teléfono secundario (opcional)", "Otro número", "user-phone-secondary")}
                                    <div className="sm:col-span-2">{field("userAddress", "text", "Dirección", "Ej: Calle 10 # 5-20", "user-direction")}</div>
                                </div>
                            )}

                            {section === "contrato" && (
                                <div className="flex flex-col gap-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 items-start">
                                        {field("userContractStartDate", "date", "Fecha de inicio", "", "user-contract-start")}
                                        {field("userContractEndDate", "date", "Fecha de fin", "", "user-contract-end")}
                                    </div>
                                    {/* cuanto del contrato ya paso, segun las fechas */}
                                    {contract.pct !== null && (
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between text-m3-label-large font-semibold text-br-s900">
                                                <span>Tiempo cumplido · {contract.left}</span>
                                                <span>{contract.pct}%</span>
                                            </div>
                                            <div className="h-2 rounded-m3-full bg-bg-s100" role="progressbar" aria-valuenow={contract.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Tiempo de contrato cumplido">
                                                <div className="h-full rounded-m3-full bg-bg-t800" style={{ width: `${contract.pct}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {section === "estado" && (
                                <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-m3-lg bg-bg-p50 border border-bd-s100">
                                    {/* al inhabilitar pide el motivo, se aplica al guardar */}
                                    <ToggleSwitch
                                        checked={formData.isActive}
                                        onChange={toggleActiveStatus}
                                        label={formData.isActive ? "Cuenta activa" : "Cuenta inactiva"}
                                    />
                                    <span className="text-m3-body-medium text-br-s800">{formData.isActive ? "Puede entrar a Flora" : "No puede entrar ni hacer nada"}</span>
                                </div>

                                {/* superusuario = todo, incluso nombrar administradores y otros superusuarios */}
                                <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-m3-lg bg-bg-p50 border border-bd-s100">
                                    <ToggleSwitch
                                        checked={formData.isSuperUser}
                                        disabled={!iAmSuperuser}
                                        onChange={toggleSuperUser}
                                        label="Superusuario"
                                    />
                                    <span className="flex-1 min-w-60 text-m3-body-medium text-br-s800">Puede hacer de todo, incluso crear administradores y otros superusuarios. El administrador arranca con todos los permisos (el superusuario le puede quitar los que quiera) y no puede crear administradores ni superusuarios</span>
                                </div>
                                {!iAmSuperuser && (
                                    <p className="flex items-center gap-2 text-m3-body-medium text-br-s800">
                                        <Lock size={16} className="shrink-0" />
                                        Solo un superusuario puede nombrar o quitar superusuarios y administradores.
                                    </p>
                                )}
                                </div>
                            )}
                        </div>

                        {/* barra de abajo: cuantos cambios hay y los botones */}
                        <div className="flex flex-wrap items-center gap-3 px-6 sm:px-10 py-4 border-t border-bd-s100">
                            <span aria-hidden="true" className={`w-2.5 h-2.5 rounded-m3-full ${changes ? "bg-bg-t800" : "bg-bg-s300"}`} />
                            <span className="text-m3-title-small font-semibold text-br-s950" aria-live="polite">
                                {changes ? `${changes} ${changes === 1 ? "cambio" : "cambios"} sin guardar` : "Sin cambios"}
                            </span>
                            <div className="ml-auto flex flex-wrap gap-3">
                                <Button variant="contorno" size="md" type="button" onClick={() => goBack()}>
                                    Descartar
                                </Button>
                                <Button variant="espresso" size="md" type="submit" disabled={!changes}>
                                    <Check size={18} />
                                    Guardar cambios
                                </Button>
                            </div>
                        </div>
                    </section>

                </form>
            </main>
        </div>
    )
}
