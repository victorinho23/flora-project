import { DishDetails } from "@/features/products";
import { pizzas } from "@/features/products/data/pizzas";
import { cafes } from "@/features/products/data/cafes";
import { malteadas } from "@/features/products/data/malteadas";
import { galletas } from "@/features/products/data/galletas";


// Layout que arma los datos del platillo y su lista relacionada para la vista de detalle
export default function DishDetailsLayout() {

    const mainPizza = pizzas[0];

    const dish = {
        id: `pizza-${mainPizza.id}`,
        dishName: mainPizza.title,
        dishPrice: mainPizza.price,
        dishCategory: "pizzas",
        dishCategoryLabel: "Pizzas",
        categoryDisabled: false,
        dishDescription: mainPizza.description,
        isEnabled: true,
        imageUrl: mainPizza.image,
    };

    const allOtherProducts = [
        ...pizzas.slice(1).map((p) => ({ ...p, uniqueId: `pizza-${p.id}`, categoryLabel: "Pizzas" })),
        ...cafes.map((p) => ({ ...p, uniqueId: `cafe-${p.id}`, categoryLabel: "Cafés" })),
        ...malteadas.map((p) => ({ ...p, uniqueId: `malteada-${p.id}`, categoryLabel: "Malteadas" })),
        ...galletas.map((p) => ({ ...p, uniqueId: `galleta-${p.id}`, categoryLabel: "Galletas" })),
    ];

   
    const relatedDishes = allOtherProducts.map((product) => ({
        id: product.uniqueId,
        dishName: product.title,
        dishPrice: product.price,
        dishDescription: product.description,
        dishCategoryLabel: product.categoryLabel,
        imageUrl: product.image,
    }));

    return (
        <div className="min-h-screen w-full bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            <DishDetails dish={dish} relatedDishes={relatedDishes} />
        </div>
    );
}