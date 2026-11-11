-- databases/migrations/0001_create_usuario_table.sql
-- tabla de usuarios de Flora con los campos del documento de requerimientos

CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    tipo_documento VARCHAR(20) NOT NULL,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    correo_personal VARCHAR(150) UNIQUE NOT NULL,
    correo_empresarial VARCHAR(150),
    numero_contacto VARCHAR(20) NOT NULL,
    numero_contacto_2 VARCHAR(20),
    direccion VARCHAR(150) NOT NULL,
    foto_perfil TEXT,
    contrasena TEXT NOT NULL,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_inicio_laboral DATE NOT NULL,
    fecha_fin_laboral DATE,
    intentos_fallidos INTEGER NOT NULL DEFAULT 0,
    bloqueado_hasta TIMESTAMP,
    ultima_actividad TIMESTAMP
);
