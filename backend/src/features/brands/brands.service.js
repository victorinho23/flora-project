// backend/src/features/brands/brands.service.js

import { brandsRepository } from "./brands.repository.js";

export const brandsService = {
    async getAll() {
        return await brandsRepository.getAll();
    },
};
