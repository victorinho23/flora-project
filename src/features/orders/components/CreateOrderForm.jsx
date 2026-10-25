import { useState } from "react";
import { Plus, Minus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Input, Textarea, Button, Navbar } from "@/shared";
import { useNavigate } from "react-router-dom";
import { orderSchema } from "../../../shared/schemas/orderSchema";
import { pizzas } from "@/features/products/data/pizzas";
import { cafes } from "@/features/products/data/cafes";
import { malteadas } from "@/features/products/data/malteadas";
import { galletas } from "@/features/products/data/galletas";
import { showSuccesAlert, showUnexpectedErrorAlert, showConfirmAlert } from "@/shared/services/alertService";
import { orders } from "@/features/users/data/orders";
import fotoFondo from "@/assets/images/fondo-orders.png";

const DISHES_PER_PAGE = 6;

const availableDishes = [
    ...pizzas.map((p) => ({ ...p, id: `pizza-${p.id}` })),
    ...cafes.map((p) => ({ ...p, id: `cafe-${p.id}` })),
    ...malteadas.map((p) => ({ ...p, id: `malteada-${p.id}` })),
    ...galletas.map((p) => ({ ...p, id: `galleta-${p.id}` })),
];

// El mesero se asigna automaticamente segun la sesion activa, no lo elige el usuario
const currentWaiter = { id: "user-1", name: "Juan Tejada" };

