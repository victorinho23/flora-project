// src/features/orders/components/OrderDetailModal.jsx
// Modal con el detalle de una orden (desde la tabla o desde el mapa de mesas):
// aqui mismo se cambia el estado, se imprime la comanda y se anula, ya no hay pagina aparte
import { ClipboardList, Printer, ChefHat, Wallet, Undo2, Pencil, Ban, MapPin } from "lucide-react";
import { DetailModal, Button } from "@/shared";
import { cancelOrder, changeOrderStatus } from "../services/orderService";
import { showConfirmAlert, showConfirmDeleteAlert, showDeleteSuccessAlert, showSuccesAlert, showUnexpectedErrorAlert } from "@/shared/services/alertService";
import { useAccess } from "@/features/auth/services/accessService";

// Colores de la etiqueta segun el estado (los mismos del plano de mesas y del detalle)
const statusStyles = {
    ACTIVA: { label: "Activa · en cocina", className: "bg-m3-secondary-container text-m3-on-secondary-container" },
    LISTA_PARA_ENTREGA: { label: "Lista para entregar", className: "bg-m3-success-container text-m3-success" },
    PAGADA: { label: "Pagada", className: "bg-bg-s50 text-br-s950" },
    CANCELADA: { label: "Cancelada", className: "bg-m3-error-container text-m3-on-error-container" },
};

// siguiente paso de la comanda segun el estado (igual que en el backend)
const NEXT_STEPS = {
    ACTIVA: [
        { status: "LISTA_PARA_ENTREGA", label: "Lista para entregar", icon: ChefHat, variant: "caramelo", confirm: "La cocina terminó la comanda y la orden pasa a lista para entregar." },
    ],
    LISTA_PARA_ENTREGA: [
        { status: "ACTIVA", label: "Devolver a cocina", icon: Undo2, variant: "crema", confirm: "La orden vuelve a cocina (por ejemplo, si a la mesa le faltó algo)." },
        { status: "PAGADA", label: "Registrar pago", icon: Wallet, variant: "espresso", confirm: "La mesa queda libre y la orden ya no se podrá modificar." },
    ],
};

// fecha y hora corta para la comanda impresa
const formatDate = (date) => new Date(date).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });

// caja de dato igual a la de los otros modales
const field = "border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-m3-1 rounded-m3-md px-4 py-3";

// onChanged: se llama cuando la orden cambia de estado o se anula, para que la lista se recargue
// (si no llega, el modal es solo de consulta: no muestra los botones de estado ni anular)
// onShowMap: abre el mapa con la mesa de la orden resaltada, para que el mesero sepa a donde llevarla
export default function OrderDetailModal({ order, onClose, onEdit, onChanged, onShowMap }) {
    const can = useAccess();

    // Si no hay orden seleccionada el modal no se muestra
    if (!order) return null;

    const status = statusStyles[order.status] ?? { label: order.status, className: "bg-bg-s50 text-br-s950" };
    // Solo se puede editar si la orden no esta pagada ni cancelada
    const editable = order.status === "ACTIVA" || order.status === "LISTA_PARA_ENTREGA";
    const items = order.items ?? [];
    const steps = onChanged && can("ordenes_actualizar") ? NEXT_STEPS[order.status] ?? [] : [];
    const canCancel = onChanged && editable && can("ordenes_anular");

    // mueve la orden al siguiente paso pidiendo confirmacion antes
    const handleStep = async (step) => {
        const confirmation = await showConfirmAlert({
            title: `¿${step.label}?`,
            text: step.confirm,
            confirmButtonText: step.label,
        });
        if (!confirmation.isConfirmed) return;

        try {
            await changeOrderStatus(order.id, step.status);
            await onChanged();
            await showSuccesAlert({ title: "Orden actualizada", text: `La orden quedó: ${step.label.toLowerCase()}`, timer: 2500 });
        } catch (error) {
            await showUnexpectedErrorAlert({ text: error.message, timer: 3000 });
        }
    };

    const handleCancelOrder = async () => {
        const result = await showConfirmDeleteAlert({
            title: "¿Anular orden?",
            text: "¿Seguro que deseas anular esta orden? Esta acción no se puede deshacer.",
            confirmButtonText: "Anular",
        });
        if (!result.isConfirmed) return;

        try {
            await cancelOrder(order.id);
            await onChanged();
            await showDeleteSuccessAlert({ title: "Orden anulada", text: "La orden ha sido anulada correctamente", timer: 3000 });
        } catch (error) {
            await showUnexpectedErrorAlert({ text: error.message, timer: 3000 });
        }
    };

    return (
        <DetailModal
            open
            onClose={onClose}
            icon={ClipboardList}
            title={`Orden #${order.id}`}
            subtitle={`Mesa ${order.tableNumber} · ${order.waiter}`}
            size="max-w-3xl"
            footer={false}
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

            {/* acciones: el siguiente paso de la comanda, actualizar, imprimir y anular (separada a la izquierda) */}
            <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                {canCancel && (
                    <Button size="md" variant="danger" type="button" onClick={handleCancelOrder}>
                        <Ban size={16} />
                        Anular
                    </Button>
                )}
                <div className="flex flex-wrap items-center justify-end gap-3 ml-auto">
                    {onShowMap && (
                        <Button size="md" variant="contorno" type="button" onClick={() => onShowMap(order)}>
                            <MapPin size={16} />
                            Ver en el mapa
                        </Button>
                    )}
                    <Button size="md" variant="contorno" type="button" onClick={() => window.print()}>
                        <Printer size={16} />
                        Imprimir comanda
                    </Button>
                    {editable && onEdit && (
                        <Button size="md" variant="contorno" type="button" onClick={() => onEdit(order)}>
                            <Pencil size={16} />
                            Actualizar
                        </Button>
                    )}
                    {steps.map((step) => (
                        <Button key={step.status} size="md" variant={step.variant} type="button" onClick={() => handleStep(step)}>
                            <step.icon size={16} />
                            {step.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Comanda: no se ve en pantalla, solo sale al imprimir (ticket de 80mm para cocina o caja) */}
            <section className="comanda hidden print:block" aria-hidden="true">
                <p style={{ textAlign: "center", fontWeight: 700, fontSize: "16px" }}>FLORA</p>
                <p style={{ textAlign: "center", fontWeight: 700 }}>{order.status === "PAGADA" ? "CUENTA" : "COMANDA"}</p>
                <p>------------------------------</p>
                <p>Orden: #{order.id}</p>
                <p style={{ fontWeight: 700, fontSize: "18px" }}>MESA {order.tableNumber}</p>
                <p>Mesero: {order.waiter}</p>
                {order.createdAt && <p>Fecha: {formatDate(order.createdAt)}</p>}
                <p>------------------------------</p>
                {items.map((item) => (
                    <p key={item.dishId} style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                        <span><b>{item.quantity} x</b> {item.dishName}</span>
                        {order.status === "PAGADA" && <span>${(Number(item.price) * item.quantity).toLocaleString("es-CO")}</span>}
                    </p>
                ))}
                {order.notes && (
                    <>
                        <p>------------------------------</p>
                        <p><b>Obs:</b> {order.notes}</p>
                    </>
                )}
                <p>------------------------------</p>
                <p style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span>TOTAL</span>
                    <span>${(order.total ?? 0).toLocaleString("es-CO")}</span>
                </p>
            </section>
        </DetailModal>
    );
}
