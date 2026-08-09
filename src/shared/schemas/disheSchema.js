import { z } from "zod";

export const dishSchema = z.object({
    dishName: z
        .string()
        .min(3, "El nombre debe tener minimo 3 caracteres")
        .max(60, "El nombre es demasiado largo"),

    dishPrice: z
        .string()
        .min(1, "Debe ingresar un precio")
        .regex(/^[1-9]\d*$/, "El precio debe ser un numero positivo"),

    dishCategory: z
        .string()
        .min(1, "Debe seleccionar una categoria"),

    dishDescription: z
        .string()
        .min(10, "La descripcion debe tener minimo 10 caracteres")
        .max(300, "La descripcion es demasiado larga"),

    dishImage: z.array(z.any()).optional(),
});

export const dishUpdateSchema = z.object({
    dishName: z
        .string()
        .min(3, "El nombre debe tener minimo 3 caracteres")
        .max(60, "El nombre es demasiado largo"),
 
    dishPrice: z
        .string()
        .min(1, "Debe ingresar un precio")
        .regex(/^[1-9]\d*$/, "El precio debe ser un numero positivo"),
 
    dishCategory: z
        .string()
        .min(1, "Debe seleccionar una categoria"),
 
    dishDescription: z
        .string()
        .max(300, "La descripcion es demasiado larga")
        .optional(),
 
    dishImage: z.array(z.any()).optional(),
});