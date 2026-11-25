// src/features/orders/components/OrderDetailModal.jsx
// Modal para ver el detalle de una orden desde la tabla o desde el plano de mesas
import { ClipboardList, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DetailModal, Button } from "@/shared";

// Colores de la etiqueta segun el estado (los mismos del plano de mesas y del detalle)
const statusStyles = {
    ACTIVA: { label: "Activa · en cocina", className: "bg-m3-secondary-container text-m3-on-secondary-container" },
    LISTA_PARA_ENTREGA: { label: "Lista para entregar", className: "bg-m3-success-container text-m3-success" },
    PAGADA: { label: "Pagada", className: "bg-bg-s50 text-br-s950" },
    CANCELADA: { label: "Cancelada", className: "bg-m3-error-container text-m3-on-error-container" },
};

// caja de dato igual a la de los otros modales
const field = "border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-m3-1 rounded-m3-md px-4 py-3";

export default function OrderDetailModal({ order, onClose, onEdit }) {
    const navigate = useNavigate();

    // Si no hay orden seleccionada el modal no se muestra
    if (!order) return null;

    const status = statusStyles[order.status] ?? { label: order.status, className: "bg-bg-s50 text-br-s950" };
    // Solo se puede editar si la orden no esta pagada ni cancelada
    const editable = order.status === "ACTIVA" || order.status === "LISTA_PARA_ENTREGA";
    const items = order.items ?? [];

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
            <div className={field}>
                <p className="text-m3-label-large text-br-s800 mb-1">Estado</p>
                <span className={`inline-flex px-3 py-1 rounded-m3-sm text-m3-label-large font-semibold ${status.className}`}>{status.label}</span>
            </div>
            <div className={field}>
                <p className="text-m3-label-large text-br-s800 mb-1">Fecha</p>
                <p className="text-m3-body-large font-semibold text-br-s950">{order.createdAt ? new Date(order.createdAt).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" }) : "Sin fecha"}</p>
            </div>

            {/* platillos uno por uno, como en la comanda */}
            <div className={`${field} sm:col-span-2`}>
                <p className="text-m3-label-large text-br-s800 mb-2">Platillos ({order.quantity ?? items.length})</p>
                {items.length > 0 ? (
                    <ul className="divide-y divide-bd-s100">
                        {items.map((item) => (
                            <li key={item.dishId} className="flex items-center justify-between gap-3 py-2 text-m3-body-large">
                                <span className="text-br-s950"><b>{item.quantity} ×</b> {item.dishName}</span>
                                <span className="font-semibold text-br-t900">${(Number(item.price) * item.quantity).toLocaleString("es-CO")}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-m3-body-large font-semibold text-br-s950">{order.product || "Sin platillos"}</p>
                )}
            </div>

            {order.notes && (
                <div className={`${field} sm:col-span-2`}>
                    <p className="text-m3-label-large text-br-s800 mb-1">Observaciones</p>
                    <p className="text-m3-body-large text-br-s950">{order.notes}</p>
                </div>
            )}

            <div className={`${field} sm:col-span-2 flex items-center justify-between gap-3`}>
                <p className="text-m3-title-medium font-bold text-br-s950">Valor total</p>
                <p className="text-m3-headline-small font-bold text-br-t900">${(order.total ?? 0).toLocaleString("es-CO")}</p>
            </div>

            {/* ir a la pagina de la orden para cambiar el estado o imprimir la comanda */}
            <div className="sm:col-span-2 flex justify-center sm:justify-start">
                <Button size="sm" variant="caramelo" type="button" onClick={() => navigate(`/orderView/${order.id}`)}>
                    <Printer size={16} />
                    Comanda y estado
                </Button>
            </div>
        </DetailModal>
    );
}
