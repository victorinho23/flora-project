-- databases/migrations/0030_create_mesa.sql
-- mesas del restaurante: se crean, editan y desactivan desde Configuracion
-- numero: el que ve el mesero; capacidad: cuantas personas; zona: donde queda (salon, terraza, barra)

CREATE TABLE IF NOT EXISTS mesa (
    id SERIAL PRIMARY KEY,
    numero INTEGER NOT NULL UNIQUE CHECK (numero > 0),
    capacidad INTEGER NOT NULL DEFAULT 4 CHECK (capacidad BETWEEN 1 AND 30),
    zona VARCHAR(40) NOT NULL DEFAULT 'Salón',
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- las 12 mesas que ya se usaban quedan creadas en el salon
INSERT INTO mesa (numero)
SELECT n FROM generate_series(1, 12) AS n
ON CONFLICT (numero) DO NOTHING;

-- modulo de configuracion y sus permisos
INSERT INTO content_type (app_label, model, display_name)
VALUES ('settings', 'mesa', 'Configuración')
ON CONFLICT (app_label, model) DO NOTHING;

INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES
    ('Listar mesas', 'mesas_listar', (SELECT content_type_id FROM content_type WHERE app_label = 'settings')),
    ('Crear mesas', 'mesas_crear', (SELECT content_type_id FROM content_type WHERE app_label = 'settings')),
    ('Actualizar mesas', 'mesas_actualizar', (SELECT content_type_id FROM content_type WHERE app_label = 'settings')),
    ('Habilitar/Deshabilitar mesas', 'mesas_habilitar', (SELECT content_type_id FROM content_type WHERE app_label = 'settings')),
    ('Eliminar mesas', 'mesas_eliminar', (SELECT content_type_id FROM content_type WHERE app_label = 'settings'))
ON CONFLICT (permission_codename) DO NOTHING;

-- el administrador tiene todos
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
CROSS JOIN permissions p
WHERE g.group_name = 'Administrador'
AND p.permission_codename LIKE 'mesas_%'
ON CONFLICT DO NOTHING;
