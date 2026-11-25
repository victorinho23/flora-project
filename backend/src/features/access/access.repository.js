// backend/src/features/access/access.repository.js
import { pool } from "../../config/db.js";

export const accessRepository = {
  // estado y superusuario en una sola consulta
  async getAccessUser(userId) {
    const result = await pool.query(
      `SELECT estado, is_superuser FROM usuario WHERE id = $1;`,
      [userId],
    );
    return result.rows[0] ?? null;
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
