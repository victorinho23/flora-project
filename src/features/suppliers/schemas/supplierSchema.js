import { z } from "zod"

export const supplierSchema = z.object({
    companyName: z
        .string()
        .min(3, "El nombre de la empresa debe tener minimo 3 caracteres")
        .max(80, "El nombre de la empresa es demasiado largo"),

    nit: z
        .string()
        .min(5, "NIT invalido")
        .max(20, "NIT demasiado largo"),

    contactName: z
        .string()
        .min(3, "El nombre del contacto debe tener minimo 3 caracteres")
        .max(60, "El nombre del contacto es demasiado largo"),

    phone: z
        .string()
        .regex(/^[0-9]{10}$/, "El telefono debe tener 10 digitos"),

    email: z
        .email()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Debe ingresar un email válido"),

    address: z
        .string()
        .min(5, "La direccion es obligatoria")
        .max(120, "La direccion es demasiado larga"),

    category: z.string().min(1, "Debe seleccionar una categoria"),

    isActive: z.boolean(),
})
