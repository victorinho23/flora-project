import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DishEditForm } from "@/features/products";
import { getDishById } from "@/features/products/services/dishService";

// src/shared/layouts/EditDishLayout.jsx
// Busca el platillo en el backend por su id y abre el formulario de edicion
// El id viene como menu-numero, por ejemplo menu-3 (tambien sirve solo el numero)
const toDishId = (id = "") => id.split("-").pop();

// Si el platillo no existe muestra un aviso en vez del formulario
export default function EditDishLayout() {
    const { id } = useParams();
    const [dish, setDish] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        getDishById(toDishId(id))
            .then((item) =>
                setDish({
                    id,
                    menuId: item.id,
                    dishName: item.name,
                    dishPrice: String(item.price),
                    dishCategory: String(item.category_id),
                    dishDescription: item.description ?? "",
                    imageUrl: item.image ?? null,
                    isEnabled: item.is_active,
                })
            )
            .catch(() => setNotFound(true));
    }, [id]);

    if (!dish && !notFound) {
        return <p className="p-10 text-center text-br-s950 font-semibold">Cargando platillo...</p>;
    }

    if (!dish) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
                <p className="border border-bd-s100 border-t-[5px] border-t-bd-t800 rounded-[1.25rem] bg-bg-w bg-linear-180 from-bg-w to-bg-p50 shadow-[0_26px_50px_-28px_color-mix(in_srgb,var(--color-bg-s950)_55%,transparent)] px-8 py-6 text-br-s950 font-semibold">No se encontro el platillo solicitado.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            <DishEditForm dish={dish} />
        </div>
    );
}