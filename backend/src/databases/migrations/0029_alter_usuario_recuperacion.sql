-- databases/migrations/0029_alter_usuario_recuperacion.sql
-- datos para recuperar la contraseña con un codigo que llega al correo
-- codigo_recuperacion: el codigo cifrado (nunca se guarda tal cual)
-- codigo_expira: hasta cuando sirve el codigo (10 minutos)
-- intentos_codigo: cuantas veces lo han escrito mal, a los 5 se anula

ALTER TABLE usuario ADD COLUMN IF NOT EXISTS codigo_recuperacion VARCHAR(100);
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS codigo_expira TIMESTAMP;
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS intentos_codigo INTEGER NOT NULL DEFAULT 0;
