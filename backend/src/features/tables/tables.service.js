// backend/src/features/tables/tables.service.js
// reglas de las mesas: numero unico, capacidad razonable y no tocar una mesa ocupada

import { tablesRepository } from "./tables.repository.js";
import { changesRepository } from "../changes/changes.repository.js";

// error con codigo http y el campo que fallo, para que el controller responda bien
const httpError = (status, message, field) => Object.assign(new Error(message), { status, field });

export const ZONES = ["Salón", "Terraza", "Barra", "Segundo piso"];

// lo que se puede pintar en el mapa (el frontend tiene los mismos nombres)
export const MAP_AREAS = ["pared", "cocina", "barra", "banos", "entrada", "caja", "terraza", "jardin"];

// mapa vacio cuando todavia no se ha dibujado
const EMPTY_MAP = { cols: 20, rows: 12, cells: {} };

// revisa y limpia lo que llega del formulario
const clean = (data) => {
    const number = Number(data.number);
    const capacity = Number(data.capacity);
    const zone = String(data.zone ?? "").trim();

    if (!Number.isInteger(number) || number < 1 || number > 999) throw httpError(400, "El número de mesa debe ser entre 1 y 999", "number");
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 30) throw httpError(400, "La capacidad debe ser entre 1 y 30 personas", "capacity");
    if (!ZONES.includes(zone)) throw httpError(400, "Elige una zona de la lista", "zone");

    return { number, capacity, zone };
};

// guarda en el registro de cambios quien hizo que
const log = (userId, id, accion, motivo) =>
    changesRepository.create({ usuarioId: userId, tabla: "mesa", registroId: id, accion, motivo });

export const tablesService = {
    async getAll(query = {}) {
        return {
            zones: ZONES,
            tables: await tablesRepository.getAll(query.active === "1"),
            map: await tablesService.getMap(),
        };
    },

    async getMap() {
        return (await tablesRepository.getMap()) ?? EMPTY_MAP;
    },

    // revisa el dibujo: tamaño permitido, celdas dentro de la cuadricula y una mesa por celda
    async saveMap(data, userId) {
        const cols = Number(data.cols);
        const rows = Number(data.rows);
        if (!Number.isInteger(cols) || cols < 8 || cols > 30) throw httpError(400, "El mapa debe tener entre 8 y 30 columnas", "cols");
        if (!Number.isInteger(rows) || rows < 6 || rows > 20) throw httpError(400, "El mapa debe tener entre 6 y 20 filas", "rows");

        const inside = (x, y) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < cols && y < rows;

        // solo se guardan las celdas validas; lo que este fuera del tamaño se descarta
        const cells = {};
        for (const [key, area] of Object.entries(data.cells ?? {})) {
            const [x, y] = key.split(",").map(Number);
            if (inside(x, y) && MAP_AREAS.includes(area)) cells[`${x},${y}`] = area;
        }

        const tables = new Map((await tablesRepository.getAll()).map((table) => [table.id, table]));
        const used = new Set();
        const positions = [];
        for (const item of data.tables ?? []) {
            const table = tables.get(Number(item.id));
            const x = Number(item.x);
            const y = Number(item.y);
            if (!table || !inside(x, y)) continue;
            if (used.has(`${x},${y}`)) throw httpError(400, `Dos mesas quedaron en la misma celda (mesa ${table.number})`, "tables");
            used.add(`${x},${y}`);
            positions.push({ id: table.id, x, y });
        }

        await tablesRepository.saveMap({ cols, rows, cells, positions });
        await log(userId, "plano", "ACTUALIZAR", `Mapa del restaurante (${positions.length} mesas ubicadas)`);
    },

    async create(data, userId) {
        const table = clean(data);
        if (await tablesRepository.findByNumber(table.number)) throw httpError(409, `Ya existe la mesa ${table.number}`, "number");

        const id = await tablesRepository.create(table);
        await log(userId, id, "CREAR", `Mesa ${table.number} en ${table.zone} para ${table.capacity} personas`);
        return id;
    },

    async update(id, data, userId) {
        const current = await tablesRepository.findById(id);
        if (!current) throw httpError(404, "No se encontró la mesa");

        const table = clean(data);
        const repeated = await tablesRepository.findByNumber(table.number);
        if (repeated && repeated.id !== id) throw httpError(409, `Ya existe la mesa ${table.number}`, "number");

        // con una orden abierta no se le cambia el numero, la orden quedaria apuntando a otra mesa
        if (table.number !== current.number && (await tablesRepository.findOpenOrder(current.number))) {
            throw httpError(409, `La mesa ${current.number} tiene una orden abierta; cambia el número cuando quede libre`, "number");
        }

        await tablesRepository.update(id, table);
        await log(userId, id, "ACTUALIZAR", `Mesa ${current.number}: número ${table.number}, ${table.zone}, ${table.capacity} personas`);
    },

    async updateStatus(id, { active, reason }, userId) {
        const current = await tablesRepository.findById(id);
        if (!current) throw httpError(404, "No se encontró la mesa");

        const next = Boolean(active);
        if (!next && (await tablesRepository.findOpenOrder(current.number))) {
            throw httpError(409, `La mesa ${current.number} tiene una orden abierta; desactívala cuando quede libre`);
        }

        await tablesRepository.updateStatus(id, next);
        await log(userId, id, next ? "HABILITAR" : "INHABILITAR", reason || null);
    },

};
