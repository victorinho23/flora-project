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

// ===== Busqueda de platillos para tomar ordenes =====
// quita tildes y mayusculas: "cafe" encuentra "Café"
const normalize = (text = "") => String(text).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Se arma una sola vez cuando llegan los platillos: cada uno con su nombre y texto ya normalizados
// asi al escribir no se vuelve a limpiar cada nombre, solo se compara
export function buildDishIndex(dishes) {
    return dishes.map((dish) => ({
        dish,
        name: normalize(dish.title),
        text: normalize(`${dish.title} ${dish.category ?? ""} ${dish.description ?? ""}`),
    }));
}

// "2 capuchino", "capuchino x2" o "capuchino*2" -> { quantity: 2, query: "capuchino" }
export function parseQuickAdd(input) {
    const value = input.trim();
    const before = value.match(/^(\d{1,2})\s*(?:x|\*)?\s+(.+)$/i);
    if (before) return { quantity: Number(before[1]), query: before[2] };
    const after = value.match(/^(.+?)\s*(?:x|\*)\s*(\d{1,2})$/i);
    if (after) return { quantity: Number(after[2]), query: after[1] };
    return { quantity: 1, query: value };
}

// Busca con todas las palabras (en cualquier orden) y ordena por lo que mas se parece:
// primero los que EMPIEZAN con lo escrito, despues los que lo tienen en el nombre,
// y al final los que coinciden solo por categoria o descripcion
export function searchDishes(index, query) {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (!words.length) return index.map((entry) => entry.dish);

    const results = [];
    for (const entry of index) {
        if (!words.every((word) => entry.text.includes(word))) continue;
        let score = 0;
        for (const word of words) {
            if (entry.name.startsWith(word)) score += 3;
            else if (entry.name.includes(` ${word}`)) score += 2;
            else if (entry.name.includes(word)) score += 1;
        }
        results.push({ dish: entry.dish, score });
    }
    return results.sort((a, b) => b.score - a.score || a.dish.title.localeCompare(b.dish.title, "es")).map((result) => result.dish);
}

// ===== Categorias del menu =====
// todas (activas e inactivas) con cuantos platillos tiene cada una
export async function getAllCategories() {
    return await request("/categories?all=1");
}

export async function createCategory(name) {
    return await request("/categories", { method: "POST", body: { name } });
}

export async function updateCategory(id, name) {
    return await request(`/categories/${id}`, { method: "PUT", body: { name } });
}

export async function updateCategoryStatus(id, isActive, reason) {
    return await request(`/categories/${id}/status`, { method: "PATCH", body: { isActive, reason } });
}
