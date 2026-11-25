-- databases/migrations/0028_create_index_mesa_ocupada.sql
-- una mesa solo puede tener UNA orden abierta (en cocina o lista para entregar)
-- la base lo garantiza aunque dos meseros guarden la misma mesa al mismo tiempo
-- cuando la orden se paga o se anula, la mesa queda libre otra vez
--
-- si esto falla es porque ya hay una mesa con dos ordenes abiertas:
-- se ven con la consulta de abajo y se paga o se anula una de ellas antes de correrla otra vez
--   SELECT numero_mesa, ARRAY_AGG(id) FROM orden
--   WHERE estado IN ('ACTIVA', 'LISTA_PARA_ENTREGA') GROUP BY numero_mesa HAVING COUNT(*) > 1;

CREATE UNIQUE INDEX IF NOT EXISTS ux_orden_mesa_abierta
    ON orden (numero_mesa)
    WHERE estado IN ('ACTIVA', 'LISTA_PARA_ENTREGA');
