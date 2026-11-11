-- databases/migrations/0021_insert_groups.sql
-- grupos de usuarios de Flora

INSERT INTO groups (group_name)
VALUES
    ('Administrador'),
    ('Mesero'),
    ('Cocinero')
ON CONFLICT (group_name) DO NOTHING;
