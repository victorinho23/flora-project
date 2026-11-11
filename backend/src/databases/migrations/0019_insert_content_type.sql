-- databases/migrations/0019_insert_content_type.sql
-- registramos los modulos de Flora

INSERT INTO content_type (app_label, model, display_name)
VALUES
    ('users', 'usuario', 'Usuarios'),
    ('inventory', 'producto', 'Inventario'),
    ('suppliers', 'proveedor', 'Proveedores'),
    ('menu', 'platillo', 'Menú'),
    ('orders', 'orden', 'Órdenes'),
    ('access', 'permission', 'Permisos')
ON CONFLICT (app_label, model) DO NOTHING;
