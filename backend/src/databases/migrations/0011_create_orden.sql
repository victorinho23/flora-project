-- databases/migrations/0011_create_orden.sql
-- ordenes de las mesas, el mesero es un usuario

CREATE TABLE IF NOT EXISTS orden (
    id SERIAL PRIMARY KEY,
    mesero_id INTEGER NOT NULL,
    numero_mesa INTEGER NOT NULL CHECK (numero_mesa > 0),
    observaciones VARCHAR(300),
    estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVA',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_orden_mesero
        FOREIGN KEY (mesero_id)
        REFERENCES usuario(id),

    CONSTRAINT ck_orden_estado
    CHECK (estado IN ('ACTIVA', 'LISTA_PARA_ENTREGA', 'PAGADA', 'CANCELADA'))
);
