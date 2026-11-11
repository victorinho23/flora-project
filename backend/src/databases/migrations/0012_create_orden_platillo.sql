-- databases/migrations/0012_create_orden_platillo.sql
-- platillos de cada orden: una orden tiene muchos platillos y un platillo esta en muchas ordenes

CREATE TABLE IF NOT EXISTS orden_platillo (
    orden_id INTEGER NOT NULL,
    platillo_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    -- se guarda el precio del momento por si despues cambia en el menu
    precio_unitario INTEGER NOT NULL,

    PRIMARY KEY (orden_id, platillo_id),

    CONSTRAINT fk_orden_platillo_orden
        FOREIGN KEY (orden_id)
        REFERENCES orden(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_orden_platillo_platillo
        FOREIGN KEY (platillo_id)
        REFERENCES platillo(id)
);
