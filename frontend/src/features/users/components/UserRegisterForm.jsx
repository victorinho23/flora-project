// User register form para registrar un usuario
// Asistente en 4 pasos dentro de una caja: a la izquierda el riel con los pasos, a la derecha el paso actual
import { useState, useEffect, useMemo } from "react";
import { User, IdCard, KeyRound, Contact, CalendarDays, Check, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Input, Select, Button, Imageinput, Navbar, Checkbox } from "@/shared";
import DataPolicyModal from "./DataPolicyModal";
import { getGroups } from "@/features/permissions/services/groupService";
import { getGroupPermissions } from "@/features/permissions/services/permissionService";
import { getDocumentTypes } from "@/services/selectServices";
import { getTypeUser } from "@/services/selectServices";
import { useNavigate } from "react-router-dom"
import { userSchema } from "../schemas/userSchema";
import { showSuccesAlert, showCreateUserErrorAlert, showConfirmAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/fondo-users.png";
import { createUser } from "../services/userServices";
import { useAccess } from "@/features/auth/services/accessService";


// pasos del asistente: titulo, descripcion y campos que se revisan antes de seguir
const STEPS = [
    { title: "Identificación", sub: "Quién es y qué rol va a tener en Flora", icon: IdCard, fields: ["userName", "userType", "userDocumentTypes", "userDocumentNumber"] },
    { title: "Acceso a Flora", sub: "Con este correo y la contraseña la persona entra al sistema", icon: KeyRound, fields: ["userEmail", "userEmailConfirm", "userPassword", "userBusinessEmail", "userBusinessEmailConfirm"] },
    { title: "Contacto y foto", sub: "Cómo comunicarse con la persona; la foto es opcional", icon: Contact, fields: ["userPhone", "userPhoneSecondary", "userAddress", "userImage"] },
    { title: "Contrato", sub: "Fechas del contrato y autorización de datos; los administradores no necesitan fecha de fin", icon: CalendarDays, fields: ["userContractStartDate", "userContractEndDate", "userDataConsent"] },
];

// donde quedan las manchas de luz del fondo en cada paso (se mueven al cambiar de paso)
const GLOW = [
    ["-10%, -10%", "10%, 10%"],
    ["30%, -5%", "-20%, 5%"],
    ["55%, 20%", "-35%, -10%"],
    ["10%, 35%", "-5%, -25%"],
];

export default function UserRegisterForm(){
    const navigate = useNavigate();
    const can = useAccess();
    // si no puede ver el listado (por ejemplo, solo le dieron el permiso de crear) se vuelve al inicio
    const listPath = can("usuarios_listar") ? "/userList" : "/home";


    const [errors, setErrors] = useState({});   

    const [formData, setFormData] = useState({
        userName: "",
        userEmail: "",
        userEmailConfirm: "",
        userBusinessEmail: "",
        userBusinessEmailConfirm: "",
        userPhone: "",
        userPhoneSecondary: "",
        userDocumentTypes: "",
        userType: "",
        userDocumentNumber: "",
        userPassword: "",
        userImage: [],
        userAddress:"",
        userContractStartDate:"",
        userContractEndDate:"",

        // la persona autorizo el tratamiento de sus datos (obligatorio para crear la cuenta)
        userDataConsent: false,

        isStaff: false,
        isActive: true,
        isSuperUser: false,
    });


    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked: value,
        }))
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = userSchema.safeParse(formData)

        // sin la autorizacion de datos no se crea la cuenta
        if (!formData.userDataConsent) {
            setErrors({ userDataConsent: "La persona debe autorizar el tratamiento de sus datos personales" });
            setStep(STEPS.length - 1);
            return;
        }

        if (!result.success){
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            // se va al primer paso que tenga un campo con error
            const firstStep = STEPS.findIndex((item) => item.fields.some((name) => fieldErrors[name]));
            if (firstStep >= 0) setStep(firstStep);
            await showCreateUserErrorAlert({
                title: "Error al crear usuario",
                text: "Revisa los campos marcados en el formulario",
                timer: 3000,
            });
            return;
        }

        setErrors({});

        // confirmacion antes de crear la cuenta
        const confirmation = await showConfirmAlert({
            title: `¿Crear la cuenta de ${result.data.userName}?`,
            text: "Podrá entrar a Flora con su correo y la contraseña que escribiste.",
            confirmButtonText: "Crear usuario",
        });
        if (!confirmation.isConfirmed) return;

        try{
            // El backend revisa que el correo y el documento no esten repetidos
            const response = await createUser({ ...result.data, userDataConsent: true });
            await showSuccesAlert({
                title: "Usuario creado",
                text: "El usuario fue creado correctamente",
                timer: 3000,
            });
            // replace: al volver desde el detalle no se regresa al formulario ya enviado
            navigate(listPath, { state: { openUser: response.userId }, replace: true })
        } catch(error){
            console.log("Error: ", error.message)
            // si el backend dice que campo fallo se marca en el formulario
            if (error.field) {
                setErrors({ [error.field]: error.message });
                const fieldStep = STEPS.findIndex((item) => item.fields.includes(error.field));
                if (fieldStep >= 0) setStep(fieldStep);
            }
            await showCreateUserErrorAlert({
                text: error.message,
                timer: 3000,
            })
        }
    };

    const [documentTypes, setDocumentTypes] = useState([])
    const [typesUser, setTypeUser] = useState([])

    useEffect(()=>{
        getDocumentTypes().then(setDocumentTypes);
    },[])

    useEffect(()=>{
        getTypeUser().then(setTypeUser);
    },[])


    // ventana con la politica de tratamiento de datos
    const [showPolicy, setShowPolicy] = useState(false);

    // ===== asistente =====
    const [step, setStep] = useState(0);
    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    // revisa solo los campos del paso actual; si estan bien pasa al siguiente
    const goNext = async () => {
        const result = userSchema.safeParse(formData);
        const stepErrors = {};
        if (!result.success) {
            result.error.issues.forEach((issue) => {
                const name = issue.path[0];
                if (current.fields.includes(name) && !(name === "userImage" && !formData.userImage.length)) stepErrors[name] ??= issue.message;
            });
        }
        setErrors(stepErrors);
        if (Object.keys(stepErrors).length === 0) setStep(step + 1);
    };

    // permisos del rol elegido (salen del grupo con el mismo nombre en la base)
    const [groups, setGroups] = useState([]);
    const [rolePerms, setRolePerms] = useState([]);
    useEffect(() => {
        getGroups().then(setGroups).catch(() => setGroups([]));
    }, []);
    const roleLabel = typesUser.find((type) => type.id === formData.userType)?.label ?? "";
    const roleGroup = groups.find((group) => group.group_name === roleLabel);
    useEffect(() => {
        if (!roleGroup) return;
        getGroupPermissions(roleGroup.group_id).then(setRolePerms).catch(() => setRolePerms([]));
    }, [roleGroup]);
    const shownPerms = roleGroup ? rolePerms : [];

    // foto de la tarjeta del paso: la elegida o las iniciales
    const newImage = useMemo(() => (formData.userImage[0] ? URL.createObjectURL(formData.userImage[0]) : null), [formData.userImage]);
    useEffect(() => () => {
        if (newImage) URL.revokeObjectURL(newImage);
    }, [newImage]);
    const initials = formData.userName.trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("");

    // un campo de texto con lo de siempre
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

    // resumen corto de cada paso para el riel (se ve cuando el paso ya esta hecho)
    const stepSummary = [
        [formData.userName, roleLabel, formData.userDocumentNumber].filter(Boolean).join(" · "),
        formData.userEmail,
        formData.userPhone,
        [formData.userContractStartDate, formData.userContractEndDate].filter(Boolean).join(" a "),
    ];

    return(
        <div className="min-h-screen w-full flex flex-col">

            {/** Header */}
            <Navbar
                variant="banda"
                image={fotoFondo}
                icon={User}
                title="Crear usuario"
                onBack={() => navigate(listPath)}
                actions={can("usuarios_listar") && (
                    <Button variant="crema" size="sm" type="button" onClick={() => navigate(listPath)}>
                        Ver listado
                    </Button>
                )}
            />

            {/* fondo con manchas de luz que se mueven segun el paso */}
            <main className="relative flex-1 flex overflow-hidden bg-bg-p50 px-4 sm:px-10 py-8">
                <span aria-hidden="true" className="pointer-events-none absolute -top-40 -left-40 w-[46rem] h-[34rem] rounded-m3-full bg-bg-t300/60 blur-3xl transition-transform duration-700 ease-out" style={{ transform: `translate(${GLOW[step][0]})` }} />
                <span aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-40 w-[42rem] h-[32rem] rounded-m3-full bg-bg-t100 blur-3xl transition-transform duration-700 ease-out" style={{ transform: `translate(${GLOW[step][1]})` }} />

                <form
                    // con Enter en un paso intermedio se pasa al siguiente; solo en el ultimo se crea
                    onSubmit={(e) => {
                        if (isLast) return handleSubmit(e);
                        e.preventDefault();
                        goNext();
                    }}
                    noValidate
                    className="relative w-full max-w-[100rem] mx-auto my-auto flex flex-col lg:flex-row bg-bg-w/95 border border-bd-w rounded-m3-xl shadow-m3-3 overflow-hidden [&_.w-80]:w-full"
                >

                    {/* ===== Riel claro con los pasos ===== */}
                    <aside className="lg:w-84 shrink-0 flex flex-col gap-6 p-6 sm:p-8 bg-linear-170 from-bg-t50 to-bg-p50 border-b lg:border-b-0 lg:border-r border-bd-t300" aria-label="Pasos para crear el usuario">
                        <div className="flex flex-col">
                            <span className="text-m3-label-large font-bold uppercase tracking-wider text-br-t900">Nueva cuenta</span>
                            <span className="text-m3-headline-small font-bold text-br-s950">Crear usuario</span>
                        </div>

                        <ol className="flex-1 flex flex-col">
                            {STEPS.map((item, index) => {
                                const done = index < step;
                                const now = index === step;
                                return (
                                    <li key={item.title} className="relative flex-1 min-h-18">
                                        {/* linea que une un paso con el siguiente */}
                                        {index < STEPS.length - 1 && <span aria-hidden="true" className={`absolute left-5 top-11 bottom-1 w-0.5 rounded-m3-full ${done ? "bg-m3-success" : "bg-bg-t300"}`} />}
                                        {/* se puede volver a un paso anterior tocandolo */}
                                        <button
                                            type="button"
                                            onClick={() => index < step && setStep(index)}
                                            disabled={index > step}
                                            aria-current={now ? "step" : undefined}
                                            className="m3-state relative flex items-start gap-3.5 w-full p-0.5 rounded-m3-md text-left disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus"
                                        >
                                            <span className={`w-10 h-10 shrink-0 rounded-m3-md border grid place-items-center transition-colors ${done ? "bg-m3-success border-transparent text-bg-w" : now ? "bg-bg-t800 border-transparent text-bg-w ring-4 ring-bg-t300/50" : "bg-bg-w border-bd-t300 text-br-t900"}`}>
                                                {done ? <Check size={20} /> : <item.icon size={20} />}
                                            </span>
                                            <span className="flex flex-col min-w-0 pt-0.5">
                                                <span className={`text-m3-title-medium font-bold ${done || now ? "text-br-s950" : "text-br-s800"}`}>{item.title}</span>
                                                <span className={`text-m3-body-small truncate ${now ? "text-br-t900 font-semibold" : "text-br-s800"}`}>
                                                    {done ? (stepSummary[index] || "Listo") : now ? "Ahora" : "Pendiente"}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>

                        {/* tarjetica de la persona que se arma mientras se llena */}
                        <div className="flex items-center gap-3 p-3.5 rounded-m3-lg bg-bg-w border border-bd-t300">
                            <div className="w-12 h-12 shrink-0 rounded-m3-full overflow-hidden bg-bg-t800 text-bg-w grid place-items-center">
                                {newImage ? (
                                    <img src={newImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-m3-title-small font-bold">{initials || <User size={22} />}</span>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-m3-title-small font-bold text-br-s950 truncate">{formData.userName || "Nombre del usuario"}</span>
                                <span className="text-m3-body-small text-br-s800 truncate">{roleLabel || "Sin rol"}</span>
                            </div>
                        </div>
                    </aside>

                    {/* ===== El paso actual ===== */}
                    <section className="flex-1 min-w-0 flex flex-col gap-7 p-6 sm:p-10" aria-labelledby="wizard-step">
                        <div className="flex flex-col gap-1">
                            <span className="text-m3-label-large font-bold uppercase tracking-wider text-br-t900">Paso {step + 1} de {STEPS.length}</span>
                            <h2 id="wizard-step" className="text-m3-headline-medium font-bold text-br-s950">{current.title}</h2>
                            <p className="text-m3-body-medium text-br-s800">{current.sub}</p>
                        </div>

                        {/* ----- campos del paso: los errores salen debajo de cada campo ----- */}
                        {step === 0 && (
                            <div className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 items-start">
                                    {field("userName", "text", "Nombre completo", "Ej: Laura Gómez", "user-name")}
                                    <Select label="Tipo de usuario" name="userType" value={formData.userType} htmlFor="userType" options={typesUser} onChange={handleChange} error={errors.userType} variant="latte" />
                                    <Select label="Tipo de documento" name="userDocumentTypes" value={formData.userDocumentTypes} htmlFor="userDocumentTypes" options={documentTypes} onChange={handleChange} error={errors.userDocumentTypes} variant="latte" />
                                    {field("userDocumentNumber", "text", "Número de documento", "Solo números", "user-document-number")}
                                </div>
                                {/* permisos reales del grupo del rol elegido */}
                                {roleLabel && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="flex items-center gap-1.5 text-m3-label-large font-semibold text-br-s900">
                                            <ShieldCheck size={16} className="text-br-t900" />
                                            Como {roleLabel} podrá:
                                        </span>
                                        {shownPerms.slice(0, 6).map((perm) => (
                                            <span key={perm.permission_id} className="h-7 px-2.5 inline-flex items-center rounded-m3-full bg-m3-success-container text-m3-success text-m3-label-medium font-semibold">
                                                {perm.permission_name}
                                            </span>
                                        ))}
                                        {shownPerms.length > 6 && <span className="text-m3-body-small text-br-s800">y {shownPerms.length - 6} más</span>}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 1 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 items-start">
                                {field("userEmail", "email", "Correo electrónico", "nombre@correo.com", "user-email")}
                                {field("userEmailConfirm", "email", "Confirmar correo", "Escríbelo otra vez", "user-email-confirm")}
                                {field("userPassword", "password", "Contraseña", "Exactamente 10 caracteres", "user-password")}
                                {field("userBusinessEmail", "email", "Correo empresarial (opcional)", "nombre@flora.com", "user-business-email")}
                                {field("userBusinessEmailConfirm", "email", "Confirmar correo empresarial", "Escríbelo otra vez", "user-business-email-confirm")}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-6 items-start">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 items-start">
                                    {field("userPhone", "tel", "Teléfono", "Ej: 3001234567", "user-phone")}
                                    {field("userPhoneSecondary", "tel", "Teléfono secundario (opcional)", "Otro número", "user-phone-secondary")}
                                    <div className="sm:col-span-2">{field("userAddress", "text", "Dirección", "Ej: Calle 10 # 5-20", "user-address")}</div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-m3-label-large font-semibold text-br-s950">Foto de perfil (opcional)</span>
                                    <div className="w-full [&>div]:w-full [&_.border-dashed]:w-full [&_.border-dashed]:h-40 [&_.border-dashed]:shrink">
                                        <Imageinput
                                            value={formData.userImage}
                                            onChange={(files) => setFormData((prev) => ({ ...prev, userImage: files }))}
                                            multiple={false}
                                            variant="latte"
                                        />
                                    </div>
                                    {errors.userImage && <span className="inline-block rounded bg-m3-error-container px-2 py-0.5 text-m3-on-error-container font-medium text-sm">{errors.userImage}</span>}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 items-start">
                                {field("userContractStartDate", "date", "Fecha de inicio", "", "user-contract-start")}
                                {field("userContractEndDate", "date", formData.userType === "ADMIN" ? "Fecha de fin (opcional)" : "Fecha de fin", "", "user-contract-end")}

                                {/* autorizacion de tratamiento de datos: obligatoria (Ley 1581 de 2012) */}
                                <div className={`sm:col-span-2 flex flex-col gap-2 p-4 rounded-m3-lg border ${errors.userDataConsent ? "border-m3-error bg-m3-error-container/40" : "border-bd-t300 bg-bg-t50"}`}>
                                    <Checkbox
                                        id="user-data-consent"
                                        name="userDataConsent"
                                        label="La persona autorizó el tratamiento de sus datos personales según la política de Flora."
                                        checked={formData.userDataConsent}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setErrors((prev) => ({ ...prev, userDataConsent: undefined }));
                                        }}
                                        variant="latte"
                                    />
                                    <button type="button" onClick={() => setShowPolicy(true)} className="self-start ml-7 text-m3-label-large font-semibold text-br-t900 underline underline-offset-4">
                                        Ver la política de tratamiento de datos
                                    </button>
                                    {errors.userDataConsent && <span className="ml-7 text-m3-body-small font-semibold text-m3-error">{errors.userDataConsent}</span>}
                                </div>
                            </div>
                        )}

                        {/* botones del asistente */}
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-bd-s100">
                            <Button variant="contorno" size="md" type="button" onClick={() => setStep(step - 1)} disabled={step === 0}>
                                <ChevronLeft size={18} />
                                Anterior
                            </Button>
                            <span className="hidden sm:block text-m3-body-medium text-br-s800">Paso {step + 1} de {STEPS.length}</span>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="contorno" size="md" type="button" onClick={() => navigate(listPath)}>
                                    Cancelar
                                </Button>
                                {isLast ? (
                                    <Button variant="espresso" size="md" type="submit">
                                        <Check size={18} />
                                        Crear usuario
                                    </Button>
                                ) : (
                                    <Button variant="espresso" size="md" type="button" onClick={goNext}>
                                        Siguiente
                                        <ChevronRight size={18} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </section>

                </form>
            </main>

            <DataPolicyModal open={showPolicy} onClose={() => setShowPolicy(false)} />
        </div>
    )
}
