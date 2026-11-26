import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import Button from "./Button";

// src/shared/components/DetailModal.jsx
// Modal base para ver el detalle de un registro dentro de la misma tabla
export default function DetailModal({
    open,
    onClose,
    icon: Icon,
    title,
    subtitle,
    image,
    imageAlt = "",
    onEdit,
    editLabel = "Editar",
    // clases del cuerpo: por defecto dos columnas de datos, se puede cambiar (ej. el tablero de mesas)
    bodyClassName = "grid-cols-1 sm:grid-cols-2",
    // ancho maximo del modal cuando no lleva imagen
    size = "max-w-2xl",
    // false cuando adentro va un formulario con sus propios botones (no se repite "Cerrar")
    footer = true,
    // en formularios no se cierra al tocar afuera, para no perder lo que se escribio
    closeOnBackdrop = true,
    children,
}) {
    const titleId = useId();
    const panelRef = useRef(null);
    // se guarda onClose en una referencia para que el efecto no se repita en cada render
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) return;
        // al abrir se guarda quien tenia el foco para devolverselo al cerrar (asi lo pide Material 3)
        const previous = document.activeElement;
        panelRef.current?.focus();
        // mientras el modal esta abierto la pagina de atras no se mueve
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKey = (e) => {
            // solo responde si la tecla se presiono dentro de este modal
            // (asi una alerta o una ventana encima no cierran tambien esta)
            if (!panelRef.current?.contains(e.target)) return;
            if (e.key === "Escape") return closeRef.current();
            // Tab da la vuelta dentro del modal y no se sale a la pagina de atras
            if (e.key !== "Tab" || !panelRef.current) return;
            const focusable = panelRef.current.querySelectorAll("button:not([disabled]), a[href], input, select, textarea");
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = overflow;
            previous?.focus?.();
        };
    }, [open]);

    // Si esta cerrado no se renderiza nada
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-bk/60 backdrop-blur-sm animate-[m3-fade_200ms_var(--md-sys-motion-easing-standard)]"
            onClick={closeOnBackdrop ? onClose : undefined}
        >
            <div
                ref={panelRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={`w-full ${image !== undefined ? "max-w-4xl" : size} max-h-[90vh] overflow-y-auto rounded-m3-xl border border-bd-s100 bg-bg-w shadow-m3-3 outline-none animate-[m3-dialog-in_300ms_var(--md-sys-motion-easing-emphasized-decelerate)]`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 p-6 bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950">
                    <div className="flex items-center gap-3 min-w-0">
                        {Icon && (
                            <div className="p-3 rounded-m3-md bg-bg-w/10 ring-1 ring-bd-w/25 text-br-t100 shrink-0">
                                <Icon size={24} />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h2 id={titleId} className="text-m3-headline-small font-bold text-bg-w">{title}</h2>
                            {subtitle && <p className="text-sm text-br-p100">{subtitle}</p>}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="m3-state w-12 h-12 flex items-center justify-center shrink-0 rounded-m3-full text-bg-w focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-t200"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={`grid gap-6 p-6 ${image !== undefined ? "md:grid-cols-[16rem_minmax(0,1fr)]" : ""}`}>
                    {image !== undefined && (
                        <div className="w-full aspect-square md:self-start rounded-m3-md overflow-hidden border border-bd-s100 border-l-5 border-l-bd-t800 rounded-m3-md bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-m3-1 flex items-center justify-center">
                            {image ? (
                                <img src={image} alt={imageAlt} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-semibold text-br-s800">Sin imagen</span>
                            )}
                        </div>
                    )}
                    <div className={`grid ${bodyClassName} gap-3 content-start`}>
                        {children}
                    </div>
                </div>

                {footer && (
                // Material 3: cerrar a la izquierda y la accion principal a la derecha (igual que en las alertas)
                <div className="flex flex-wrap justify-center sm:justify-end gap-3 px-6 pb-6">
                    <Button size="sm" variant="contorno" onClick={onClose}>
                        Cerrar
                    </Button>
                    {onEdit && (
                        <Button size="sm" variant="espresso" onClick={onEdit}>
                            {editLabel}
                        </Button>
                    )}
                </div>
                )}
            </div>
        </div>
    );
}
