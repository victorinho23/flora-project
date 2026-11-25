-- databases/migrations/0027_insert_mas_categorias.sql
-- mas categorias del menu para Flora (pizza y cafe)

INSERT INTO categoria (nombre)
VALUES
    ('Desayunos'),
    ('Pizzas'),
    ('Pastas'),
    ('Hamburguesas'),
    ('Sándwiches'),
    ('Ensaladas'),
    ('Sopas'),
    ('Jugos naturales'),
    ('Malteadas'),
    ('Adicionales')
ON CONFLICT (nombre) DO NOTHING;
