// backend/src/features/brands/brands.controller.js

import { brandsService } from "./brands.service.js";

export const brandsController = {
    async getAll(req, res) {
        try {
            res.json(await brandsService.getAll());
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error obteniendo marcas" });
        }
    },
};
