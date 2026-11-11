// Importamos dotenv para cargar las variables del archivo .env
// va primero para que todo lo demas ya las encuentre
import dotenv from "dotenv";

dotenv.config();

// Importamos la instancia de la aplicación Express ya configurada
// app.js se encarga de middlewares, rutas y configuración general.
import app from "./app.js";

// Definimos el puerto del servidor
// Se prioriza el valor definido en el entorno (produccion)
// y se usa 4000 como valor por defecto en desarrollo
const PORT = process.env.PORT || 4000;

// Iniciamos el servidor HTTP usando la app de Express
// listen levanta el servidor y queda a la espera de peticiones
app.listen(PORT, () => {
    // Log informativo indicando que el servidor esta corriendo
    console.log(`Servidor backend de Flora corriendo en http://localhost:${PORT}`);
});