export default function CreateOrderForm() {
    const [dishPage, setDishPage] = useState(0);
    const dishPageCount = Math.ceil(availableDishes.length / DISHES_PER_PAGE);
    const visibleDishes = availableDishes.slice(dishPage * DISHES_PER_PAGE, (dishPage + 1) * DISHES_PER_PAGE);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [tableNumber, setTableNumber] = useState("");
    const [notes, setNotes] = useState("");
    const [orderItems, setOrderItems] = useState([]);

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
            items: orderItems.map((item) => ({
                dishId: item.dishId,
                dishName: item.dishName,
                quantity: item.quantity,
            })),
        };

        const result = orderSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        // Una mesa solo puede tener una orden activa: si ya la tiene se agregan los platillos a esa orden
        const activeOrder = orders.find((order) => String(order.tableNumber) === String(tableNumber).trim() && (order.status === "ACTIVA" || order.status === "LISTA_PARA_ENTREGA"));
        if (activeOrder) {
            const confirmation = await showConfirmAlert({
                title: `La mesa ${tableNumber} ya tiene una orden activa`,
                text: `Una mesa solo puede tener una orden activa. Los platillos se agregarán a la orden #${activeOrder.id}.`,
                confirmButtonText: "Agregar a la orden",
            });
            if (!confirmation.isConfirmed) return;
            const mergedOrder = {
                id: String(activeOrder.id),
                tableNumber: String(activeOrder.tableNumber),
                waiterName: activeOrder.waiter,
                waiterId: "",
                items: [
                    {
                        dishId: `orden-${activeOrder.id}`,
                        dishName: activeOrder.product,
                        price: String(activeOrder.quantity ? Math.round(activeOrder.total / activeOrder.quantity) : activeOrder.total),
                        image: null,
                        quantity: activeOrder.quantity,
                    },
                    ...orderItems,
                ],
                notes,
                status: activeOrder.status,
                customer: activeOrder.customer,
                createdAt: activeOrder.createdAt,
            };
            await showSuccesAlert({
                title: "Platillos agregados",
                text: `Se agregaron a la orden #${activeOrder.id} de la mesa ${activeOrder.tableNumber}`,
                timer: 3000,
            });
            navigate(`/orderView/${activeOrder.id}`, { state: { order: mergedOrder } });
            return;
        }

        try {
            

            // Mientras no hay backend, se genera un id temporal unico para esta orden
            const newOrderId = `ORD-${Date.now()}`;

            const newOrder = {
                id: newOrderId,
                tableNumber,
                waiterName: currentWaiter.name,
                waiterId: currentWaiter.id,
                items: orderItems,
                notes,
                status: "ACTIVA",
                createdAt: new Date().toISOString(),
            };

            await showSuccesAlert({
                title: "Orden creada",
                text: "La orden fue creada correctamente",
                timer: 3000,
            });

            navigate(`/orderView/${newOrderId}`, { state: { order: newOrder } });
        } catch (error) {
            console.log("Error: ", error.message);
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
                title="Crear orden"
                onBack={() => navigate("/home")}
                actions={
                    <>
                        <Button variant="crema" size="sm" type="button" onClick={() => navigate("/orderList")}>
                            Ver listado
                        </Button>
                    </>
                }
            />

            <div className="flex-1 px-4 sm:px-8 py-6 xl:py-4">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-8xl mx-auto grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)] gap-6 xl:h-[calc(100vh-7.5rem)] [&_.w-80]:w-full"
                >

                    <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] p-4 sm:p-5 bajo:sm:p-4 xl:self-start">
                        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                            <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                            Datos de la orden
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                            <Input
                                type="text"
                                name="tableNumber"
                                label="Numero de mesa"
                                placeholder="Escribe el numero de mesa"
                                htmlFor="table-number"
                                variant="latte"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                error={errors.tableNumber}
                            />

                            <div className="w-full">
                                <p className="text-sm font-semibold text-br-s900 mb-1">
                                    Mesero responsable
                                </p>
                                <div className="h-12 rounded-md border border-bd-s400 bg-bg-s50 flex items-center px-4 text-br-s950 font-medium">
                                    {currentWaiter.name}
                                </div>
                            </div>
                        </div>

                        <Textarea
                            name="notes"
                            label="Observaciones (opcional)"
                            placeholder="Alguna indicacion especial del cliente"
                            htmlFor="notes"
                            variant="latte"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] p-4 sm:p-5 bajo:sm:p-4 xl:min-h-0">
                        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                            <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                            Platillos disponibles
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 content-start auto-rows-max gap-4 xl:flex-1">
                                {visibleDishes.map((dish) => (
                                    <Button
                                        key={dish.id}
                                        type="button"
                                        onClick={() => addDish(dish)}
                                        className="flex flex-col rounded-xl overflow-hidden border border-bd-s100 bg-bg-w shadow-sm hover:border-bd-t900 hover:shadow-md transition-all"
                                    >
                                        <div className="w-full h-24 bg-bg-s50">
                                            <img
                                                src={dish.image}
                                                alt={dish.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="bg-bg-w text-br-s950 text-sm font-semibold px-2 py-2 text-center">
                                            {dish.title}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                            {dishPageCount > 1 && (
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => setDishPage(dishPage - 1)}
                                        disabled={dishPage === 0}
                                        aria-label="Página anterior"
                                        className="h-9 min-w-9 px-3 rounded-lg text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-t200 disabled:opacity-40 disabled:cursor-not-allowed border-bd-s300 bg-bg-w text-br-s950 hover:bg-bg-t50"
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>
                                    {Array.from({ length: dishPageCount }, (_, index) => (
                                        <Button
                                            key={index}
                                            type="button"
                                            onClick={() => setDishPage(index)}
                                            className={`h-9 min-w-9 px-3 rounded-lg text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-t200 disabled:opacity-40 disabled:cursor-not-allowed ${index === dishPage ? "border-bd-s950 bg-bg-s950 text-bg-w" : "border-bd-s300 bg-bg-w text-br-s950 hover:bg-bg-t50"}`}
                                        >
                                            {index + 1}
                                        </Button>
                                    ))}
                                    <Button
                                        type="button"
                                        onClick={() => setDishPage(dishPage + 1)}
                                        disabled={dishPage === dishPageCount - 1}
                                        aria-label="Página siguiente"
                                        className="h-9 min-w-9 px-3 rounded-lg text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-t200 disabled:opacity-40 disabled:cursor-not-allowed border-bd-s300 bg-bg-w text-br-s950 hover:bg-bg-t50"
                                    >
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            )}
                        {errors.items && (
                            <span className="inline-block rounded bg-red-50 px-2 py-0.5 text-red-900 font-medium text-sm">{errors.items}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 xl:min-h-0">

                        <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] p-4 sm:p-5 bajo:sm:p-4 flex-1 min-h-64 xl:min-h-0 overflow-y-auto">
                            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                                <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                                Resumen de la orden
                            </h2>
                            {orderItems.length === 0 ? (
                                <p className="text-br-s800 text-sm text-center py-10">
                                    Aun no has agregado platillos
                                </p>
                            ) : (
                                orderItems.map((item) => (
                                    <div
                                        key={item.dishId}
                                        className="flex items-center gap-3 bg-bg-w border border-bd-s100 rounded-lg p-2"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.dishName}
                                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-br-s950 text-sm font-semibold truncate">
                                                {item.dishName}
                                            </p>
                                            <p className="text-br-s800 text-sm">
                                                ${Number(item.price).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => changeQuantity(item.dishId, -1)}
                                                className="w-6 h-6 flex items-center justify-center rounded bg-bg-s100 text-br-s950 hover:bg-bg-t100"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="text-br-s950 text-sm font-semibold w-4 text-center">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                type="button"
                                                onClick={() => changeQuantity(item.dishId, 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded bg-bg-s100 text-br-s950 hover:bg-bg-t100"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => removeItem(item.dishId)}
                                            className="inline-block rounded bg-red-50 px-2 py-0.5 text-red-900 font-medium hover:text-red-900"
                                            aria-label="Quitar"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex items-center justify-between border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-lg px-4 py-3">
                            <span className="text-br-s950 font-semibold">Total</span>
                            <span className="text-br-t900 font-bold text-lg">
                                ${total.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                variant="crema"
                                size="lgg"
                                type="button"
                                onClick={() => navigate(-1)}
                            >
                                Cancelar
                            </Button>

                            <Button
                                variant="espresso"
                                size="lgg"
                                type="submit"
                            >
                                Crear orden
                            </Button>
                        </div>

                    </div>

                </form>
            </div>

        </div>
    );
}