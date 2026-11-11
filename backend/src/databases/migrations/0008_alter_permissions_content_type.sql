-- databases/migrations/0008_alter_permissions_content_type.sql
-- relacion permissions -> content_type

-- si ya existia se quita primero, asi se puede ejecutar mas de una vez
ALTER TABLE permissions
DROP CONSTRAINT IF EXISTS fk_permissions_content_type;

ALTER TABLE permissions
ADD CONSTRAINT fk_permissions_content_type
FOREIGN KEY (content_type_id)
REFERENCES content_type(content_type_id);
