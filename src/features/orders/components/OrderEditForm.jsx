import { useState } from "react";
import { ArrowLeft, Plus, Minus, X } from "lucide-react";
import { Input, Textarea, Select, Button } from "@/shared";
import { useNavigate } from "react-router-dom";
import { orderUpdateSchema } from "@/shared/schemas/orderSchema";
import { pizzas } from "@/features/products/data/pizzas";
import { cafes } from "@/features/products/data/cafes";
import { malteadas } from "@/features/products/data/malteadas";
import { galletas } from "@/features/products/data/galletas";

const availableDishes = [
    ...pizzas.map((p) => ({ ...p, id: `pizza-${p.id}` })),
    ...cafes.map((p) => ({ ...p, id: `cafe-${p.id}` })),
    ...malteadas.map((p) => ({ ...p, id: `malteada-${p.id}` })),
    ...galletas.map((p) => ({ ...p, id: `galleta-${p.id}` })),
];

const statusOptions = [
    { id: "ACTIVA", label: "Activa" },
    { id: "LISTA_PARA_ENTREGA", label: "Lista para entrega" },
    { id: "PAGADA", label: "Pagada" },
];

export function OrderEditForm({ order }) {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [tableNumber, setTableNumber] = useState(order.tableNumber);
    const [notes, setNotes] = useState(order.notes || "");
    const [status, setStatus] = useState(order.status);
    const [orderItems, setOrderItems] = useState(order.items);

    const isClosed = order.status === "PAGADA" || order.status === "CANCELADA";

    const addDish = (dish) => {
        setOrderItems((prev) => {
            const existing = prev.find((item) => item.dishId === dish.id);
            if (existing) {
                return prev.map((item) =>
                    item.dishId === dish.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [
                ...prev,
                {
                    dishId: dish.id,
                    dishName: dish.title,
                    price: dish.price,
                    image: dish.image,
                    quantity: 1,
                },
            ];
        });
    };

    const changeQuantity = (dishId, delta) => {
        setOrderItems((prev) =>
            prev
                .map((item) =>
                    item.dishId === dishId
                        ? { ...item, quantity: item.quantity + delta }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeItem = (dishId) => {
        setOrderItems((prev) => prev.filter((item) => item.dishId !== dishId));
    };

    const total = orderItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            tableNumber,
            notes,
            status,
            items: orderItems.map((item) => ({
                dishId: item.dishId,
                dishName: item.dishName,
                quantity: item.quantity,
            })),
        };

        const result = orderUpdateSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        try {
            // Aqui luego va la llamada real al backend
            // const response = await updateOrder(order.id, result.data)

            alert("Orden actualizada correctamente");
            navigate(`/orderView/${order.id}`, {
                state: { order: { ...order, tableNumber, notes, status, items: orderItems } },
            });
        } catch (error) {
            console.log("Error: ", error.message);
            alert(error.message);
        }
    };

    const handleCancelOrder = () => {
        const confirmed = window.confirm(
            "¿Seguro que deseas anular esta orden? Esta accion no se puede deshacer."
        );
        if (!confirmed) return;

        // Aqui luego va la llamada real al backend
        // await cancelOrder(order.id)

        alert("La orden ha sido anulada correctamente");
        navigate(`/orderView/${order.id}`, {
            state: { order: { ...order, status: "CANCELADA" } },
        });
    };

    if (isClosed) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-bg-w px-4 text-center">
                <p>Esta orden ya esta {order.status === "PAGADA" ? "pagada" : "cancelada"} y no puede modificarse.</p>
                <Button variant="secondary" size="lgg" type="button" onClick={() => navigate("/createOrderS")}>
                    Volver
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">

            <div className="w-full bg-bg-s700 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 bg-bg-s900/90 border border-bd-w/15">
                <div className="w-8" />
                <h1 className="text-title text-bg-w font-bold text-center">
                    Actualizar orden
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

            <div className="flex-1 px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-10"
                >

                    <div className="flex flex-col gap-4 sm:gap-6 lg:flex-[2] lg:min-w-0">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <Input
                                type="text"
                                name="tableNumber"
                                label="Numero de mesa"
                                htmlFor="table-number"
                                variant="cafe"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                error={errors.tableNumber}
                            />

                            <Select
                                label="Estado de la orden"
                                name="status"
                                value={status}
                                htmlFor="status"
                                options={statusOptions}
                                onChange={(e) => setStatus(e.target.value)}
                                error={errors.status}
                                variant="cafe"
                            />
                        </div>

                        <Textarea
                            name="notes"
                            label="Observaciones (opcional)"
                            htmlFor="notes"
                            variant="cafe"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />

                        <div>
                            <p className="text-caption text-secondary text-bg-w mb-2">
                                Agregar mas platillos
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-1">
                                {availableDishes.map((dish) => (
                                    <button
                                        key={dish.id}
                                        type="button"
                                        onClick={() => addDish(dish)}
                                        className="flex flex-col rounded-xl overflow-hidden border border-bd-w/15 hover:border-br-t500 transition-all"
                                    >
                                        <div className="w-full h-24 bg-bg-s900">
                                            <img
                                                src={dish.image}
                                                alt={dish.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="bg-bg-s800/80 text-bg-w text-xs font-semibold px-2 py-2 text-center">
                                            {dish.title}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {errors.items && (
                            <span className="text-red-400 text-sm">{errors.items}</span>
                        )}

                    </div>

                    <div className="flex flex-col gap-4 lg:flex-1 lg:min-w-0">

                        <p className="text-caption text-secondary text-bg-w">
                            Platillos de la orden
                        </p>

                        <div className="flex-1 bg-bg-s800/60 border border-bd-w/15 rounded-xl p-4 flex flex-col gap-3 min-h-64">
                            {orderItems.length === 0 ? (
                                <p className="text-bg-w/50 text-sm text-center py-10">
                                    No hay platillos en la orden
                                </p>
                            ) : (
                                orderItems.map((item) => (
                                    <div
                                        key={item.dishId}
                                        className="flex items-center gap-3 bg-bg-s900/50 rounded-lg p-2"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-bg-w text-sm font-semibold truncate">
                                                {item.dishName}
                                            </p>
                                            <p className="text-bg-w/60 text-xs">
                                                ${Number(item.price).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => changeQuantity(item.dishId, -1)}
                                                className="w-6 h-6 flex items-center justify-center rounded bg-bg-w/10 text-bg-w hover:bg-bg-w/20"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-bg-w text-sm w-4 text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => changeQuantity(item.dishId, 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded bg-bg-w/10 text-bg-w hover:bg-bg-w/20"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.dishId)}
                                            className="text-red-400 hover:text-red-300"
                                            aria-label="Quitar"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex items-center justify-between bg-bg-s800/60 border border-bd-w/15 rounded-lg px-4 py-3">
                            <span className="text-bg-w font-semibold">Total</span>
                            <span className="text-bg-w font-bold text-lg">
                                ${total.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="secondary"
                                size="lgg"
                                type="button"
                                onClick={() => navigate(-1)}
                            >
                                Cancelar
                            </Button>

                            <Button
                                variant="primary"
                                size="lgg"
                                type="submit"
                            >
                                Guardar cambios
                            </Button>
                        </div>

                        <Button
                            variant="danger"
                            size="lgg"
                            type="button"
                            onClick={handleCancelOrder}
                        >
                            Anular orden
                        </Button>

                    </div>

                </form>
            </div>

        </div>
    );
}

export default OrderEditForm;