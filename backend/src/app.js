// Importamos Express, el framework base para construir el servidor HTTP
import express from "express";

// Importamos el middleware CORS
// Permite controlar qué origenes pueden comunicarse con el backend
import cors from "cors";

// Importamos las rutas de cada feature
// Cada feature expone su propio router independiente
import authRoutes from "./features/auth/auth.routes.js";
import changesRoutes from "./features/changes/changes.routes.js";
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
import { serveMovedImage } from "./config/upload.js";

// Creamos la instancia principal de la aplicación express
const app = express();

// no decir que el servidor es Express (le ahorra pistas a un atacante)
app.disable("x-powered-by");

// Cabeceras de seguridad basicas en todas las respuestas
app.use((req, res, next) => {
    res.set({
        "X-Content-Type-Options": "nosniff",          // el navegador no adivina el tipo de archivo
        "X-Frame-Options": "DENY",                    // nadie puede meter la API en un iframe
        "Referrer-Policy": "no-referrer",
        "Cross-Origin-Resource-Policy": "same-site",  // las imagenes solo las usa el frontend de Flora
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; frame-ancestors 'none'",
    });
    next();
});

// Middleware de CORS
// Permite solicitudes únicamente desde el frontend de Flora en localhost 5173 (Vite)
// la direccion del frontend se puede cambiar en el .env con FRONTEND_URL (por defecto el de Vite)
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));

// Middleware para parsear cuerpos de petición en formato JSON
// Sin este middleware, req.body seria undefined
app.use(express.json({ limit: "1mb" }));

// Las imagenes subidas se pueden ver en http://localhost:4000/uploads/<modulo>/archivo.png
// dotfiles ignorados y sin listar carpetas
// las fotos si se pueden mostrar desde el frontend aunque se abra con 127.0.0.1 o la ip del pc
const allowImages = (req, res, next) => {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    next();
};
app.use("/uploads", allowImages, express.static("uploads", { dotfiles: "ignore", index: false }), serveMovedImage);

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
app.use("/api/changes", changesRoutes);

// ruta que no existe: se responde en JSON para que el frontend muestre un mensaje claro
app.use("/api", (req, res) => {
    res.status(404).json({ error: `La ruta ${req.method} ${req.originalUrl} no existe en el servidor. Si acabas de actualizar el proyecto, reinicia el backend.` });
});

// Si algo falla (por ejemplo una imagen muy pesada en multer) respondemos con el mensaje
app.use((err, req, res, next) => {
    console.error("ERROR BACKEND", err);
    const status = err.code === "LIMIT_FILE_SIZE" ? 400 : err.status || err.statusCode || 500;
    // los errores internos no se muestran tal cual: pueden traer datos de la base o rutas del servidor
    const message = err.code === "LIMIT_FILE_SIZE"
        ? "La imagen supera el tamaño maximo de 10MB"
        : status < 500 ? err.message : "Error interno del servidor";
    res.status(status).json({ error: message });
});

// Exportamos la aplicacion configurada
// El arranque del servidor se hace en server.js
export default app;
