// backend/src/features/categories/categories.controller.js

import { categoriesService } from "./categories.service.js";

export const categoriesController = {
    async getAll(req, res) {
        try {
            const categories = await categoriesService.getAll();
            res.json(categories);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error obteniendo categorias" });
        }
    },
};
