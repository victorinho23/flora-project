-- databases/migrations/0025_insert_categoria.sql
-- categorias del menu

INSERT INTO categoria (nombre)
VALUES
    ('Entradas'),
    ('Platos fuertes'),
    ('Postres'),
    ('Bebidas'),
    ('Cafés')
ON CONFLICT (nombre) DO NOTHING;
