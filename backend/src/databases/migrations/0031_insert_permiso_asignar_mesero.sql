-- databases/migrations/0031_insert_permiso_asignar_mesero.sql
-- la orden queda a nombre del mesero que inicio sesion;
-- solo quien tenga este permiso (el administrador) puede pasarla a otro mesero

INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES ('Cambiar el mesero de una orden', 'ordenes_asignar_mesero', (SELECT content_type_id FROM content_type WHERE app_label = 'orders'))
ON CONFLICT (permission_codename) DO NOTHING;

INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
CROSS JOIN permissions p
WHERE g.group_name = 'Administrador'
AND p.permission_codename = 'ordenes_asignar_mesero'
ON CONFLICT DO NOTHING;
