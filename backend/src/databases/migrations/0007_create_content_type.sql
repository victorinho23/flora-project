-- databases/migrations/0007_create_content_type.sql
-- cada modulo de Flora queda registrado aqui para agrupar sus permisos

CREATE TABLE IF NOT EXISTS content_type (
    content_type_id SERIAL PRIMARY KEY,

    app_label VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL DEFAULT '',

    -- Evita valores duplicados en la columna.
    CONSTRAINT uq_content_type
    UNIQUE (app_label, model)
);
