-- databases/migrations/0037_alter_orden_estados_mesa_ocupada.sql
-- mas estados para seguir la mesa en el mapa:
--   ACTIVA = en cocina (esperando el pedido), LISTA_PARA_ENTREGA = listo para llevar,
--   ENTREGADA = la mesa ya recibio el pedido, CUENTA_PEDIDA = pidio la cuenta,
--   PAGADA y CANCELADA = orden cerrada (la mesa queda libre)
-- y la mesa se puede marcar "ocupada" cuando se sientan los clientes, antes de pedir

ALTER TABLE orden DROP CONSTRAINT IF EXISTS ck_orden_estado;
ALTER TABLE orden ADD CONSTRAINT ck_orden_estado
    CHECK (estado IN ('ACTIVA', 'LISTA_PARA_ENTREGA', 'ENTREGADA', 'CUENTA_PEDIDA', 'PAGADA', 'CANCELADA'));

-- una mesa solo puede tener una orden abierta, ahora con los estados nuevos
DROP INDEX IF EXISTS ux_orden_mesa_abierta;
CREATE UNIQUE INDEX IF NOT EXISTS ux_orden_mesa_abierta
    ON orden (numero_mesa)
    WHERE estado IN ('ACTIVA', 'LISTA_PARA_ENTREGA', 'ENTREGADA', 'CUENTA_PEDIDA');

-- desde cuando estan sentados los clientes sin haber pedido (vacio = la mesa no esta marcada)
ALTER TABLE mesa ADD COLUMN IF NOT EXISTS ocupada_desde TIMESTAMP;
