import { DishDetails } from "@/features/products";
import { pizzas } from "@/features/products/data/pizzas";
import { cafes } from "@/features/products/data/cafes";
import { malteadas } from "@/features/products/data/malteadas";
import { galletas } from "@/features/products/data/galletas";
import dishesBg from "@/assets/images/fondo-dish.png";


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

    // Se combinan todas las categorias, cada una con su prefijo, para evitar
    // ids duplicados entre productos de categorias distintas
    const allOtherProducts = [
        ...pizzas.slice(1).map((p) => ({ ...p, uniqueId: `pizza-${p.id}` })),
        ...cafes.map((p) => ({ ...p, uniqueId: `cafe-${p.id}` })),
        ...malteadas.map((p) => ({ ...p, uniqueId: `malteada-${p.id}` })),
        ...galletas.map((p) => ({ ...p, uniqueId: `galleta-${p.id}` })),
    ];

    // Se arma la grilla con todos los datos reales (nombre, precio, descripcion, imagen),
   
    const relatedDishes = allOtherProducts.map((product, index) => ({
        id: product.uniqueId,
        dishName: product.title,
        dishPrice: product.price,
        dishDescription: product.description,
        imageUrl: index === 3 || index === 6 ? null : product.image,
    }));

    return (
        <div className="min-h-screen w-full"
            style={{
                backgroundImage: `url(${dishesBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}>
            <DishDetails dish={dish} relatedDishes={relatedDishes} />
        </div>
    );
}