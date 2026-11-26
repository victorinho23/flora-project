-- databases/migrations/0038_alter_usuario_is_staff.sql
-- separa superusuario de administrador:
--   is_superuser = tiene todos los permisos y es el unico que crea o quita administradores y superusuarios
--   is_staff     = puede entrar a la gestion de permisos (superusuario y administradores);
--                  el backend lo deja igual al rol cada vez que se guarda el usuario

ALTER TABLE usuario ADD COLUMN IF NOT EXISTS is_staff BOOLEAN NOT NULL DEFAULT FALSE;

-- el superusuario y los que estan en Administrador quedan como staff, los demas no
-- (se puede volver a correr sin problema)
UPDATE usuario SET is_staff = FALSE;
UPDATE usuario
SET is_staff = TRUE
WHERE is_superuser = TRUE
   OR id IN (
        SELECT ug.user_id
        FROM user_groups ug
        INNER JOIN groups g ON g.group_id = ug.group_id
        WHERE g.group_name = 'Administrador'
   );
