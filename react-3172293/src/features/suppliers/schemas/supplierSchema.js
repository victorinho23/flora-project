import { z } from "zod";

export const supplierSchema = z.object({
    supplierName: z.string().min(1, { message: "El nombre del proveedor es obligatorio" }),
    supplierNit: z.string().min(1, { message: "El NIT o RUT es obligatorio" }),
    supplierPhone: z.string().min(7, { message: "El teléfono debe tener al menos 7 dígitos" }),
    supplierEmail: z.string().email({ message: "Introduce un correo electrónico válido" }),
    supplierAddress: z.string().min(1, { message: "La dirección es obligatoria" }),
    contactName: z.string().min(1, { message: "El nombre del contacto es obligatorio" }),
    isActive: z.boolean().default(true),
});