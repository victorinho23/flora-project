-- databases/migrations/0038_alter_usuario_is_staff.sql
-- separa staff de superusuario:
--   is_superuser = tiene TODOS los permisos sin que se los den y puede cambiar cualquier cosa
--   is_staff     = personal administrativo: puede entrar a la gestion de permisos,
--                  pero solo con los permisos que de verdad tiene y sin pasarse de ellos

ALTER TABLE usuario ADD COLUMN IF NOT EXISTS is_staff BOOLEAN NOT NULL DEFAULT FALSE;

-- el superusuario siempre es staff, y los que ya estaban en Administrador
-- quedan como staff para que no pierdan lo que ya podian hacer
UPDATE usuario
SET is_staff = TRUE
WHERE is_superuser = TRUE
   OR id IN (
        SELECT ug.user_id
        FROM user_groups ug
        INNER JOIN groups g ON g.group_id = ug.group_id
        WHERE g.group_name = 'Administrador'
   );
