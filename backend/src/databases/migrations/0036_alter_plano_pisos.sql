-- databases/migrations/0036_alter_plano_pisos.sql
-- el mapa ahora puede tener varios pisos: cada fila de plano es un piso con su nombre
-- y cada mesa guarda en que piso quedo

-- antes solo podia existir el plano 1
ALTER TABLE plano DROP CONSTRAINT IF EXISTS plano_id_check;

-- el id pasa a ser autoincrementable para crear pisos nuevos
CREATE SEQUENCE IF NOT EXISTS plano_id_seq OWNED BY plano.id;
SELECT setval('plano_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM plano), 0), 1));
ALTER TABLE plano ALTER COLUMN id SET DEFAULT nextval('plano_id_seq');

ALTER TABLE plano ADD COLUMN IF NOT EXISTS nombre VARCHAR(40) NOT NULL DEFAULT 'Piso 1';
ALTER TABLE plano ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 1;

-- piso de cada mesa (vacio = no esta en ningun mapa)
ALTER TABLE mesa ADD COLUMN IF NOT EXISTS plano_id INTEGER REFERENCES plano(id) ON DELETE SET NULL;

-- las mesas que ya estaban ubicadas quedan en el primer piso
UPDATE mesa SET plano_id = (SELECT MIN(id) FROM plano) WHERE pos_x IS NOT NULL AND plano_id IS NULL;
