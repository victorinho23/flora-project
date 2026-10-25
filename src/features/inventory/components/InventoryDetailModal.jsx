// src/features/inventory/components/InventoryDetailModal.jsx
// Modal para ver el detalle de un producto sin salir de la tabla
import { Package } from "lucide-react";
import { DetailModal } from "@/shared";

// Colores de la etiqueta segun el estado del producto
const statusStyles = {
    Disponible: "bg-green-50 text-green-900",
    Agotado: "bg-bg-t50 text-br-t950",
    Vencido: "bg-red-50 text-red-900",
    Avería: "bg-red-50 text-red-900",
};

// Formatea un valor como pesos colombianos
const money = (value) => `$${(value ?? 0).toLocaleString("es-CO")}`;

export default function InventoryDetailModal({ item, onClose, onEdit }) {
    // Si no hay producto seleccionado el modal no se muestra
    if (!item) return null;

    return (
        <DetailModal
            open
            onClose={onClose}
            icon={Package}
            title={item.name}
            subtitle={`Producto #${item.id} · ${item.brand}`}
            image={item.image || undefined}
            imageAlt={item.name}
            onEdit={onEdit && (() => onEdit(item))}
            editLabel="Actualizar inventario"
        >
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Marca</p>
                <div className="text-base font-semibold text-br-s950 break-words">{item.brand}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Código de barras</p>
                <div className="text-base font-semibold text-br-s950 break-words">{item.barcode}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Cantidad (lote actual)</p>
                <div className="text-base font-semibold text-br-s950 break-words">{item.quantity}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Cantidad total</p>
                <div className="text-base font-semibold text-br-s950 break-words">{item.totalQuantity}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Valor unitario</p>
                <div className="text-base font-semibold text-br-s950 break-words">{money(item.unitValue)}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Valor total</p>
                <div className="text-base font-semibold text-br-s950 break-words">{money(item.totalValue)}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Estado</p>
                <div className="text-base font-semibold text-br-s950 break-words"><span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[item.status] ?? "bg-bg-s50 text-br-s950"}`}>{item.status}</span></div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Fecha de vencimiento</p>
                <div className="text-base font-semibold text-br-s950 break-words">{item.expirationDate}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 sm:col-span-2">
                <p className="text-sm font-medium text-br-s800 mb-1">Descripción</p>
                <div className="text-base font-semibold text-br-s950 break-words">{item.description}</div>
            </div>
        </DetailModal>
    );
}
