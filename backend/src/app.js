// Importamos Express, el framework base para construir el servidor HTTP
import express from "express";

// Importamos el middleware CORS
// Permite controlar qué origenes pueden comunicarse con el backend
import cors from "cors";

// Importamos las rutas de cada feature
// Cada feature expone su propio router independiente
import authRoutes from "./features/auth/auth.routes.js";
import userRoutes from "./features/users/user.routes.js";
import accessRoutes from "./features/access/access.routes.js";
import groupsRoutes from "./features/groups/groups.routes.js";
import permissionsRoutes from "./features/permissions/permissions.routes.js";
import categoriesRoutes from "./features/categories/categories.routes.js";
import dishesRoutes from "./features/dishes/dishes.routes.js";
import ordersRoutes from "./features/orders/orders.routes.js";
import brandsRoutes from "./features/brands/brands.routes.js";
import inventoryRoutes from "./features/inventory/inventory.routes.js";
import suppliersRoutes from "./features/suppliers/suppliers.routes.js";

// Creamos la instancia principal de la aplicación express
const app = express();

// Middleware de CORS
// Permite solicitudes únicamente desde el frontend de Flora en localhost 5173 (Vite)
app.use(cors({ origin: "http://localhost:5173" }));

// Middleware para parsear cuerpos de petición en formato JSON
// Sin este middleware, req.body seria undefined
app.use(express.json());

// Las imagenes subidas se pueden ver en http://localhost:4000/uploads/archivo.png
app.use("/uploads", express.static("uploads"));

// Registro de los routers
// Ejemplo final: POST http://localhost:4000/api/users
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/dishes", dishesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/brands", brandsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/suppliers", suppliersRoutes);

// Si algo falla (por ejemplo una imagen muy pesada en multer) respondemos con el mensaje
app.use((err, req, res, next) => {
    console.error("ERROR BACKEND", err);
    const status = err.code === "LIMIT_FILE_SIZE" ? 400 : err.status || 500;
    const message = err.code === "LIMIT_FILE_SIZE" ? "La imagen supera el tamaño maximo de 10MB" : err.message;
    res.status(status).json({ error: message });
});

// Exportamos la aplicacion configurada
// El arranque del servidor se hace en server.js
export default app;
