// src/features/products/components/DishDetailModal.jsx
// Modal para ver el detalle de un platillo desde la tabla
import { UtensilsCrossed } from "lucide-react";
import { DetailModal } from "@/shared";

export default function DishDetailModal({ dish, onClose, onEdit }) {
    // Si no hay platillo seleccionado el modal no se muestra
    if (!dish) return null;

    return (
        <DetailModal
            open
            onClose={onClose}
            icon={UtensilsCrossed}
            title={dish.name}
            subtitle={`Platillo #${dish.id}`}
            image={dish.image || undefined}
            imageAlt={dish.name}
            onEdit={onEdit && (() => onEdit(dish))}
            editLabel="Actualizar menú"
        >
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Categoría</p>
                <div className="text-base font-semibold text-br-s950 break-words">{dish.category}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Precio</p>
                <div className="text-base font-semibold text-br-s950 break-words">${(dish.price ?? 0).toLocaleString("es-CO")}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Estado</p>
                <div className="text-base font-semibold text-br-s950 break-words">
                    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-semibold ${dish.is_active ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>
                        <span className={`h-2 w-2 rounded-full ${dish.is_active ? "bg-green-700" : "bg-red-700"}`} />
                        {dish.is_active ? "Habilitado" : "Inhabilitado"}
                    </span>
                </div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 sm:col-span-2">
                <p className="text-sm font-medium text-br-s800 mb-1">Descripción</p>
                <div className="text-base font-semibold text-br-s950 break-words">{dish.description}</div>
            </div>
        </DetailModal>
    );
}
