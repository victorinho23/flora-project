// backend/src/features/categories/categories.service.js

import { categoriesRepository } from "./categories.repository.js";

export const categoriesService = {
    // el select del frontend espera { id, label }
    async getAll() {
        const categories = await categoriesRepository.getAll();
        return categories.map((category) => ({ id: String(category.id), label: category.nombre }));
    },
};
