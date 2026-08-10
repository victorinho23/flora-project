import {z} from "zod"
import { fileSchema } from "@/shared/schemas/fileSchema";



export const userSchema = z.object({
    userName: z
    .string()
    .min(3, "El nombre debe tener minimo 3 caracteres")
    .max(60, "El nombre es demasiado largo"),

    userEmail: z
    .email()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Debe ingresar un email válido"),

    userEmailConfirm: z
    .email()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Debe ingresar un email válido"),

    userBusinessEmail: z
    .email()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Debe ingresar un email válido"),

    userPhone: z 
    .string()
    .regex(/^[0-9]{10}$/, "El telefono debe tener 10 digitos"),

    userDocumentTypes: z.string().min(1,"Debe seleccionar un tipo de documento"),

    userType: z.string().min(1, "Debe seleccionar un tipo de usuario"),
    
    userDocumentNumber: z
    .string()
    .min(5, "Numero de documento invalido")
    .max(20, "Numero de docuemnto demasiado largo"),

    userPassword: z
    .string()
    .min(8, "Contraseña debe tener minimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayuscula")
    .regex(/[a-z]/, "Debe contener al menos una minuscula")
    .regex(/[0-9]/, "Debe contener al menos un numero")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un caracter especial"),

    
    userAddress: z
    .string()
    .min(5, "La dirección debe tener minimo 5 caracteres")
    .max(120, "La dirección es demasiado larga"),


    userContractStartDate: z
    .string()
    .min(1, "Debe seleccionar la fecha de inicio de contrato")
    .refine((val) => !isNaN(Date.parse(val)), "Fecha de inicio inválida"),

    userContractEndDate: z
    .string()
    .min(1, "Debe seleccionar la fecha de fin de contrato")
    .refine((val) => !isNaN(Date.parse(val)), "Fecha de fin inválida"),

    isStaff: z.boolean(),
    isActive: z.boolean(),
    isSuperUser: z.boolean(),

    userImage: fileSchema.shape.files.optional()

})
.refine(
    (data) => new Date(data.userContractEndDate) > new Date(data.userContractStartDate),
    {
        message: "La fecha de fin de contrato debe ser posterior a la fecha de inicio",
        path: ["userContractEndDate"],
    }
);


export const loginSchema = z.object({
    userEmail: z.email(),
    userPassword: z.string().min(8, "Contraseña debe tener minimo 8 caracteres"),
    userDocumentTypes: z.string().min(1, "Debe seleccionar un tipo de documento"),
    userDocumentNumber: z.string().min(5, "Numero de documento invalido"),
});

export const forgotPasswordSchema = z.object({
    email: z.email(),
});

export const verifyTokenSchema = z.object({
    token: z.string().min(1, "Debe ingresar el código"),
});

export const resetPasswordSchema = z.object({
    newPassword: z.string().min(8, "Contraseña debe tener minimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirma tu contraseña"),
});