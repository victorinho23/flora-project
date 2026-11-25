// backend/src/config/upload.js
// configuracion de multer para guardar las imagenes que llegan del frontend

import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// carpetas que puede usar cada modulo dentro de backend/uploads
// asi las fotos de usuarios no se revuelven con las del menu o el inventario
export const FOLDERS = ["usuarios", "menu", "inventario"];

// indice nombre de archivo -> donde esta de verdad (ej. "1794...png" -> "menu/1794...png")
// se arma una vez al arrancar y buscar una foto es directo, no recorre carpetas
const located = new Map();

const indexFolder = (folder) => {
    const dir = path.join("uploads", folder);
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isFile() && !entry.name.startsWith(".")) located.set(entry.name, path.posix.join(folder, entry.name));
    }
};
// primero las sueltas y despues las de cada modulo (si esta en las dos, gana la del modulo)
indexFolder("");
FOLDERS.forEach(indexFolder);

// donde esta guardada una foto segun su nombre (o undefined si no existe)
export const locateImage = (name) => located.get(name);

// solo se aceptan imagenes jpg, jpeg, png y webp de maximo 10MB
const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// arma un multer que guarda en uploads/<carpeta> con un nombre unico
// la carpeta se crea una sola vez cuando arranca el servidor, no en cada peticion
const createUpload = (folder) => {
    const destination = path.join("uploads", folder);
    fs.mkdirSync(destination, { recursive: true });

    return multer({
        storage: multer.diskStorage({
            destination,
            filename: (req, file, cb) => {
                const extension = path.extname(file.originalname).toLowerCase();
                const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
                located.set(name, path.posix.join(folder, name));
                cb(null, name);
            },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (!allowed.includes(file.mimetype)) {
                return cb(Object.assign(new Error("Solo se permiten imagenes jpg, jpeg, png o webp"), { status: 400 }));
            }
            cb(null, true);
        },
    });
};

// se crean todos al inicio y quedan guardados en un objeto
// buscar uno por nombre es directo (no recorre nada) sin importar cuantos modulos haya
const uploads = Object.fromEntries(FOLDERS.map((folder) => [folder, createUpload(folder)]));

// en las rutas se usa asi: uploadTo("menu").single("dishImage")
export const uploadTo = (folder) => {
    const upload = uploads[folder];
    if (!upload) throw new Error(`La carpeta de imagenes "${folder}" no existe`);
    return upload;
};

// ruta que se guarda en la base, ej: /uploads/menu/1794489466950-575180997.jpeg
// file.destination ya trae uploads/<carpeta>, por eso sirve para cualquier modulo
export const imagePath = (file) => (file ? `/${path.posix.join(file.destination.replaceAll("\\", "/"), file.filename)}` : null);

// borra una imagen guardada (ej. la foto vieja cuando suben una nueva)
// solo toca archivos dentro de uploads/, nunca otra ruta
export const removeImage = (storedPath) => {
    if (typeof storedPath !== "string" || !storedPath.startsWith("/uploads/")) return;
    const name = path.basename(storedPath);
    const where = located.get(name);
    if (!where) return;
    located.delete(name);
    fs.unlink(path.join("uploads", where), () => {});
};

// Revisa que el archivo de verdad sea una imagen mirando sus primeros bytes
// (el tipo que manda el navegador se puede falsificar, el contenido no)
const SIGNATURES = [
    (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,                       // jpg
    (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,       // png
    (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP", // webp
];

export const verifyImage = (req, res, next) => {
    if (!req.file) return next();
    fs.open(req.file.path, "r", (openError, fd) => {
        if (openError) return next(openError);
        const header = Buffer.alloc(12);
        fs.read(fd, header, 0, 12, 0, (readError) => {
            fs.close(fd, () => {});
            if (!readError && SIGNATURES.some((check) => check(header))) return next();
            fs.unlink(req.file.path, () => {});
            res.status(400).json({ error: "El archivo no es una imagen válida (jpg, png o webp)" });
        });
    });
};

// Si piden /uploads/archivo.png o /uploads/inventario/archivo.png pero la foto
// ya esta en otra carpeta (por ejemplo la movieron a menu), se manda desde donde este
export const serveMovedImage = (req, res, next) => {
    const where = located.get(path.basename(req.path));
    if (!where) return res.status(404).end();
    res.sendFile(path.resolve("uploads", where));
};

// en la base se guarda la ruta /uploads/... y aqui se arma la url completa
// las imagenes viejas que quedaron sueltas en /uploads siguen funcionando igual
export const imageUrl = (value) => {
    if (!value) return null;
    if (value.startsWith("http")) return value;
    // PUBLIC_URL en el .env cuando el backend no este en localhost (ej. un servidor)
    return `${process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`}${value}`;
};
