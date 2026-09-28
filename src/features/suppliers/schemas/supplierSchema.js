import { z } from "zod"

export const supplierSchema = z.object({
    companyName: z
        .string()
        .min(3, "El nombre de la empresa debe tener minimo 3 caracteres")
        .max(80, "El nombre de la empresa es demasiado largo"),

    documentType: z.string().min(1, "Debe seleccionar un tipo de documento"),

    documentNumber: z
        .string()
        .regex(/^[0-9]{1,15}$/, "El numero de documento debe ser numerico y tener maximo 15 digitos"),

    products: z.array(z.string()).optional(),

    phone: z
        .string()
        .regex(/^[0-9]{7,15}$/, "El telefono debe tener entre 7 y 15 digitos"),

    email: z
        .email()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Debe ingresar un email válido"),

    address: z
        .string()
        .max(120, "La direccion es demasiado larga")
        .optional(),

    category: z.string().min(1, "Debe seleccionar una categoria"),

    observations: z
        .string()
        .max(300, "Las observaciones son demasiado largas")
        .optional(),

    isActive: z.boolean(),
})
