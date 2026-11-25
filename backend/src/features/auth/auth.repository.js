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

    // ===== recuperar contraseña =====

    // datos para revisar el codigo de recuperacion
    async findRecovery(userEmail) {
        const query = `
            SELECT id, nombre, correo_personal, correo_empresarial, estado,
                   codigo_recuperacion, codigo_expira, intentos_codigo
            FROM usuario
            WHERE LOWER(correo_personal) = LOWER($1)
               OR LOWER(correo_empresarial) = LOWER($1)
            LIMIT 1;
        `;

        const result = await pool.query(query, [userEmail]);

        return result.rows[0];
    },

    // lo mismo pero buscando por id (para el ultimo paso)
    async findRecoveryById(userId) {
        const query = `
            SELECT id, codigo_recuperacion
            FROM usuario
            WHERE id = $1;
        `;

        const result = await pool.query(query, [userId]);

        return result.rows[0];
    },

    // guarda el codigo cifrado y hasta cuando sirve; los intentos empiezan en 0
    async saveRecoveryCode(userId, codeHash, minutes) {
        const query = `
            UPDATE usuario
            SET codigo_recuperacion = $2,
                codigo_expira = NOW() + ($3 || ' minutes')::INTERVAL,
                intentos_codigo = 0
            WHERE id = $1;
        `;

        await pool.query(query, [userId, codeHash, minutes]);
    },

    // suma un intento malo y devuelve cuantos lleva
    async addCodeAttempt(userId) {
        const query = `
            UPDATE usuario
            SET intentos_codigo = intentos_codigo + 1
            WHERE id = $1
            RETURNING intentos_codigo;
        `;

        const result = await pool.query(query, [userId]);

        return result.rows[0]?.intentos_codigo ?? 0;
    },

    // anula el codigo (cuando se usa, vence o se equivocan muchas veces)
    async clearRecovery(userId) {
        const query = `
            UPDATE usuario
            SET codigo_recuperacion = NULL,
                codigo_expira = NULL,
                intentos_codigo = 0
            WHERE id = $1;
        `;

        await pool.query(query, [userId]);
    },

    // nueva contraseña: tambien se quita el codigo y el bloqueo por intentos de login
    async updatePassword(userId, passwordHash) {
        const query = `
            UPDATE usuario
            SET contrasena = $2,
                codigo_recuperacion = NULL,
                codigo_expira = NULL,
                intentos_codigo = 0,
                intentos_fallidos = 0,
                bloqueado_hasta = NULL
            WHERE id = $1;
        `;

        await pool.query(query, [userId, passwordHash]);
    },
};
