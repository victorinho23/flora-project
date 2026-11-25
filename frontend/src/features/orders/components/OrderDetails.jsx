import { useState } from "react";
import { Button, Navbar } from "@/shared";
import { useNavigate } from "react-router-dom";
import { Printer, ChefHat, Wallet, Undo2 } from "lucide-react";
import { cancelOrder, changeOrderStatus } from "../services/orderService";
import { showConfirmDeleteAlert, showDeleteSuccessAlert, showDeleteCancelAlert, showUnexpectedErrorAlert, showConfirmAlert, showSuccesAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/fondo-orders.png";
import { useAccess } from "@/features/auth/services/accessService";

const STATUS_LABELS = {
    ACTIVA: "Activa · en cocina",
    LISTA_PARA_ENTREGA: "Lista para entrega",
    CANCELADA: "Cancelada",
    PAGADA: "Pagada",
};

// mismos colores del tablero de mesas: caramelo en cocina, verde lista, cafe pagada, rojo anulada
const STATUS_COLORS = {
    ACTIVA: "bg-m3-secondary",
    LISTA_PARA_ENTREGA: "bg-m3-success",
    CANCELADA: "bg-m3-error",
    PAGADA: "bg-m3-primary",
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

// fecha y hora corta para la comanda
const formatDate = (date) => new Date(date).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });

