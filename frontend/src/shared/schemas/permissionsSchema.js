import { z } from "zod";

// src/shared/schemas/permissionsSchema.js
// Reglas para guardar los permisos de un usuario o grupo
export const permissionsSchema = z
    .object({
        targetUser: z.string().optional(),
        targetGroup: z.string().optional(),
        permissions: z.record(z.string(), z.boolean()),
    })
    .refine(
        (data) => data.targetUser || data.targetGroup,
        {
            message: "Debe seleccionar un usuario o un grupo",
            path: ["targetUser"],
        }
    );