-- databases/migrations/0009_create_categoria.sql
-- categorias del menu (entradas, platos fuertes, postres...)

CREATE TABLE IF NOT EXISTS categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(60) UNIQUE NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);
