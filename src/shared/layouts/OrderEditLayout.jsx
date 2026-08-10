import { useParams, useLocation } from "react-router-dom";
import { OrderEditForm } from "@/features/orders/components/OrderEditForm.jsx";
import ordersBg from "@/assets/images/fondo-orders.png";

const mockOrders = [
    {
        id: "ORD-001",
        tableNumber: "4",
        waiterName: "Carlos Alzate",
        waiterId: "user-1",
        items: [
            { dishId: "pizza-1", dishName: "Pizza Margarita", price: "25000", image: null, quantity: 2 },
            { dishId: "cafe-1", dishName: "Cafe con miel", price: "12000", image: null, quantity: 1 },
        ],
        notes: "Sin cebolla en la pizza",
        status: "ACTIVA",
        createdAt: "2026-08-09T14:30:00",
    },
    {
        id: "ORD-002",
        tableNumber: "7",
        waiterName: "Saray Ospina",
        waiterId: "user-2",
        items: [
            { dishId: "malteada-1", dishName: "Malteada de Chocolate", price: "15000", image: null, quantity: 3 },
        ],
        notes: "",
        status: "PAGADA",
        createdAt: "2026-08-09T13:10:00",
    },
];

export default function OrderEditLayout() {
    const { id } = useParams();
    const location = useLocation();

    // Si la orden viaja por state (viniendo de OrderDetails), se usa esa;
    // si no, se busca en el mock (por ejemplo, si entraste directo por la URL)
    const order = location.state?.order || mockOrders.find((o) => o.id === id);

    if (!order) {
        return (
            <div className="min-h-screen bg-bg-s900 flex items-center justify-center text-bg-w">
                <p>No se encontro la orden solicitada.</p>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen w-full"
            style={{
                backgroundImage: `url(${ordersBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <OrderEditForm order={order} />
        </div>
    );
}