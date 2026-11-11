// backend/src/config/upload.js
// configuracion de multer para guardar las imagenes que llegan del frontend

import multer from "multer";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// las imagenes quedan en la carpeta backend/uploads con un nombre unico
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    },
});

// solo se aceptan imagenes jpg, jpeg, png y webp de maximo 10MB
export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Solo se permiten imagenes jpg, jpeg, png o webp"));
        }
        cb(null, true);
    },
});

// en la base se guarda la ruta /uploads/archivo y aqui se arma la url completa
export const imageUrl = (value) => {
    if (!value) return null;
    if (value.startsWith("http")) return value;
    return `http://localhost:${process.env.PORT || 4000}${value}`;
};
