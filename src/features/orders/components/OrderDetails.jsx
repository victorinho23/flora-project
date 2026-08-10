import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared";
import { useNavigate } from "react-router-dom";

const InfoField = ({ label, value }) => (
    <div className="w-full bg-bg-s800/70 border border-bd-w/15 rounded-lg px-4 py-3 backdrop-blur-sm">
        <p className="text-caption text-bg-w/60 mb-1">{label}</p>
        <p className="text-body text-bg-w font-medium">{value || "—"}</p>
    </div>
);

const STATUS_LABELS = {
    ACTIVA: "Activa",
    LISTA_PARA_ENTREGA: "Lista para entrega",
    CANCELADA: "Cancelada",
    PAGADA: "Pagada",
};

const STATUS_COLORS = {
    ACTIVA: "bg-green-600",
    LISTA_PARA_ENTREGA: "bg-blue-600",
    CANCELADA: "bg-red-600",
    PAGADA: "bg-gray-600",
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
        // Se manda la orden completa por state, para que OrderEditLayout no dependa
        // de encontrarla en el mock fijo (funciona con ordenes dinamicas tambien)
        navigate(`/orderEdit/${order.id}`, {
            state: { order: { ...order, status } },
        });
    };

    const handleCancelOrder = () => {
        const confirmed = window.confirm(
            "¿Seguro que deseas anular esta orden? Esta accion no se puede deshacer."
        );
        if (!confirmed) return;

        // Aqui luego va la llamada real al backend
        // await cancelOrder(order.id)

        setStatus("CANCELADA");
        alert("La orden ha sido anulada correctamente");
    };

    return (
        <div className="min-h-screen flex flex-col">

            <div className="w-full bg-bg-s700 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 bg-bg-s900/90 border border-bd-w/15">
                <div className="w-8" />
                <h1 className="text-title text-bg-w font-bold text-center">
                    Detalle de la orden
                </h1>
                <Button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="text-bg-w hover:text-bg-w/70 transition-colors"
                    aria-label="Volver"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>
            </div>

            <div className="flex-1 flex justify-center px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
                <div className="w-full max-w-4xl flex flex-col gap-6">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <InfoField label="ID de orden" value={order.id} />
                        <InfoField label="Mesa" value={order.tableNumber} />
                        <InfoField label="Mesero responsable" value={order.waiterName} />
                    </div>

                    <div
                        className={`
                            flex items-center gap-2 w-fit
                            px-5 py-3 rounded-lg font-semibold text-white
                            ${STATUS_COLORS[status]}
                        `}
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                        {STATUS_LABELS[status]}
                    </div>

                    <div className="bg-bg-s800/60 border border-bd-w/15 rounded-xl p-4 flex flex-col gap-3">
                        <p className="text-caption text-bg-w/60">Platillos</p>
                        {order.items.map((item) => (
                            <div
                                key={item.dishId}
                                className="flex items-center justify-between bg-bg-s900/50 rounded-lg p-3"
                            >
                                <div>
                                    <p className="text-bg-w font-semibold">{item.dishName}</p>
                                    <p className="text-bg-w/60 text-sm">
                                        Cantidad: {item.quantity} × ${Number(item.price).toLocaleString()}
                                    </p>
                                </div>
                                <p className="text-bg-w font-bold">
                                    ${(Number(item.price) * item.quantity).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between bg-bg-s800/60 border border-bd-w/15 rounded-lg px-4 py-3">
                        <span className="text-bg-w font-semibold">Total</span>
                        <span className="text-bg-w font-bold text-lg">
                            ${total.toLocaleString()}
                        </span>
                    </div>

                    {order.notes && (
                        <InfoField label="Observaciones" value={order.notes} />
                    )}

                    {canEdit && (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                variant="danger"
                                size="lgg"
                                type="button"
                                onClick={handleCancelOrder}
                            >
                                Anular orden
                            </Button>
                            <Button
                                variant="primary"
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