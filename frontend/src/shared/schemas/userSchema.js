import {z} from "zod"
import { fileSchema } from "@/shared/schemas/fileSchema";



export const userSchema = z.object({
    userName: z
    .string()
    .min(3, "El nombre debe tener minimo 3 caracteres")
    .max(60, "El nombre es demasiado largo")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "El nombre solo puede contener letras y espacios"),

    userEmail: z
    .email()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Debe ingresar un email válido"),

    userEmailConfirm: z
    .email()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Debe ingresar un email válido"),

    userBusinessEmail: z
    .union([
        z.literal(""),
        z.email().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Debe ingresar un email válido"),
    ])
    .optional(),

    userBusinessEmailConfirm: z
    .union([z.literal(""), z.string()])
    .optional(),

    userPhone: z 
    .string()
    .regex(/^[0-9]{7,15}$/, "El telefono debe tener entre 7 y 15 digitos"),

    userPhoneSecondary: z
    .union([z.literal(""), z.string().regex(/^[0-9]{7,15}$/, "El telefono debe tener entre 7 y 15 digitos")])
    .optional(),

    userDocumentTypes: z.string().min(1,"Debe seleccionar un tipo de documento"),

    userType: z.string().min(1, "Debe seleccionar un tipo de usuario"),
    
    userDocumentNumber: z
    .string()
    .regex(/^[0-9]{1,15}$/, "El numero de documento debe ser numerico y tener maximo 15 digitos"),

    userPassword: z
    .string()
    .length(10, "La contraseña debe tener exactamente 10 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayuscula")
    .regex(/[a-z]/, "Debe contener al menos una minuscula")
    .regex(/[0-9]/, "Debe contener al menos un numero")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un caracter especial"),

    
    userAddress: z
    .string()
    .min(10, "La dirección debe tener minimo 10 caracteres")
    .max(100, "La dirección es demasiado larga"),


    userContractStartDate: z
    .string()
    .min(1, "Debe seleccionar la fecha de inicio de contrato")
    .refine((val) => !isNaN(Date.parse(val)), "Fecha de inicio inválida"),

    userContractEndDate: z
    .string()
    .optional(),

    isStaff: z.boolean(),
    isActive: z.boolean(),
    isSuperUser: z.boolean(),

    userImage: fileSchema.shape.files.optional()

})
.refine(
    (data) => data.userEmail === data.userEmailConfirm,
    {
        message: "Los correos electronicos no coinciden",
        path: ["userEmailConfirm"],
    }
)
.refine(
    (data) => !data.userBusinessEmail || !data.userBusinessEmailConfirm || data.userBusinessEmail === data.userBusinessEmailConfirm,
    {
        message: "Los correos empresariales no coinciden",
        path: ["userBusinessEmailConfirm"],
    }
)
.refine(
    (data) => !data.userBusinessEmail || data.userBusinessEmail !== data.userEmail,
    {
        message: "El correo empresarial no puede ser igual al correo personal",
        path: ["userBusinessEmail"],
    }
)
.refine(
    (data) => data.userType === "ADMIN" || !!data.userContractEndDate,
    {
        message: "Debe seleccionar la fecha de fin de contrato",
        path: ["userContractEndDate"],
    }
)
.refine(
    (data) =>
        data.userType === "ADMIN" ||
        !data.userContractEndDate ||
        new Date(data.userContractEndDate) > new Date(data.userContractStartDate),
    {
        message: "La fecha de fin de contrato debe ser posterior a la fecha de inicio",
        path: ["userContractEndDate"],
    }
);


// Estas las añadi adicionalmente para apartados en especifico
export const loginSchema = z.object({
    userEmail: z.email(),
    userPassword: z
    .string()
    .length(10, "La contraseña debe tener exactamente 10 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayuscula")
    .regex(/[a-z]/, "Debe contener al menos una minuscula")
    .regex(/[0-9]/, "Debe contener al menos un numero")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un caracter especial"),
    isActive: z.literal(true, { error: "Debes aceptar las condiciones de uso" }),
    // userDocumentTypes: z.string().min(1, "Debe seleccionar un tipo de documento"),
    // userDocumentNumber: z.string().min(5, "Numero de documento invalido"),
});

export const forgotPasswordSchema = z.object({
    email: z.email(),
});

export const verifyTokenSchema = z.object({
    token: z.string().min(1, "Debe ingresar el código"),
});

export const resetPasswordSchema = z.object({
    newPassword: z
    .string()
    .length(10, "La contraseña debe tener exactamente 10 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayuscula")
    .regex(/[a-z]/, "Debe contener al menos una minuscula")
    .regex(/[0-9]/, "Debe contener al menos un numero")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un caracter especial"),
    confirmPassword: z.string().min(8, "Confirma tu contraseña"),
})
.refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    }
);
