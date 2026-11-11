-- databases/migrations/0018_create_registro_cambios.sql
-- queda guardado quien cambio que, cuando y por que

CREATE TABLE IF NOT EXISTS registro_cambios (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    tabla VARCHAR(50) NOT NULL,
    registro_id VARCHAR(50) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    motivo VARCHAR(300),
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_registro_cambios_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
);
