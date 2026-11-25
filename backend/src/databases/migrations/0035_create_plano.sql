-- databases/migrations/0035_create_plano.sql
-- mapa del restaurante que dibuja el administrador en Configuracion
-- es una cuadricula: cada celda pintada guarda que es (pared, cocina, barra, baños...)
-- y cada mesa guarda en que celda quedo, asi el mesero ve a donde tiene que ir

CREATE TABLE IF NOT EXISTS plano (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    columnas INTEGER NOT NULL DEFAULT 20 CHECK (columnas BETWEEN 8 AND 30),
    filas INTEGER NOT NULL DEFAULT 12 CHECK (filas BETWEEN 6 AND 20),
    celdas JSONB NOT NULL DEFAULT '{}'::jsonb,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- solo hay un mapa: se crea vacio
INSERT INTO plano (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- celda donde quedo cada mesa (vacio = todavia no esta en el mapa)
ALTER TABLE mesa ADD COLUMN IF NOT EXISTS pos_x INTEGER;
ALTER TABLE mesa ADD COLUMN IF NOT EXISTS pos_y INTEGER;
