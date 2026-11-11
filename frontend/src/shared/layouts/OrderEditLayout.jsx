import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderById } from "@/features/orders/services/orderService";
import { OrderEditForm } from "@/features/orders/components/OrderEditForm.jsx";

// src/shared/layouts/OrderEditLayout.jsx
// Busca la orden en el backend por su id
// el backend manda el mesero como waiter y el formulario lo usa como waiterName
export default function OrderEditLayout() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        getOrderById(id)
            .then((data) => setOrder({ ...data, waiterName: data.waiter }))
            .catch(() => setNotFound(true));
    }, [id]);

    if (!order && !notFound) {
        return <p className="p-10 text-center text-br-s950 font-semibold">Cargando orden...</p>;
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
                <p className="border border-bd-s100 border-t-[5px] border-t-bd-t800 rounded-[1.25rem] bg-bg-w bg-linear-180 from-bg-w to-bg-p50 shadow-[0_26px_50px_-28px_color-mix(in_srgb,var(--color-bg-s950)_55%,transparent)] px-8 py-6 text-br-s950 font-semibold">No se encontro la orden solicitada.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            <OrderEditForm key={order.id} order={order} />
        </div>
    );
}