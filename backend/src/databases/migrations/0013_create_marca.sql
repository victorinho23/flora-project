-- databases/migrations/0013_create_marca.sql

CREATE TABLE IF NOT EXISTS marca (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) UNIQUE NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);
