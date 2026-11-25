-- databases/migrations/0026_create_index_orden_mesa.sql
-- indice para encontrar rapido la orden abierta de una mesa
-- sin el, postgres revisa todas las ordenes; con el va directo a las de esa mesa y estado

CREATE INDEX IF NOT EXISTS ix_orden_mesa_estado
    ON orden (numero_mesa, estado);
