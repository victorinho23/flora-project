import { z } from "zod";

// Esquema de un producto de inventario, segun RFADMIN08
export const inventoryProductSchema = z.object({
    id: z.string().min(1, "El ID es obligatorio"),

    brand: z.string().min(1, "Debe seleccionar o agregar una marca"),

    name: z.string().min(1, "El nombre del producto es obligatorio"),

    barcode: z.string().min(1, "El codigo de barras es obligatorio"),

    custodian: z.string().min(1, "Debe seleccionar un cuentadante"),

    quantity: z.coerce
        .number({ message: "La cantidad debe ser un número" })
        .int("La cantidad debe ser un número entero")
        .min(1, "La cantidad debe ser mayor a 0"),

    minQuantity: z.coerce
        .number({ message: "La cantidad mínima debe ser un número" })
        .int("La cantidad mínima debe ser un número entero")
        .min(0, "La cantidad mínima no puede ser negativa"),

    unitValue: z.coerce
        .number({ message: "El valor unitario debe ser un número" })
        .positive("El valor unitario debe ser mayor a 0"),

    status: z.string().min(1, "Debe seleccionar un estado"),

    expirationDate: z.string().min(1, "La fecha de vencimiento es obligatoria"),

    description: z.string().min(1, "La descripción es obligatoria"),

    location: z.string().optional(),

    image: z.array(z.any()).optional(),
});
