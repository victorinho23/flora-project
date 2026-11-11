-- databases/migrations/0023_insert_usuario_admin.sql
-- administrador inicial para poder entrar la primera vez
-- correo: vcortezcastrillon7a@gmail.com
-- la contraseña va cifrada con bcrypt, por eso se ve asi

INSERT INTO usuario (
    tipo_documento,
    numero_documento,
    nombre,
    correo_personal,
    numero_contacto,
    direccion,
    contrasena,
    is_superuser,
    estado,
    fecha_inicio_laboral
)
VALUES (
    'CC',
    '1007919013',
    'Victor Cortes',
    'vcortezcastrillon7a@gmail.com',
    '3216304524',
    'Carrera 8 #21-40, Dosquebradas',
    '$2b$10$deXRc2CkVJwhSQ3.zxk2OuhHeQh3XqwBWYgBFb19RzZJeEqSD.01i',
    TRUE,
    TRUE,
    '2025-02-02'
)
ON CONFLICT (correo_personal) DO NOTHING;
