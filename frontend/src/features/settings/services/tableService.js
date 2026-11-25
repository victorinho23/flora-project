// src/features/settings/services/tableService.js
// mesas del restaurante (Configuracion)
import { request } from "@/features/config";

const TABLES_URL = "/tables";

// trae { zones, tables, map }: las zonas para el select, todas las mesas y el mapa del restaurante
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

// guarda el mapa del restaurante: { cols, rows, cells, tables: [{ id, x, y }] }
export async function saveTableMap(map) {
    return await request(`${TABLES_URL}/map`, { method: "PUT", body: map });
}
