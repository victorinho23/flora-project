import { useParams } from "react-router-dom";
import { DishEditForm } from "@/features/products";
import { pizzas } from "@/features/products/data/pizzas";
import { cafes } from "@/features/products/data/cafes";
import { malteadas } from "@/features/products/data/malteadas";
import { galletas } from "@/features/products/data/galletas";
import dishesBg from "@/assets/images/fondo-dish.png";

// Mapa de categorias reales (las mismas que devuelve getDishCategories)
// para preseleccionar una categoria coherente segun el tipo de producto
const CATEGORY_BY_TYPE = {
    pizza: "PLATOS_FUERTES",
    cafe: "CAFES",
    malteada: "BEBIDAS",
    galleta: "POSTRES",
};

// Busca el producto real segun el id compuesto (ej: "pizza-2") que llega por la URL
function findDishByUniqueId(id) {
    const [type, rawId] = id.split("-");
    const numericId = Number(rawId);

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

export default function EditDishLayout() {
    const { id } = useParams();
    const dish = findDishByUniqueId(id);

    if (!dish) {
        return (
            <div className="min-h-screen flex items-center justify-center text-bg-w">
                <p>No se encontro el platillo solicitado.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full"
            style={{
                backgroundImage: `url(${dishesBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}>
            <DishEditForm dish={dish} />
        </div>
    );
}