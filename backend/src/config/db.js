// Importamos el paquete pg usando el sistema de modulo ES.// Importamos el paqueteSQL para Node.js

import pkg from "pg";

//  Extraemos la clase Pool desde el paquete
// Pool gestiona un conjunto de conexiones reutilizables a la BD

const {Pool} = pkg;

// Importamos dotenv para leer variables de entorno desde un archivo .env

import dotenv from "dotenv";

// Cargamos las variables definidas en el archivo .env

// Esto debe ejcutarse antes de acceder a procees.env
dotenv.config();

// Creamoss y exportamos una instancia única del pool de PostgreSQL
// Esta instancia se reutiliza en toda la aplicacion 
export const pool = new Pool({
    // Host donde se encuentra PostgreSQL (ej: localhost o IP del servidor)
    host: process.env.DB_HOST,

    // Puerto de PostgreSQL (por defecto 5432)
    port: process.env.DB_PORT,

    // Usuario con permisos sobre la base de datos
    user: process.env.DB_USER,

    // Contraseña del usuario
    password: process.env.DB_PASSWORD,

    // Nombre de la base de datos a la que conectamos
    database: process.env.DB_NAME,

    // NUmero maximo de conexiones activas en el pool
    max:10,

    // Tiempo máximo (en ms) que una conexión debe estar inactiva
    // Antes de ser cerrada automáticamente
    idleTimeoutMillis: 30000,
});

// Evento que se dispara cada vez que en el pool establece una conexión
// Útil para logs y veridficacion en  desarrollo
pool.on("connect", () => {
    console.log("Conectado  a PostgreSQL");
});

// Evento que se dispara cuando ocurre un errors en el pool
// Importante para monitoreo y diagnóstico de fallos
pool.on("error", (err) => {
    console.error("Error en la Conexión con PostgreSQL", err);
});

