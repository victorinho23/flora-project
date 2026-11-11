import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { DishDetails } from "@/features/products";
import { getDishes } from "@/features/products/services/dishService";

// pasa un platillo del backend a la forma que usa la vista de detalle
const toDetail = (item) => ({
    id: `menu-${item.id}`,
    dishName: item.name,
    dishPrice: item.price,
    dishCategory: String(item.category_id),
    dishCategoryLabel: item.category,
    categoryDisabled: false,
    dishDescription: item.description,
    isEnabled: item.is_active,
    imageUrl: item.image,
});

// Layout que arma los datos del platillo y su lista relacionada para la vista de detalle
// el platillo principal es el que se acaba de crear o editar, si no hay uno se muestra el primero
export default function DishDetailsLayout() {

    const selectedId = useLocation().state?.id;
    const [dishes, setDishes] = useState(null);

    useEffect(() => {
        getDishes().then(setDishes).catch(() => setDishes([]));
    }, []);

    if (!dishes) {
        return <p className="p-10 text-center text-br-s950 font-semibold">Cargando platillos...</p>;
    }

    if (!dishes.length) {
        return <p className="p-10 text-center text-br-s950 font-semibold">Todavía no hay platillos registrados en el menú.</p>;
    }

    const main = dishes.find((item) => item.id === Number(selectedId)) ?? dishes[0];

    const dish = toDetail(main);

    const relatedDishes = dishes.filter((item) => item.id !== main.id).map(toDetail);

    return (
        <div className="min-h-screen w-full bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            <DishDetails dish={dish} relatedDishes={relatedDishes} />
        </div>
    );
}
