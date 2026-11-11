-- databases/migrations/0014_create_producto.sql
-- productos del inventario, el id lo escribe el usuario (ej: 113)

CREATE TABLE IF NOT EXISTS producto (
    id VARCHAR(20) PRIMARY KEY,
    marca_id INTEGER NOT NULL,
    cuentadante_id INTEGER NOT NULL,
    codigo_barras VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    imagen TEXT,
    cantidad_minima INTEGER NOT NULL DEFAULT 0,
    valor_unitario INTEGER NOT NULL CHECK (valor_unitario > 0),
    descripcion VARCHAR(300),
    ubicacion VARCHAR(100),

    CONSTRAINT fk_producto_marca
        FOREIGN KEY (marca_id)
        REFERENCES marca(id),

    CONSTRAINT fk_producto_cuentadante
        FOREIGN KEY (cuentadante_id)
        REFERENCES usuario(id)
);
