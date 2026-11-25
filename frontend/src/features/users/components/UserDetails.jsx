// src/features/users/components/UserDetails.jsx
// Pagina de detalle de un usuario en modo solo lectura
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Navbar } from "@/shared";
import { IdCard, KeyRound, Phone, CalendarDays, ShieldCheck, Pencil, Power, History } from "lucide-react";
import authBg from "@/assets/icons/usuario.png";
import { useState, useEffect } from "react";
import { showConfirmAlert, showSuccesAlert, showUnexpectedErrorAlert } from "@/shared/services/alertService";
import { updateUserStatus, getUserHistory } from "../services/userServices";
import { useAccess } from "@/features/auth/services/accessService";
import fotoFondo from "@/assets/images/fondo-users.png";

// como se muestra cada accion del registro de cambios
const ACTIONS = {
    CREAR: "Cuenta creada",
    ACTUALIZAR: "Datos actualizados",
    HABILITAR: "Cuenta habilitada",
    INHABILITAR: "Cuenta inhabilitada",
    RECUPERAR_CONTRASENA: "Recuperó la contraseña",
};

// fecha corta en español, ej: "19 nov 2026, 7:58 a. m."
const formatDate = (value) => new Date(value).toLocaleString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

// inModal: se abre en una ventana desde el listado (sin encabezado de pagina)
// onStatusChange: avisa al listado cuando se habilita o inhabilita la cuenta
export function UserDetails({ user, inModal = false, onStatusChange }) {
    const navigate = useNavigate();
    // de donde se llego al detalle, para volver alli (si no, al listado)
    const backTo = useLocation().state?.from ?? "/userList";

    // Lleva a editar la cuenta
    const handleEdit = () => {
        navigate(`/userEdit`, { state: { user: user.raw, from: inModal ? "/userList" : "/viewUser" } });
    };

    const can = useAccess();
    // estado de la cuenta en pantalla, cambia apenas se confirma
    const [isActive, setIsActive] = useState(user.isActive);

    // historial de cambios de la cuenta (se vuelve a pedir cuando cambia el estado)
    const [history, setHistory] = useState(null);
    useEffect(() => {
        let active = true;
        getUserHistory(user.id)
            .then((data) => active && setHistory(data))
            .catch(() => active && setHistory([]));
        return () => {
            active = false;
        };
    }, [user.id, isActive]);

    // En Flora los usuarios no se borran (quedan en el registro de cambios):
    // se inhabilitan o se vuelven a habilitar, con el motivo obligatorio
    const handleStatus = async () => {
        const next = !isActive;
        const result = await showConfirmAlert({
            title: `¿${next ? "Habilitar" : "Inhabilitar"} a ${user.userName}?`,
            text: next ? "La persona podrá volver a iniciar sesión." : "La persona no podrá iniciar sesión ni usar el sistema.",
            confirmButtonText: next ? "Habilitar" : "Inhabilitar",
            reasonLabel: "Motivo del cambio",
        });
        if (!result.isConfirmed) return;

        try {
            await updateUserStatus(user.id, next, result.value);
            setIsActive(next);
            onStatusChange?.(next);
            await showSuccesAlert({
                title: "Estado actualizado",
                text: `La cuenta de ${user.userName} quedó ${next ? "habilitada" : "inhabilitada"}`,
                timer: 2500,
            });
        } catch (error) {
            await showUnexpectedErrorAlert({ text: error.message, timer: 3000 });
        }
    };

    // iniciales para el avatar cuando no hay foto (ej. "Laura Gomez" -> "LG")
    const initials = (user.userName ?? "").trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("");

    // bloques de datos: titulo a la izquierda y los datos a la derecha
    const sections = [
        { id: "user-identity", title: "Identificación", icon: IdCard, fields: [["Documento", user.userDocumentTypeLabel], ["Número", user.userDocumentNumber]] },
        { id: "user-access", title: "Acceso", icon: KeyRound, fields: [["Tipo de usuario", user.userTypeLabel], ["Correo electrónico", user.userEmail]] },
        { id: "user-contact", title: "Contacto", icon: Phone, fields: [["Teléfono", user.userPhone], ["Teléfono secundario", user.userPhoneSecondary], ["Correo empresarial", user.userBusinessEmail], ["Dirección", user.userAddress]] },
        { id: "user-contract", title: "Contrato", icon: CalendarDays, fields: [["Inicio", user.userContractStartDate], ["Fin", user.userContractEndDate]] },
    ];

    // panel lateral + datos: es lo mismo en la pagina y en la ventana del listado
    const content = (
        <main className={inModal ? "w-full flex flex-wrap items-start gap-6" : "w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-wrap items-start gap-6"}>

            {/* ===== Panel lateral: foto, nombre, rol, estado y atajos a cada bloque ===== */}
            <aside className="grow basis-72 lg:grow-0 lg:max-w-80 flex flex-col items-center gap-3 p-6 text-center bg-bg-w border border-bd-s100 rounded-m3-xl shadow-m3-1">
                <div className="w-28 h-28 rounded-m3-full overflow-hidden ring-4 ring-bg-t100 bg-bg-t900 grid place-items-center">
                    {user.imageUrl ? (
                        <img src={user.imageUrl} alt={user.userName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-m3-headline-medium font-bold text-bg-w">{initials || "?"}</span>
                    )}
                </div>
                <h2 className="text-m3-title-large font-bold text-br-s950 break-words">{user.userName || "—"}</h2>
                <p className="text-m3-body-medium text-br-s800 break-all">{user.userEmail}</p>
                <div className="flex flex-wrap justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-m3-sm border border-bd-t300 bg-bg-t50 text-m3-label-large font-semibold text-br-t950">
                        <ShieldCheck size={15} />
                        {user.userTypeLabel}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-m3-full text-m3-label-large font-bold ${isActive ? "bg-m3-success-container text-m3-success" : "bg-m3-error-container text-m3-on-error-container"}`}>
                        <span className={`w-2 h-2 rounded-m3-full ${isActive ? "bg-m3-success" : "bg-m3-error"}`} />
                        {isActive ? "Activo" : "Inactivo"}
                    </span>
                </div>

                <hr className="w-full border-bd-s100 my-1" />

                {/* atajos: llevan al bloque de datos */}
                <nav aria-label="Secciones del usuario" className="w-full flex flex-col gap-1">
                    {[...sections, { id: "user-history", title: "Historial", icon: History }].map(({ id, title, icon: Icon }) => (
                        <a key={id} href={`#${id}`} className="m3-state flex items-center gap-2.5 px-4 py-2.5 rounded-m3-full text-m3-label-large font-semibold text-br-s900 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus">
                            <Icon size={18} />
                            {title}
                        </a>
                    ))}
                </nav>

                {inModal && can("usuarios_actualizar") && (
                    <div className="w-full mt-2">
                        <Button variant="espresso" size="lggg" type="button" onClick={handleEdit}>
                            <Pencil size={16} />
                            Modificar
                        </Button>
                    </div>
                )}

                {can("usuarios_habilitar") && (
                    <div className="w-full mt-2">
                        <Button variant={isActive ? "danger" : "statusActive"} size="lggg" type="button" onClick={handleStatus}>
                            <Power size={16} />
                            {isActive ? "Inhabilitar cuenta" : "Habilitar cuenta"}
                        </Button>
                    </div>
                )}
            </aside>

            {/* ===== Datos: un bloque por fila ===== */}
            <section className="grow-[999] basis-[560px] min-w-0 px-6 sm:px-8 bg-bg-w border border-bd-s100 rounded-m3-xl shadow-m3-1">
                {sections.map(({ id, title, icon: Icon, fields }) => (
                    <div key={id} id={id} className="scroll-mt-6 grid grid-cols-1 md:grid-cols-[13rem_minmax(0,1fr)] gap-4 md:gap-6 py-6 border-b border-bd-s100">
                        <h3 className="flex items-center gap-2 h-fit text-m3-title-small font-bold uppercase tracking-wider text-br-t950">
                            <Icon size={18} className="text-br-t900" />
                            {title}
                        </h3>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            {fields.map(([label, value]) => (
                                <div key={label} className="flex flex-col gap-1 min-w-0">
                                    <dt className="text-m3-label-small font-semibold uppercase tracking-wider text-br-s800">{label}</dt>
                                    <dd className="text-m3-body-large font-medium text-br-s950 break-words">{value || "—"}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                ))}

                {/* ===== Historial: quien cambio que y cuando ===== */}
                <div id="user-history" className="scroll-mt-6 grid grid-cols-1 md:grid-cols-[13rem_minmax(0,1fr)] gap-4 md:gap-6 py-6">
                    <h3 className="flex items-center gap-2 h-fit text-m3-title-small font-bold uppercase tracking-wider text-br-t950">
                        <History size={18} className="text-br-t900" />
                        Historial
                    </h3>
                    {history === null ? (
                        <p className="text-m3-body-medium text-br-s800">Cargando historial...</p>
                    ) : history.length === 0 ? (
                        <p className="text-m3-body-medium text-br-s800">Todavía no hay cambios registrados.</p>
                    ) : (
                        <ol className="flex flex-col max-h-64 overflow-y-auto pr-2">
                            {history.map((item, index) => (
                                <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
                                    {/* linea que une un cambio con el siguiente */}
                                    {index < history.length - 1 && <span aria-hidden="true" className="absolute left-[5px] top-4 bottom-0 w-0.5 bg-bg-t300" />}
                                    <span aria-hidden="true" className={`relative mt-1.5 w-3 h-3 shrink-0 rounded-m3-full ${item.action === "INHABILITAR" ? "bg-m3-error" : item.action === "HABILITAR" ? "bg-m3-success" : "bg-bg-t800"}`} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-m3-title-small font-bold text-br-s950">{ACTIONS[item.action] ?? item.action}</span>
                                        {item.reason && <span className="text-m3-body-medium text-br-s900 break-words">{item.reason}</span>}
                                        <span className="text-m3-body-small text-br-s800">{item.userName} · {formatDate(item.date)}</span>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </section>
        </main>
    );

    if (inModal) return content;

    return (
        <div className="min-h-screen flex flex-col">

            <Navbar
                variant="banda"
                image={fotoFondo}
                avatar={authBg}
                title="Ver usuario"
                onBack={() => navigate(backTo)}
                actions={
                    can("usuarios_actualizar") && (
                        <Button variant="crema" size="sm" type="button" onClick={handleEdit}>
                            <Pencil size={16} />
                            Modificar
                        </Button>
                    )
                }
            />

            {content}
        </div>
    );
}
