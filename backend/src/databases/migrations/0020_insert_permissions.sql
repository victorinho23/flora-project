-- databases/migrations/0020_insert_permissions.sql
-- permisos de cada modulo, el codename es el que revisa el backend

-- modulo usuarios
INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES
    ('Crear usuarios', 'usuarios_crear', (SELECT content_type_id FROM content_type WHERE app_label = 'users')),
    ('Visualizar usuarios', 'usuarios_visualizar', (SELECT content_type_id FROM content_type WHERE app_label = 'users')),
    ('Actualizar usuarios', 'usuarios_actualizar', (SELECT content_type_id FROM content_type WHERE app_label = 'users')),
    ('Habilitar/Deshabilitar usuarios', 'usuarios_habilitar', (SELECT content_type_id FROM content_type WHERE app_label = 'users')),
    ('Listar usuarios', 'usuarios_listar', (SELECT content_type_id FROM content_type WHERE app_label = 'users')),
    ('Generar reporte de usuarios', 'usuarios_reporte', (SELECT content_type_id FROM content_type WHERE app_label = 'users'))
ON CONFLICT (permission_codename) DO NOTHING;

-- modulo inventario
INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES
    ('Crear inventario', 'inventario_crear', (SELECT content_type_id FROM content_type WHERE app_label = 'inventory')),
    ('Visualizar inventario', 'inventario_visualizar', (SELECT content_type_id FROM content_type WHERE app_label = 'inventory')),
    ('Actualizar inventario', 'inventario_actualizar', (SELECT content_type_id FROM content_type WHERE app_label = 'inventory')),
    ('Cambiar estado del inventario', 'inventario_estado', (SELECT content_type_id FROM content_type WHERE app_label = 'inventory')),
    ('Listar inventario', 'inventario_listar', (SELECT content_type_id FROM content_type WHERE app_label = 'inventory')),
    ('Generar reporte de inventario', 'inventario_reporte', (SELECT content_type_id FROM content_type WHERE app_label = 'inventory'))
ON CONFLICT (permission_codename) DO NOTHING;

-- modulo proveedores
INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES
    ('Registrar proveedor', 'proveedores_registrar', (SELECT content_type_id FROM content_type WHERE app_label = 'suppliers')),
    ('Visualizar proveedor', 'proveedores_visualizar', (SELECT content_type_id FROM content_type WHERE app_label = 'suppliers')),
    ('Listar proveedores', 'proveedores_listar', (SELECT content_type_id FROM content_type WHERE app_label = 'suppliers')),
    ('Actualizar proveedor', 'proveedores_actualizar', (SELECT content_type_id FROM content_type WHERE app_label = 'suppliers')),
    ('Habilitar/Inhabilitar proveedor', 'proveedores_habilitar', (SELECT content_type_id FROM content_type WHERE app_label = 'suppliers')),
    ('Generar reporte de proveedores', 'proveedores_reporte', (SELECT content_type_id FROM content_type WHERE app_label = 'suppliers'))
ON CONFLICT (permission_codename) DO NOTHING;

-- modulo menu
INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES
    ('Agregar menu', 'menu_agregar', (SELECT content_type_id FROM content_type WHERE app_label = 'menu')),
    ('Visualizar menu', 'menu_visualizar', (SELECT content_type_id FROM content_type WHERE app_label = 'menu')),
    ('Listar menu', 'menu_listar', (SELECT content_type_id FROM content_type WHERE app_label = 'menu')),
    ('Actualizar menu', 'menu_actualizar', (SELECT content_type_id FROM content_type WHERE app_label = 'menu')),
    ('Habilitar/Deshabilitar menu', 'menu_habilitar', (SELECT content_type_id FROM content_type WHERE app_label = 'menu')),
    ('Generar reporte de menu', 'menu_reporte', (SELECT content_type_id FROM content_type WHERE app_label = 'menu'))
ON CONFLICT (permission_codename) DO NOTHING;

-- modulo ordenes
INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES
    ('Crear orden', 'ordenes_crear', (SELECT content_type_id FROM content_type WHERE app_label = 'orders')),
    ('Visualizar orden', 'ordenes_visualizar', (SELECT content_type_id FROM content_type WHERE app_label = 'orders')),
    ('Listar ordenes', 'ordenes_listar', (SELECT content_type_id FROM content_type WHERE app_label = 'orders')),
    ('Actualizar orden', 'ordenes_actualizar', (SELECT content_type_id FROM content_type WHERE app_label = 'orders')),
    ('Anular orden', 'ordenes_anular', (SELECT content_type_id FROM content_type WHERE app_label = 'orders')),
    ('Generar reporte de ordenes', 'ordenes_reporte', (SELECT content_type_id FROM content_type WHERE app_label = 'orders'))
ON CONFLICT (permission_codename) DO NOTHING;

-- modulo permisos
INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES
    ('Gestionar permisos', 'permisos_gestionar', (SELECT content_type_id FROM content_type WHERE app_label = 'access'))
ON CONFLICT (permission_codename) DO NOTHING;
