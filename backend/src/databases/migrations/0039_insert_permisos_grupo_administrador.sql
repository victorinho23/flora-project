-- databases/migrations/0039_insert_permisos_grupo_administrador.sql
-- el administrador ahora toma sus permisos del grupo Administrador (y el superusuario se los puede quitar),
-- asi que el grupo arranca con TODOS los permisos que hay para que ningun admin pierda nada
-- (se puede volver a correr sin problema: solo agrega los que falten)
-- ojo: si mas adelante se crea un permiso nuevo, hay que agregarlo tambien a este grupo

INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
CROSS JOIN permissions p
WHERE g.group_name = 'Administrador'
  AND NOT EXISTS (
        SELECT 1
        FROM group_permissions gp
        WHERE gp.group_id = g.group_id
          AND gp.permission_id = p.permission_id
  );
