-- databases/migrations/0041_alter_mesa_rotacion.sql
-- giro de la mesa en el mapa (vista realista): 0 = acostada a lo ancho, 90 = parada a lo largo
-- (si despues no se usa la vista realista esta columna no molesta, todas quedan en 0)

ALTER TABLE mesa ADD COLUMN IF NOT EXISTS rotacion SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE mesa DROP CONSTRAINT IF EXISTS ck_mesa_rotacion;
ALTER TABLE mesa ADD CONSTRAINT ck_mesa_rotacion CHECK (rotacion IN (0, 90));
