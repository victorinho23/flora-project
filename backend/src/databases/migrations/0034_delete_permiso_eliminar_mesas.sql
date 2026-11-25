-- databases/migrations/0034_delete_permiso_eliminar_mesas.sql
-- las mesas no se eliminan (solo se desactivan) para no perder el historial de las ordenes;
-- si la base ya tenia el permiso de eliminar mesas se quita de grupos y usuarios

DELETE FROM group_permissions
WHERE permission_id IN (SELECT permission_id FROM permissions WHERE permission_codename = 'mesas_eliminar');

DELETE FROM user_permissions
WHERE permission_id IN (SELECT permission_id FROM permissions WHERE permission_codename = 'mesas_eliminar');

DELETE FROM permissions WHERE permission_codename = 'mesas_eliminar';
