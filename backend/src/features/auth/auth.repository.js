// backend/src/features/auth/auth.repository.js

import { pool } from "../../config/db.js";

export const authRepository = {
    // se puede entrar con el correo personal o con el empresarial
    async findByEmail(userEmail) {
        const query = `
            SELECT id, nombre, correo_personal, contrasena, estado, is_superuser,
                   intentos_fallidos, bloqueado_hasta
            FROM usuario
            WHERE LOWER(correo_personal) = LOWER($1)
               OR LOWER(correo_empresarial) = LOWER($1)
            LIMIT 1;
        `;

        const result = await pool.query(query, [userEmail]);

        return result.rows[0];
    },

    // suma un intento fallido y si llega al limite bloquea la cuenta
    async registerFailedAttempt(userId, maxAttempts, lockMinutes) {
        const query = `
            UPDATE usuario
            SET intentos_fallidos = CASE WHEN intentos_fallidos + 1 >= $2 THEN 0 ELSE intentos_fallidos + 1 END,
                bloqueado_hasta = CASE WHEN intentos_fallidos + 1 >= $2 THEN NOW() + ($3 || ' minutes')::INTERVAL ELSE bloqueado_hasta END
            WHERE id = $1
            RETURNING intentos_fallidos, bloqueado_hasta;
        `;

        const result = await pool.query(query, [userId, maxAttempts, lockMinutes]);

        return result.rows[0];
    },

    // si entra bien se limpian los intentos y se guarda la actividad
    async registerSuccess(userId) {
        const query = `
            UPDATE usuario
            SET intentos_fallidos = 0,
                bloqueado_hasta = NULL,
                ultima_actividad = NOW()
            WHERE id = $1;
        `;

        await pool.query(query, [userId]);
    },

    // grupo del usuario para mandarlo al frontend
    async getUserGroup(userId) {
        const query = `
            SELECT g.group_name
            FROM user_groups ug
            INNER JOIN groups g
                ON g.group_id = ug.group_id
            WHERE ug.user_id = $1
            ORDER BY g.group_id
            LIMIT 1;
        `;

        const result = await pool.query(query, [userId]);

        return result.rows[0]?.group_name ?? null;
    },
};
