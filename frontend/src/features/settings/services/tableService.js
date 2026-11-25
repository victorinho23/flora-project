// src/features/settings/services/tableService.js
// mesas del restaurante (Configuracion)
import { request } from "@/features/config";

const TABLES_URL = "/tables";

// trae { zones, tables, maps }: las zonas para el select, todas las mesas y los pisos del mapa del restaurante
export async function getAllTables() {
    return await request(TABLES_URL);
}

export async function createTable(table) {
    return await request(TABLES_URL, { method: "POST", body: table });
}

export async function updateTable(id, table) {
    return await request(`${TABLES_URL}/${id}`, { method: "PUT", body: table });
}

export async function updateTableStatus(id, active, reason) {
    return await request(`${TABLES_URL}/${id}/status`, { method: "PATCH", body: { active, reason } });
}

// pisos del mapa del restaurante
export async function createTableFloor(name) {
    return await request(`${TABLES_URL}/map`, { method: "POST", body: { name } });
}

// guarda un piso: { name, cols, rows, cells, tables: [{ id, x, y }] }
export async function saveTableMap(floorId, map) {
    return await request(`${TABLES_URL}/map/${floorId}`, { method: "PUT", body: map });
}

// borra un piso (sus mesas quedan sin ubicar)
export async function deleteTableFloor(floorId) {
    return await request(`${TABLES_URL}/map/${floorId}`, { method: "DELETE" });
}
