-- databases/migrations/0010_create_platillo.sql
-- platillos del menu, cada uno pertenece a una categoria

CREATE TABLE IF NOT EXISTS platillo (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL,
    nombre VARCHAR(60) NOT NULL,
    precio INTEGER NOT NULL CHECK (precio > 0),
    descripcion VARCHAR(300),
    imagen TEXT,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_platillo_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categoria(id),

    -- no se repite el nombre dentro de la misma categoria
    CONSTRAINT uq_platillo_categoria_nombre
    UNIQUE (categoria_id, nombre)
);
