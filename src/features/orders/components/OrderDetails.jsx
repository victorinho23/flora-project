import { useState } from "react";
import { Button, Navbar } from "@/shared";
import { useNavigate } from "react-router-dom";
import { showConfirmDeleteAlert, showDeleteSuccessAlert, showDeleteCancelAlert, showUnexpectedErrorAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/fondo-orders.png";

const STATUS_LABELS = {
    ACTIVA: "Activa",
    LISTA_PARA_ENTREGA: "Lista para entrega",
    CANCELADA: "Cancelada",
    PAGADA: "Pagada",
};

const STATUS_COLORS = {
    ACTIVA: "bg-green-900",
    LISTA_PARA_ENTREGA: "bg-blue-900",
    CANCELADA: "bg-red-900",
    PAGADA: "bg-gray-800",
};

export function OrderDetails({ order }) {
    const navigate = useNavigate();

    // Estado local del status, para reflejar la anulacion al instante sin recargar la pagina
    const [status, setStatus] = useState(order.status);

    const total = order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    const canEdit = status !== "PAGADA" && status !== "CANCELADA";

    const handleEdit = () => {
        navigate(`/orderEdit/${order.id}`, {
            state: { order: { ...order, status } },
        });
    };

    const handleCancelOrder = async () => {
        const result = await showConfirmDeleteAlert({
            title: "¿Anular orden?",
            text: "¿Seguro que deseas anular esta orden? Esta accion no se puede deshacer.",
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
            // Aqui luego va la llamada real al backend
            // await cancelOrder(order.id)

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
                onBack={() => navigate(-1)}
                backSide="right"
            />

            <div className="flex-1 flex justify-center px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
                <div className="w-full max-w-4xl flex flex-col gap-6">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full">
                            <p className="text-sm font-medium text-br-s800 mb-1">ID de orden</p>
                            <div className="text-base font-semibold text-br-s950 break-words">{order.id || "—"}</div>
                        </div>
                        <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full">
                            <p className="text-sm font-medium text-br-s800 mb-1">Mesa</p>
                            <div className="text-base font-semibold text-br-s950 break-words">{order.tableNumber || "—"}</div>
                        </div>
                        <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full">
                            <p className="text-sm font-medium text-br-s800 mb-1">Mesero responsable</p>
                            <div className="text-base font-semibold text-br-s950 break-words">{order.waiterName || "—"}</div>
                        </div>
                    </div>

                    <div
                        className={`
                            flex items-center gap-2 w-fit self-center sm:self-start
                            px-5 py-3 rounded-lg font-semibold text-white
                            ${STATUS_COLORS[status]}
                        `}
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                        {STATUS_LABELS[status]}
                    </div>

                    <div className="bg-bg-s50 border border-bd-s100 rounded-xl p-4 flex flex-col gap-3">
                        <p className="text-sm text-br-s800">Platillos</p>
                        {order.items.map((item) => (
                            <div
                                key={item.dishId}
                                className="flex items-center justify-between bg-bg-w border border-bd-s100 rounded-lg p-3"
                            >
                                <div>
                                    <p className="text-br-s950 font-semibold">{item.dishName}</p>
                                    <p className="text-br-s800 text-sm">
                                        Cantidad: {item.quantity} × ${Number(item.price).toLocaleString()}
                                    </p>
                                </div>
                                <p className="text-br-t900 font-bold">
                                    ${(Number(item.price) * item.quantity).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-lg px-4 py-3">
                        <span className="text-br-s950 font-semibold">Total</span>
                        <span className="text-br-t900 font-bold text-lg">
                            ${total.toLocaleString()}
                        </span>
                    </div>

                    {order.notes && (
                        <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full">
                            <p className="text-sm font-medium text-br-s800 mb-1">Observaciones</p>
                            <div className="text-base font-semibold text-br-s950 break-words">{order.notes || "—"}</div>
                        </div>
                    )}

                    {canEdit && (
                        <div className="flex flex-col items-center sm:flex-row gap-4">
                            <Button
                                variant="danger"
                                size="lgg"
                                type="button"
                                onClick={handleCancelOrder}
                            >
                                Anular orden
                            </Button>
                            <Button
                                variant="espresso"
                                size="lgg"
                                type="button"
                                onClick={handleEdit}
                            >
                                Actualizar orden
                            </Button>

                        </div>
                    )}

                </div>
            </div>

        </div>
    );
}

export default OrderDetails;