-- databases/migrations/0022_insert_group_permissions.sql

-- el administrador tiene todos los permisos
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
CROSS JOIN permissions p
WHERE g.group_name = 'Administrador'
ON CONFLICT DO NOTHING;

-- el mesero maneja las ordenes y consulta el menu
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
CROSS JOIN permissions p
WHERE g.group_name = 'Mesero'
AND p.permission_codename IN (
    'ordenes_crear',
    'ordenes_visualizar',
    'ordenes_listar',
    'ordenes_actualizar',
    'menu_visualizar',
    'menu_listar'
)
ON CONFLICT DO NOTHING;

-- el cocinero consulta ordenes, menu e inventario
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
CROSS JOIN permissions p
WHERE g.group_name = 'Cocinero'
AND p.permission_codename IN (
    'ordenes_visualizar',
    'ordenes_listar',
    'menu_visualizar',
    'menu_listar',
    'inventario_visualizar',
    'inventario_listar'
)
ON CONFLICT DO NOTHING;
