import { z } from "zod";

export const orderSchema = z.object({
    tableNumber: z
        .string()
        .min(1, "Debe ingresar el numero de mesa")
        .regex(/^[1-9]\d*$/, "El numero de mesa debe ser un numero valido"),

    items: z
        .array(
            z.object({
                dishId: z.string(),
                dishName: z.string(),
                quantity: z.number().min(1),
            })
        )
        .min(1, "Debe agregar al menos un platillo a la orden"),

    notes: z.string().optional(),
});


export const orderUpdateSchema = z.object({
    tableNumber: z
        .string()
        .min(1, "Debe ingresar el numero de mesa")
        .regex(/^[1-9]\d*$/, "El numero de mesa debe ser un numero valido"),

    items: z
        .array(
            z.object({
                dishId: z.string(),
                dishName: z.string(),
                quantity: z.number().min(1),
            })
        )
        .min(1, "La orden debe tener al menos un platillo"),

    notes: z.string().optional(),

    status: z.enum(["ACTIVA", "LISTA_PARA_ENTREGA", "CANCELADA", "PAGADA"]),
});