import { useParams } from "react-router-dom";
import { DishEditForm } from "@/features/products";
import { pizzas } from "@/features/products/data/pizzas";
import { cafes } from "@/features/products/data/cafes";
import { malteadas } from "@/features/products/data/malteadas";
import { galletas } from "@/features/products/data/galletas";
import { menu } from "@/features/users/data/menu";
import dishCategories from "@/data/select/dishCategories.json";

// src/shared/layouts/EditDishLayout.jsx
// Busca el platillo por su id unico y abre el formulario de edicion
// Categoria por defecto segun el tipo de producto
const CATEGORY_BY_TYPE = {
    pizza: "PLATOS_FUERTES",
    cafe: "CAFES",
    malteada: "BEBIDAS",
    galleta: "POSTRES",
};

// El id viene como tipo-numero, por ejemplo pizza-1 o menu-3
function findDishByUniqueId(id) {
    const [type, rawId] = id.split("-");
    const numericId = Number(rawId);

    if (type === "menu") {
        const item = menu.find((m) => m.id === numericId);
        if (!item) return null;
        return {
            id,
            menuId: item.id,
            dishName: item.name,
            dishPrice: item.price,
            dishCategory: dishCategories.find((c) => c.label === item.category)?.id ?? "",
            dishDescription: item.description,
            imageUrl: item.image ?? null,
            isEnabled: item.is_active,
        };
    }

    const sourceByType = {
        pizza: pizzas,
        cafe: cafes,
        malteada: malteadas,
        galleta: galletas,
    };

    const source = sourceByType[type] || [];
    const product = source.find((p) => p.id === numericId);

    if (!product) return null;

    return {
        id,
        dishName: product.title,
        dishPrice: product.price,
        dishCategory: CATEGORY_BY_TYPE[type] || "",
        dishDescription: product.description,
        imageUrl: product.image,
        isEnabled: true,
    };
}

// Si el platillo no existe muestra un aviso en vez del formulario
export default function EditDishLayout() {
    const { id } = useParams();
    const dish = findDishByUniqueId(id);

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