import { useParams, useLocation } from "react-router-dom";
import { OrderDetails } from "@/features/orders/components/OrderDetails.jsx";

// src/shared/layouts/OrderDetailsLayout.jsx
// Ordenes de prueba para cuando se entra directo por la URL
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

// Toma la orden que llega por navegacion o la busca por id
export default function OrderDetailsLayout() {
    const { id } = useParams();
    const location = useLocation();

    const order = location.state?.order || mockOrders.find((o) => o.id === id);

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
                <p className="border border-bd-s100 border-t-[5px] border-t-bd-t800 rounded-[1.25rem] bg-bg-w bg-linear-180 from-bg-w to-bg-p50 shadow-[0_26px_50px_-28px_color-mix(in_srgb,var(--color-bg-s950)_55%,transparent)] px-8 py-6 text-br-s950 font-semibold">No se encontro la orden solicitada.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            <OrderDetails order={order} />
        </div>
    );
}