-- databases/migrations/0024_insert_user_groups.sql
-- el administrador inicial queda en el grupo Administrador

INSERT INTO user_groups (user_id, group_id)
SELECT u.id, g.group_id
FROM usuario u
CROSS JOIN groups g
WHERE u.correo_personal = 'vcortezcastrillon7a@gmail.com'
AND g.group_name = 'Administrador'
ON CONFLICT DO NOTHING;
