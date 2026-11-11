-- databases/migrations/0016_create_proveedor.sql

CREATE TABLE IF NOT EXISTS proveedor (
    id SERIAL PRIMARY KEY,
    tipo_documento VARCHAR(20) NOT NULL,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    numero_contacto VARCHAR(20) NOT NULL,
    correo_empresa VARCHAR(150) NOT NULL,
    direccion VARCHAR(120),
    categoria VARCHAR(40) NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    observaciones VARCHAR(300)
);
