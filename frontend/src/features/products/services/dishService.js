// src/features/products/services/dishService.js
// Funciones que consumen la API del menu (platillos)

import { request, toFormData } from "@/features/config";
import imagenPorDefecto from "@/assets/images/menu.png";

const DISHES_URL = "/dishes";

// trae todos los platillos del menu
export async function getDishes() {
    return await request(DISHES_URL);
}

// trae los platillos del reporte ya filtrados por el backend
// params es un objeto con los filtros, ej: { status: "true", ids: "1,2" }
export async function getDishesReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`${DISHES_URL}/report${query ? `?${query}` : ""}`);
}

export async function getDishById(id) {
    return await request(`${DISHES_URL}/${id}`);
}

// crea el platillo, va con FormData porque lleva la imagen
export async function createDish(dishData) {
    return await request(DISHES_URL, {
        method: "POST",
        body: toFormData(dishData, "dishImage"),
        isForm: true,
    });
}

export async function updateDish(id, dishData) {
    return await request(`${DISHES_URL}/${id}`, {
        method: "PUT",
        body: toFormData(dishData, "dishImage"),
        isForm: true,
    });
}

// habilita o inhabilita, el backend no deja inhabilitar si esta en una orden en proceso
export async function updateDishStatus(id, isActive, reason) {
    return await request(`${DISHES_URL}/${id}/status`, {
        method: "PATCH",
        body: { isActive, reason },
    });
}

// los platillos con la forma que usan los slider y las ordenes (title, price, image)
export async function getActiveDishCards() {
    const dishes = await getDishes();
    return dishes
        .filter((dish) => dish.is_active)
        .map((dish) => ({
            id: String(dish.id),
            title: dish.name,
            price: dish.price,
            description: dish.description,
            // si el platillo no tiene foto se muestra una imagen general del menu
            image: dish.image ?? imagenPorDefecto,
            category: dish.category,
        }));
}