export function OrderDetails({ order }) {
    const navigate = useNavigate();

    // Estado local del status, para reflejar la anulacion al instante sin recargar la pagina
    const [status, setStatus] = useState(order.status);

    const total = order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    const can = useAccess();
    const canEdit = status !== "PAGADA" && status !== "CANCELADA";

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
            setStatus(step.status);
            await showSuccesAlert({ title: "Orden actualizada", text: `La orden quedó: ${STATUS_LABELS[step.status].toLowerCase()}`, timer: 2500 });
        } catch (error) {
            await showUnexpectedErrorAlert({ text: error.message, timer: 3000 });
        }
    };

    const handleEdit = () => {
        navigate(`/orderEdit/${order.id}`, {
            state: { order: { ...order, status } },
        });
    };

    const handleCancelOrder = async () => {
        const result = await showConfirmDeleteAlert({
            title: "¿Anular orden?",
            text: "¿Seguro que deseas anular esta orden? Esta acción no se puede deshacer.",
            confirmButtonText: "Anular",
        });

        if (!result.isConfirmed) {
            await showDeleteCancelAlert({
                title: "Cancelado",
                text: "La orden no fue anulada",
                timer: 3000,
            });
            return;
        }

        try {
            await cancelOrder(order.id);

            setStatus("CANCELADA");
            await showDeleteSuccessAlert({
                title: "Orden anulada",
                text: "La orden ha sido anulada correctamente",
                timer: 3000,
            });
        } catch (error) {
            await showUnexpectedErrorAlert({
                text: error.message,
                timer: 3000,
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col">

            <Navbar
                variant="banda"
                image={fotoFondo}
                title="Detalle de la orden"
                onBack={() => navigate("/orderList")}
            />

            <div className="flex-1 flex justify-center px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
                <div className="w-full max-w-4xl flex flex-col gap-6">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-m3-1 rounded-m3-md px-4 py-3 w-full">
                            <p className="text-sm font-medium text-br-s800 mb-1">ID de orden</p>
                            <div className="text-base font-semibold text-br-s950 break-words">{order.id || "—"}</div>
                        </div>
                        <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-m3-1 rounded-m3-md px-4 py-3 w-full">
                            <p className="text-sm font-medium text-br-s800 mb-1">Mesa</p>
                            <div className="text-base font-semibold text-br-s950 break-words">{order.tableNumber || "—"}</div>
                        </div>
                        <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-m3-1 rounded-m3-md px-4 py-3 w-full">
                            <p className="text-sm font-medium text-br-s800 mb-1">Mesero responsable</p>
                            <div className="text-base font-semibold text-br-s950 break-words">{order.waiterName || "—"}</div>
                        </div>
                    </div>

                    <div
                        className={`
                            flex items-center gap-2 w-fit self-center sm:self-start
                            px-5 py-3 rounded-m3-sm font-semibold text-white
                            ${STATUS_COLORS[status]}
                        `}
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                        {STATUS_LABELS[status]}
                    </div>

                    <div className="bg-bg-s50 border border-bd-s100 rounded-m3-md p-4 flex flex-col gap-3">
                        <p className="text-sm text-br-s800">Platillos</p>
                        {order.items.map((item) => (
                            <div
                                key={item.dishId}
                                className="flex items-center justify-between bg-bg-w border border-bd-s100 rounded-m3-sm p-3"
                            >
                                <div>
                                    <p className="text-br-s950 font-semibold">{item.dishName}</p>
                                    <p className="text-br-s800 text-sm">
                                        Cantidad: {item.quantity} × ${Number(item.price).toLocaleString("es-CO")}
                                    </p>
                                </div>
                                <p className="text-br-t900 font-bold">
                                    ${(Number(item.price) * item.quantity).toLocaleString("es-CO")}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-m3-1 rounded-m3-sm px-4 py-3">
                        <span className="text-br-s950 font-semibold">Total</span>
                        <span className="text-br-t900 font-bold text-lg">
                            ${total.toLocaleString("es-CO")}
                        </span>
                    </div>

                    {order.notes && (
                        <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-m3-1 rounded-m3-md px-4 py-3 w-full">
                            <p className="text-sm font-medium text-br-s800 mb-1">Observaciones</p>
                            <div className="text-base font-semibold text-br-s950 break-words">{order.notes || "—"}</div>
                        </div>
                    )}

                    {/* Acciones: primero el siguiente paso de la comanda, luego editar, imprimir y anular */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                        {can("ordenes_actualizar") && (NEXT_STEPS[status] ?? []).map((step) => (
                            <Button key={step.status} variant={step.variant} size="lg" type="button" onClick={() => handleStep(step)}>
                                <step.icon size={18} />
                                {step.label}
                            </Button>
                        ))}

                        {canEdit && can("ordenes_actualizar") && (
                            <Button variant="crema" size="lg" type="button" onClick={handleEdit}>
                                Actualizar orden
                            </Button>
                        )}

                        <Button variant="crema" size="lg" type="button" onClick={() => window.print()}>
                            <Printer size={18} />
                            Imprimir comanda
                        </Button>

                        {canEdit && can("ordenes_anular") && (
                            <Button variant="danger" size="lg" type="button" onClick={handleCancelOrder}>
                                Anular orden
                            </Button>
                        )}
                    </div>

                    {/* Comanda: no se ve en pantalla, solo sale al imprimir (ticket de 80mm para cocina o caja) */}
                    <section className="comanda hidden print:block" aria-hidden="true">
                        <p style={{ textAlign: "center", fontWeight: 700, fontSize: "16px" }}>FLORA</p>
                        <p style={{ textAlign: "center", fontWeight: 700 }}>{status === "PAGADA" ? "CUENTA" : "COMANDA"}</p>
                        <p>------------------------------</p>
                        <p>Orden: #{order.id}</p>
                        <p style={{ fontWeight: 700, fontSize: "18px" }}>MESA {order.tableNumber}</p>
                        <p>Mesero: {order.waiterName}</p>
                        <p>Fecha: {formatDate(order.createdAt)}</p>
                        <p>------------------------------</p>
                        {order.items.map((item) => (
                            <p key={item.dishId} style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                                <span><b>{item.quantity} x</b> {item.dishName}</span>
                                {status === "PAGADA" && <span>${(Number(item.price) * item.quantity).toLocaleString("es-CO")}</span>}
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
                            <span>${total.toLocaleString("es-CO")}</span>
                        </p>
                    </section>

                </div>
            </div>

        </div>
    );
}

export default OrderDetails;