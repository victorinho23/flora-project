// backend/src/features/users/user.repository.js
// Importamos el pool de conexion a PostgreSQL
import { pool } from "../../config/db.js";

// columnas con los nombres que ya usa el frontend en las tablas y modales
const USER_COLUMNS = `
    u.id,
    u.nombre AS username,
    u.correo_personal AS useremail,
    COALESCE(u.correo_empresarial, '') AS business_email,
    u.numero_contacto AS userphone,
    COALESCE(u.numero_contacto_2, '') AS userphone2,
    u.tipo_documento AS document_type,
    u.numero_documento AS document_number,
    u.direccion AS address,
    u.foto_perfil AS image,
    TO_CHAR(u.fecha_inicio_laboral, 'YYYY-MM-DD') AS start_date,
    COALESCE(TO_CHAR(u.fecha_fin_laboral, 'YYYY-MM-DD'), '') AS end_date,
    u.estado AS is_active,
    u.is_superuser,
    (
        SELECT g.group_name
        FROM user_groups ug
        INNER JOIN groups g ON g.group_id = ug.group_id
        WHERE ug.user_id = u.id
        ORDER BY g.group_id
        LIMIT 1
    ) AS group_name
`;

// Exportamos el repositorio de usuarios
// El repository encapsula todas las consultas SQL relacionadas con usuario
export const userRepository = {
  async usersAll() {
    const query = `
        SELECT ${USER_COLUMNS}
        FROM usuario u
        ORDER BY u.nombre
    `;

    const result = await pool.query(query);
    return result.rows;
  },

  // usuarios para el reporte, los filtros ya llegan limpios desde el service
  async report({ status, ids }) {
    // cada filtro que llegue agrega su condicion y su valor
    const conditions = [];
    const values = [];

    if (status !== undefined) {
      values.push(status);
      conditions.push(`u.estado = $${values.length}`);
    }

    if (ids.length) {
      values.push(ids);
      conditions.push(`u.id = ANY($${values.length}::INT[])`);
    }

    // si no hay filtros no se pone WHERE y salen todos
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
        SELECT ${USER_COLUMNS}
        FROM usuario u
        ${where}
        ORDER BY u.nombre
    `;

    const result = await pool.query(query, values);
    return result.rows;
  },

  async findById(id) {
    const query = `
        SELECT ${USER_COLUMNS}
        FROM usuario u
        WHERE u.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // revisa si el correo o el documento ya los tiene otro usuario
  async findDuplicates({ userEmail, userDocumentNumber, excludeId = 0 }) {
    const query = `
        SELECT
            BOOL_OR(LOWER(correo_personal) = LOWER($1) OR LOWER(correo_empresarial) = LOWER($1)) AS email,
            BOOL_OR(numero_documento = $2) AS document
        FROM usuario
        WHERE id <> $3
    `;

    const result = await pool.query(query, [userEmail, userDocumentNumber, excludeId]);
    return result.rows[0];
  },

  // Método encargado de crear un usuario y dejarlo en su grupo
  async create(userData, groupName) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Usar placeholders ($1, $2, ...) previene inyecciones SQL
      // RETURNING permite obtener datos generados por la base de datos (id)
      const query = `
          INSERT INTO usuario (
              tipo_documento,
              numero_documento,
              nombre,
              correo_personal,
              correo_empresarial,
              numero_contacto,
              numero_contacto_2,
              direccion,
              foto_perfil,
              contrasena,
              estado,
              fecha_inicio_laboral,
              fecha_fin_laboral
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id
      `;

      // El orden debe coincidir EXACTAMENTE con los placeholder del SQL
      const values = [
        userData.userDocumentTypes,
        userData.userDocumentNumber,
        userData.userName,
        userData.userEmail,
        userData.userBusinessEmail,
        userData.userPhone,
        userData.userPhoneSecondary,
        userData.userAddress,
        userData.userImage,
        userData.userPassword,
        userData.isActive,
        userData.userContractStartDate,
        userData.userContractEndDate,
      ];

      const result = await client.query(query, values);
      const userId = result.rows[0].id;

      await this.setGroup(client, userId, groupName);

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // actualiza los datos, la contraseña y la foto solo si llegan nuevas
  async update(id, userData, groupName) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const query = `
          UPDATE usuario
          SET tipo_documento = $1,
              numero_documento = $2,
              nombre = $3,
              correo_personal = $4,
              correo_empresarial = $5,
              numero_contacto = $6,
              numero_contacto_2 = $7,
              direccion = $8,
              foto_perfil = COALESCE($9, foto_perfil),
              contrasena = COALESCE($10, contrasena),
              estado = $11,
              fecha_inicio_laboral = $12,
              fecha_fin_laboral = $13
          WHERE id = $14
          RETURNING id
      `;

      const values = [
        userData.userDocumentTypes,
        userData.userDocumentNumber,
        userData.userName,
        userData.userEmail,
        userData.userBusinessEmail,
        userData.userPhone,
        userData.userPhoneSecondary,
        userData.userAddress,
        userData.userImage,
        userData.userPassword,
        userData.isActive,
        userData.userContractStartDate,
        userData.userContractEndDate,
        id,
      ];

      const result = await client.query(query, values);

      if (result.rows[0]) {
        await this.setGroup(client, id, groupName);
      }

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // deja al usuario solo en el grupo que se eligio
  async setGroup(client, userId, groupName) {
    await client.query(`DELETE FROM user_groups WHERE user_id = $1`, [userId]);

    await client.query(
      `
      INSERT INTO user_groups (user_id, group_id)
      SELECT $1, group_id
      FROM groups
      WHERE group_name = $2
      `,
      [userId, groupName],
    );
  },

  async updateStatus(id, isActive) {
    const query = `
        UPDATE usuario
        SET estado = $1,
            intentos_fallidos = 0,
            bloqueado_hasta = NULL
        WHERE id = $2
        RETURNING id
    `;

    const result = await pool.query(query, [isActive, id]);
    return result.rows[0];
  },

  // permisos que el usuario tiene asignados directamente (no los del grupo)
  async getPermissions(userId) {
    const query = `
        SELECT
            p.permission_id,
            p.permission_name,
            p.permission_codename
        FROM user_permissions up
        INNER JOIN permissions p
            ON p.permission_id = up.permission_id
        WHERE up.user_id = $1
        ORDER BY p.permission_name;
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  async updatePermissions(userId, permissionIds) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(`DELETE FROM user_permissions WHERE user_id = $1`, [userId]);

      for (const permissionId of permissionIds) {
        await client.query(
          `
          INSERT INTO user_permissions (user_id, permission_id)
          VALUES ($1, $2)
          `,
          [userId, permissionId],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
