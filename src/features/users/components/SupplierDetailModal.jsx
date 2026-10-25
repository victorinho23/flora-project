
// src/features/users/components/SupplierDetailModal.jsx
// Modal para ver la ficha de un proveedor desde la tabla
import { Truck, Mail, Phone } from "lucide-react";
import { DetailModal } from "@/shared";
import { inventory } from "@/features/inventory/data/inventory";

export default function SupplierDetailModal({ supplier, onClose, onEdit }) {

    // Si no hay proveedor seleccionado el modal no se muestra
    if (!supplier) return null;

    // Soporta los dos formatos de datos de proveedores que hay en el proyecto
    const name = supplier.providername ?? supplier.companyName;
    const email = supplier.provideremail ?? supplier.email;
    const phone = supplier.providerphone ?? supplier.phone;
    // Productos asociados ordenados alfabeticamente
    const products = (supplier.products ?? [])
        .map((id) => inventory.find((item) => item.id === id) ?? { id, name: id, status: "Desconocido" })
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <DetailModal
            open
            onClose={onClose}
            icon={Truck}
            title="Detalle del proveedor"
            subtitle={`Proveedor #${supplier.id}`}
            onEdit={onEdit && (() => onEdit(supplier))}
        >
                    <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 sm:col-span-2 [&>div]:break-all">
                        <p className="text-sm font-medium text-br-s800 mb-1">Nombre</p>
                        <div className="text-base font-semibold text-br-s950 break-words">{name}</div>
                    </div>

                    {supplier.nit && <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 [&>div]:break-all">
                        <p className="text-sm font-medium text-br-s800 mb-1">{supplier.documentType ? `Documento (${supplier.documentType})` : "NIT"}</p>
                        <div className="text-base font-semibold text-br-s950 break-words">{supplier.nit}</div>
                    </div>}
                    {supplier.contactName && <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 [&>div]:break-all">
                        <p className="text-sm font-medium text-br-s800 mb-1">Contacto</p>
                        <div className="text-base font-semibold text-br-s950 break-words">{supplier.contactName}</div>
                    </div>}

                    <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 [&>div]:break-all">
                        <p className="text-sm font-medium text-br-s800 mb-1">Correo electrónico</p>
                        <div className="text-base font-semibold text-br-s950 break-words">
                            {email && (
                                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 hover:text-br-t900 transition-colors">
                                    <Mail size={16} />
                                    {email}
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 [&>div]:break-all">
                        <p className="text-sm font-medium text-br-s800 mb-1">Teléfono</p>
                        <div className="text-base font-semibold text-br-s950 break-words">
                            {phone && (
                                <a href={`tel:${phone}`} className="inline-flex items-center gap-2 hover:text-br-t900 transition-colors">
                                    <Phone size={16} />
                                    {phone}
                                </a>
                            )}
                        </div>
                    </div>

                    {supplier.category && <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 [&>div]:break-all">
                        <p className="text-sm font-medium text-br-s800 mb-1">Categoría</p>
                        <div className="text-base font-semibold text-br-s950 break-words">{supplier.category}</div>
                    </div>}

                    {supplier.isActive !== undefined && (
                        <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 [&>div]:break-all">
                            <p className="text-sm font-medium text-br-s800 mb-1">Estado</p>
                            <div className="text-base font-semibold text-br-s950 break-words">
                                <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-semibold ${supplier.isActive ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>
                                    <span className={`h-2 w-2 rounded-full ${supplier.isActive ? "bg-green-700" : "bg-red-700"}`} />
                                    {supplier.isActive ? "Habilitado" : "Inhabilitado"}
                                </span>
                            </div>
                        </div>
                    )}

                    {supplier.address && <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 sm:col-span-2 [&>div]:break-all">
                        <p className="text-sm font-medium text-br-s800 mb-1">Dirección</p>
                        <div className="text-base font-semibold text-br-s950 break-words">{supplier.address}</div>
                    </div>}

                    {supplier.products && (
                        <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 sm:col-span-2">
                            <p className="text-sm font-medium text-br-s800 mb-1">Productos que suministra</p>
                            <div className="text-base font-semibold text-br-s950 break-words">
                                {products.length ? (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {products.map((product) => (
                                            <span key={product.id} className="inline-flex items-center gap-2 rounded-full border border-bd-s300 bg-bg-w px-3 py-1 text-sm">
                                                {product.name}
                                                {product.status !== "Disponible" && (
                                                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-semibold bg-red-50 text-red-900">
                                                        <span className="h-2 w-2 rounded-full bg-red-700" />
                                                        Inhabilitado ({product.status})
                                                    </span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                ) : "Sin productos asociados"}
                            </div>
                        </div>
                    )}

                    {supplier.observations !== undefined && (
                        <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 sm:col-span-2">
                            <p className="text-sm font-medium text-br-s800 mb-1">Observaciones internas</p>
                            <div className="text-base font-semibold text-br-s950 break-words">{supplier.observations}</div>
                        </div>
                    )}
        </DetailModal>
    );
}
