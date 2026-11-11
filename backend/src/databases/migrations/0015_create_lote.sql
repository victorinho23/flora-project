-- databases/migrations/0015_create_lote.sql
-- un producto tiene muchos lotes, cada lote con su cantidad, vencimiento y estado

CREATE TABLE IF NOT EXISTS lote (
    id SERIAL PRIMARY KEY,
    producto_id VARCHAR(20) NOT NULL,
    numero_lote INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad >= 0),
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Disponible',

    CONSTRAINT fk_lote_producto
        FOREIGN KEY (producto_id)
        REFERENCES producto(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_lote_producto_numero
    UNIQUE (producto_id, numero_lote),

    CONSTRAINT ck_lote_estado
    CHECK (estado IN ('Disponible', 'Vencido', 'Avería', 'Agotado'))
);
