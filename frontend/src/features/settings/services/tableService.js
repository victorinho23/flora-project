// src/features/settings/services/tableService.js
// mesas del restaurante (Configuracion)
import { request } from "@/features/config";

const TABLES_URL = "/tables";

// trae { zones, tables }: las zonas para el select y todas las mesas
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

