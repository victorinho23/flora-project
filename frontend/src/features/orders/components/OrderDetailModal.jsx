// src/features/orders/components/OrderDetailModal.jsx
// Modal para ver el detalle de una orden desde la tabla
import { ClipboardList } from "lucide-react";
import { DetailModal } from "@/shared";

// Colores de la etiqueta segun el estado de la orden
const statusStyles = {
    ACTIVA: { label: "Activa", className: "bg-green-50 text-green-900" },
    LISTA_PARA_ENTREGA: { label: "Lista para entrega", className: "bg-bg-t50 text-br-t950" },
    PAGADA: { label: "Pagada", className: "bg-bg-s50 text-br-s950" },
    CANCELADA: { label: "Cancelada", className: "bg-red-50 text-red-900" },
};

export default function OrderDetailModal({ order, onClose, onEdit }) {
    // Si no hay orden seleccionada el modal no se muestra
    if (!order) return null;

    const status = statusStyles[order.status] ?? { label: order.status, className: "bg-bg-s50 text-br-s950" };
    // Solo se puede editar si la orden no esta pagada ni cancelada
    const editable = order.status === "ACTIVA" || order.status === "LISTA_PARA_ENTREGA";

    return (
        <DetailModal
            open
            onClose={onClose}
            icon={ClipboardList}
            title={`Orden #${order.id}`}
            subtitle={`Mesa ${order.tableNumber} · ${order.waiter}`}
            onEdit={editable && onEdit ? () => onEdit(order) : undefined}
            editLabel="Actualizar orden"
        >
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Mesa</p>
                <div className="text-base font-semibold text-br-s950 break-words">{order.tableNumber}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Mesero responsable</p>
                <div className="text-base font-semibold text-br-s950 break-words">{order.waiter}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Fecha</p>
                <div className="text-base font-semibold text-br-s950 break-words">{order.createdAt ? new Date(order.createdAt).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" }) : "Sin fecha"}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Estado</p>
                <div className="text-base font-semibold text-br-s950 break-words"><span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.className}`}>{status.label}</span></div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Platillo</p>
                <div className="text-base font-semibold text-br-s950 break-words">{order.product}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Cantidad</p>
                <div className="text-base font-semibold text-br-s950 break-words">{order.quantity}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Cliente</p>
                <div className="text-base font-semibold text-br-s950 break-words">{order.customer}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Valor total</p>
                <div className="text-base font-semibold text-br-s950 break-words">${(order.total ?? 0).toLocaleString("es-CO")}</div>
            </div>
        </DetailModal>
    );
}
