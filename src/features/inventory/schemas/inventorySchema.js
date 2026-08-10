import { z } from "zod";

// Esquema del encabezado de la hoja de inventario
// Corresponde al estado `headerData` en InventoryRegisterForm
export const inventoryHeaderSchema = z.object({
    establishment: z.string().min(1, "El establecimiento es obligatorio"),
    date: z.string().min(1, "La fecha es obligatoria"),
    departamento: z.string().min(1, "El departamento es obligatorio"),
    employee: z.string().min(1, "El nombre del empleado es obligatorio"),
});

// Esquema de cada producto agregado a la hoja de inventario
// Corresponde al estado `productForm` en InventoryRegisterForm
export const inventoryProductSchema = z.object({
    name: z.string().min(1, "El nombre del producto es obligatorio"),
    amount: z.coerce
        .number({ message: "La cantidad debe ser un número" })
        .int("La cantidad debe ser un número entero")
        .min(10, "La cantidad mínima es 10 unidades"),
});
