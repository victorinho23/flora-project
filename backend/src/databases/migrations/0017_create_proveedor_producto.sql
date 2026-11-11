-- databases/migrations/0017_create_proveedor_producto.sql
-- productos que suministra cada proveedor: un proveedor tiene muchos productos y un producto muchos proveedores

CREATE TABLE IF NOT EXISTS proveedor_producto (
    proveedor_id INTEGER NOT NULL,
    producto_id VARCHAR(20) NOT NULL,

    PRIMARY KEY (proveedor_id, producto_id),

    CONSTRAINT fk_proveedor_producto_proveedor
        FOREIGN KEY (proveedor_id)
        REFERENCES proveedor(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_proveedor_producto_producto
        FOREIGN KEY (producto_id)
        REFERENCES producto(id)
        ON DELETE CASCADE
);
