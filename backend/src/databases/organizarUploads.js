// backend/src/databases/organizarUploads.js
// Se corre para dejar cada imagen en la carpeta de su modulo:
//   - busca la foto de cada usuario, platillo y producto donde sea que este dentro de uploads/
//   - la mueve a su carpeta (usuarios, menu, inventario) si esta en otra
//   - actualiza la ruta guardada en la base para que siga apareciendo
//   - las fotos que ya no usa nadie van a uploads/sin-uso (no se borran, por si acaso)
// Se puede correr las veces que quieras, lo que ya esta bien no lo toca.
// Uso (dentro de la carpeta backend):  npm run organizar-uploads

import fs from "fs";
import path from "path";
import { pool } from "../config/db.js";

const UPLOADS = "uploads";
const FOLDERS = ["usuarios", "menu", "inventario"];

// tabla, columna con la ruta y carpeta del modulo
const MODULES = [
    { table: "usuario", column: "foto_perfil", folder: "usuarios" },
    { table: "platillo", column: "imagen", folder: "menu" },
    { table: "producto", column: "imagen", folder: "inventario" },
];

// indice nombre -> carpeta donde esta ahora ("" es la raiz de uploads)
// asi cada foto se encuentra directo, sin recorrer las carpetas por cada registro
const located = new Map();
for (const folder of ["", ...FOLDERS, "sin-uso"]) {
    const dir = path.join(UPLOADS, folder);
    fs.mkdirSync(dir, { recursive: true });
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isFile() && !entry.name.startsWith(".")) located.set(entry.name, folder);
    }
}

const moved = [];
const missing = [];
const used = new Set();

for (const { table, column, folder } of MODULES) {
    const { rows } = await pool.query(
        `SELECT id, ${column} AS ruta FROM ${table} WHERE ${column} LIKE '/uploads/%';`,
    );

    for (const row of rows) {
        const name = path.basename(row.ruta);
        const current = located.get(name);
        const newPath = `/${UPLOADS}/${folder}/${name}`;

        if (current === undefined) {
            // la base apunta a una foto que no existe: se deja igual y se avisa
            missing.push(`${table} #${row.id}: ${row.ruta}`);
            continue;
        }

        used.add(name);

        // la foto esta en otra carpeta: se pasa a la de su modulo
        if (current !== folder) {
            fs.renameSync(path.join(UPLOADS, current, name), path.join(UPLOADS, folder, name));
            located.set(name, folder);
        }

        if (row.ruta !== newPath) {
            await pool.query(`UPDATE ${table} SET ${column} = $1 WHERE id = $2;`, [newPath, row.id]);
            moved.push(`${table} #${row.id}: ${row.ruta} -> ${newPath}`);
        }
    }
}

// lo que quedo suelto en la raiz de uploads/ ya no lo usa ningun registro
const unused = [...located].filter(([name, folder]) => folder === "" && !used.has(name)).map(([name]) => name);
for (const name of unused) fs.renameSync(path.join(UPLOADS, name), path.join(UPLOADS, "sin-uso", name));

console.log(`\nImágenes acomodadas en su módulo: ${moved.length}`);
moved.forEach((line) => console.log("  ✔", line));
console.log(`\nSueltas sin uso, movidas a uploads/sin-uso: ${unused.length}`);
unused.forEach((name) => console.log("  •", name));
if (missing.length) {
    console.log(`\nRegistros que apuntan a una foto que no existe: ${missing.length}`);
    missing.forEach((line) => console.log("  ✘", line));
}

await pool.end();
