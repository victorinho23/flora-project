-- databases/migrations/0040_update_usuario_is_staff_solo_admin.sql
-- is_staff = es administrador (tipo de usuario Administrador), nada mas.
-- el superusuario va aparte con is_superuser: puede ser superusuario sin ser staff y al reves
-- (antes el superusuario tambien quedaba como staff; esto lo deja limpio y se puede volver a correr)

UPDATE usuario u
SET is_staff = EXISTS (
    SELECT 1
    FROM user_groups ug
    INNER JOIN groups g ON g.group_id = ug.group_id
    WHERE ug.user_id = u.id
      AND g.group_name = 'Administrador'
);
