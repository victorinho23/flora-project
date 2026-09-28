
import { useEffect } from "react";
import { Truck, Mail, Phone, X } from "lucide-react";
import { Button } from "@/shared";

const METAL = "bg-[linear-gradient(180deg,var(--color-br-t50)_0%,var(--color-br-t300)_45%,var(--color-br-t500)_55%,var(--color-br-t400)_100%)] bg-clip-text text-transparent";

const Field = ({ label, children, wide = false }) => (
    <div className={`rounded-lg border border-bd-w/15 bg-bg-g900/80 px-4 py-3 ${wide ? "sm:col-span-2" : ""}`}>
        <p className="text-xs text-bg-g300 mb-1">{label}</p>
        <div className="text-base text-br-t100 font-medium break-all">{children || "—"}</div>
    </div>
);

export default function SupplierDetailModal({ supplier, onClose, onEdit }) {

    useEffect(() => {
        if (!supplier) return;
        const handleKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [supplier, onClose]);

    if (!supplier) return null;

    const name = supplier.providername ?? supplier.companyName;
    const email = supplier.provideremail ?? supplier.email;
    const phone = supplier.providerphone ?? supplier.phone;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-bk/60 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="supplier-detail-title"
        >
            <div
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border-2 border-bd-t500 bg-bg-g950/95 p-6 shadow-[0_0_15px_var(--color-tertiary-400),0_0_35px_color-mix(in_srgb,var(--color-tertiary-400)_40%,transparent),0_20px_40px_-12px_rgb(0_0_0/0.6)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Encabezado */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-bg-g900 border border-bd-t500/60 text-br-t300">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h2 id="supplier-detail-title" className={`text-xl font-bold ${METAL}`}>
                                Detalle del proveedor
                            </h2>
                            <p className="text-sm text-bg-g300">Proveedor #{supplier.id}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-md text-br-t100 hover:text-br-t300 hover:bg-bg-w/10 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Nombre" wide>{name}</Field>

                    {supplier.nit && <Field label="NIT">{supplier.nit}</Field>}
                    {supplier.contactName && <Field label="Contacto">{supplier.contactName}</Field>}

                    <Field label="Correo electrónico">
                        {email && (
                            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 hover:text-br-t300 transition-colors">
                                <Mail size={16} />
                                {email}
                            </a>
                        )}
                    </Field>

                    <Field label="Teléfono">
                        {phone && (
                            <a href={`tel:${phone}`} className="inline-flex items-center gap-2 hover:text-br-t300 transition-colors">
                                <Phone size={16} />
                                {phone}
                            </a>
                        )}
                    </Field>

                    {supplier.category && <Field label="Categoría">{supplier.category}</Field>}

                    {supplier.isActive !== undefined && (
                        <Field label="Estado">
                            <span className={`inline-flex items-center gap-2 ${supplier.isActive ? "text-green-400" : "text-red-400"}`}>
                                <span className={`w-2 h-2 rounded-full ${supplier.isActive ? "bg-green-400" : "bg-red-400"}`} />
                                {supplier.isActive ? "Activo" : "Inactivo"}
                            </span>
                        </Field>
                    )}

                    {supplier.address && <Field label="Dirección" wide>{supplier.address}</Field>}
                </div>

                <div className="flex flex-wrap justify-end gap-3 mt-6">
                    {onEdit && (
                        <Button size="sm" variant="remolino" onClick={() => onEdit(supplier)}>
                            Editar
                        </Button>
                    )}
                    <Button size="sm" variant="sex" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
}