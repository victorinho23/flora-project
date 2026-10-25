import { useEffect } from "react";
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
    children,
}) {
    useEffect(() => {
        if (!open) return;
        const handleKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    // Si esta cerrado no se renderiza nada
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-bk/60 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`w-full ${image !== undefined ? "max-w-4xl" : "max-w-2xl"} max-h-[90vh] overflow-y-auto rounded-2xl border border-bd-s100 bg-bg-w shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 p-6 bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950">
                    <div className="flex items-center gap-3 min-w-0">
                        {Icon && (
                            <div className="p-3 rounded-xl bg-bg-w/10 ring-1 ring-bd-w/25 text-br-t100 shrink-0">
                                <Icon size={24} />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold text-bg-w">{title}</h2>
                            {subtitle && <p className="text-sm text-br-p100">{subtitle}</p>}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-md text-bg-w hover:bg-bg-w/15 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={`grid gap-6 p-6 ${image !== undefined ? "md:grid-cols-[16rem_minmax(0,1fr)]" : ""}`}>
                    {image !== undefined && (
                        <div className="w-full aspect-square md:self-start rounded-xl overflow-hidden border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] flex items-center justify-center">
                            {image ? (
                                <img src={image} alt={imageAlt} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-semibold text-br-s800">Sin imagen</span>
                            )}
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                        {children}
                    </div>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-end gap-3 px-6 pb-6">
                    {onEdit && (
                        <Button size="sm" variant="espresso" onClick={onEdit}>
                            {editLabel}
                        </Button>
                    )}
                    <Button size="sm" variant="crema" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
}
