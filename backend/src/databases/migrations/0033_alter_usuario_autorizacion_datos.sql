-- databases/migrations/0033_alter_usuario_autorizacion_datos.sql
-- fecha en que la persona autorizo el tratamiento de sus datos personales (Ley 1581 de 2012)
-- sirve como prueba de la autorizacion; las cuentas que ya existian quedan sin fecha

ALTER TABLE usuario ADD COLUMN IF NOT EXISTS autorizacion_datos TIMESTAMP;
