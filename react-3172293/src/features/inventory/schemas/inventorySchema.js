import { z } from "zod";

export const inventorySchema = z.object({
    productName: z.string().min(1, { message: "El nombre del producto es obligatorio" }),
    productSku: z.string().min(1, { message: "El SKU o código de barra es obligatorio" }),
    productCategory: z.string().min(1, { message: "Debes seleccionar una categoría" }),
    productSupplier: z.string().min(1, { message: "Debes asignar un proveedor a este producto" }),
    buyingPrice: z.coerce.number().positive({ message: "El precio de compra debe ser mayor a 0" }),
    sellingPrice: z.coerce.number().positive({ message: "El precio de venta debe ser mayor a 0" }),
    currentStock: z.coerce.number().int().nonnegative({ message: "El stock no puede ser negativo" }),
    minStockAlert: z.coerce.number().int().nonnegative({ message: "El stock mínimo no puede ser negativo" }),
    isAvailable: z.boolean().default(true),
});