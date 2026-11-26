// backend/src/features/access/access.repository.js
import { pool } from "../../config/db.js";

export const accessRepository = {
  // estado, superusuario y staff (administrador) en una sola consulta
  async getAccessUser(userId) {
    const result = await pool.query(
      `SELECT estado, is_superuser, is_staff FROM usuario WHERE id = $1;`,
      [userId],
    );
    return result.rows[0] ?? null;
  },

  // grupos a los que pertenece (para que nadie se cambie los permisos de su propio grupo)
  async getUserGroupIds(userId) {
    const result = await pool.query(`SELECT group_id FROM user_groups WHERE user_id = $1;`, [userId]);
    return result.rows.map((row) => row.group_id);
  },

  // nombre y codigo de unos permisos por su id
  async getPermissionsByIds(permissionIds) {
    const result = await pool.query(
      `SELECT permission_id, permission_name, permission_codename
       FROM permissions
       WHERE permission_id = ANY($1::INT[])
       ORDER BY permission_name;`,
      [permissionIds],
    );
    return result.rows;
  },

  // permisos que trae un grupo, buscado por su nombre (el tipo de usuario)
  async getGroupPermissionsByName(groupName) {
    const result = await pool.query(
      `SELECT p.permission_name, p.permission_codename
       FROM groups g
       INNER JOIN group_permissions gp ON gp.group_id = g.group_id
       INNER JOIN permissions p ON p.permission_id = gp.permission_id
       WHERE g.group_name = $1
       ORDER BY p.permission_name;`,
      [groupName],
    );
    return result.rows;
  },

  async isSuperUser(userId) {
    const query = `
      SELECT is_superuser
      FROM usuario
      WHERE id = $1;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0]?.is_superuser ?? false;
  },
  // permisos de verdad del usuario:
  // (los de sus grupos activos + los individuales que se le dieron) - los individuales que se le quitaron
  async getUserPermissions(userId) {
    const query = `
      (
        SELECT p.permission_codename
        FROM permissions p
        INNER JOIN user_permissions up
          ON up.permission_id = p.permission_id
        WHERE up.user_id = $1
          AND up.permitido = TRUE
        UNION
        SELECT p.permission_codename
        FROM permissions p
        INNER JOIN group_permissions gp
          ON gp.permission_id = p.permission_id
        INNER JOIN user_groups ug
          ON ug.group_id = gp.group_id
        INNER JOIN groups g
          ON g.group_id = ug.group_id
        WHERE ug.user_id = $1
          AND g.is_active = TRUE
      )
      EXCEPT
      SELECT p.permission_codename
      FROM permissions p
      INNER JOIN user_permissions up
        ON up.permission_id = p.permission_id
      WHERE up.user_id = $1
        AND up.permitido = FALSE;
    `;
    const result = await pool.query(query, [userId]);

    return result.rows.map((row) => row.permission_codename);
  },
};
