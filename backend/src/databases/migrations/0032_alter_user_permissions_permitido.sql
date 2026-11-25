-- databases/migrations/0032_alter_user_permissions_permitido.sql
-- un permiso individual puede dar o quitar:
-- permitido = TRUE  -> el usuario lo tiene aunque su grupo no lo tenga
-- permitido = FALSE -> al usuario se le quita aunque su grupo si lo tenga
-- los que ya existian quedan como permitidos

ALTER TABLE user_permissions ADD COLUMN IF NOT EXISTS permitido BOOLEAN NOT NULL DEFAULT TRUE;
