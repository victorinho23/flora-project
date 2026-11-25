// backend/src/features/orders/orders.service.js

import { ordersRepository } from "./orders.repository.js";
import { changesRepository } from "../changes/changes.repository.js";
import { tablesService } from "../tables/tables.service.js";
import { tablesRepository } from "../tables/tables.repository.js";
import { accessService } from "../access/access.service.js";
import { imageUrl } from "../../config/upload.js";
import { parseIds, parseOption, parseNumber, parseDate } from "../../config/reportFilters.js";

const STATUSES = ["ACTIVA", "LISTA_PARA_ENTREGA", "ENTREGADA", "CUENTA_PEDIDA", "PAGADA", "CANCELADA"];


// si dos meseros abren la misma mesa al mismo tiempo, la base rechaza la segunda (indice unico 0028)
const isTableTaken = (error) => error.code === "23505" && error.constraint === "ux_orden_mesa_abierta";

const httpError = (status, message, extra = {}) => Object.assign(new Error(message), { status, ...extra });

// arma la url de la imagen de cada platillo y deja customer vacio (no se guarda cliente)
const toOrder = (row) => row && {
    ...row,
    customer: "",
    items: row.items.map((item) => ({ ...item, image: imageUrl(item.image) })),
};

// revisa mesa y platillos, y toma el precio actual de cada platillo desde la base
const prepareItems = async (rawItems = []) => {
    const grouped = new Map();
    for (const item of rawItems) {
        const dishId = Number(item.dishId);
        const quantity = Number(item.quantity);
        if (!dishId || !Number.isInteger(quantity) || quantity < 1) {
            throw httpError(400, "Hay platillos con cantidad no valida", { field: "items" });
        }
        grouped.set(dishId, (grouped.get(dishId) ?? 0) + quantity);
    }

    if (!grouped.size) throw httpError(400, "Debe agregar al menos un platillo a la orden", { field: "items" });

    // los platillos quedan en un Map por id, asi cada busqueda es directa y no recorre toda la lista
    const dishes = new Map((await ordersRepository.getDishes([...grouped.keys()])).map((d) => [d.id, d]));

    return [...grouped.entries()].map(([dishId, quantity]) => {
        const dish = dishes.get(dishId);
        if (!dish) throw httpError(400, "Uno de los platillos ya no existe", { field: "items" });
        return { dishId, quantity, price: dish.precio, active: dish.estado, name: dish.nombre };
    });
};

// a que estado puede pasar una orden desde el estado en que esta
// ACTIVA = en cocina, LISTA_PARA_ENTREGA = la comanda salio, ENTREGADA = la mesa ya tiene su pedido,
// CUENTA_PEDIDA = pidio la cuenta, PAGADA = mesa cerrada
// se puede devolver un paso (ej. a la mesa le falto algo y vuelve a cocina)
const NEXT_STATUS = {
    ACTIVA: ["LISTA_PARA_ENTREGA"],
    LISTA_PARA_ENTREGA: ["ACTIVA", "ENTREGADA", "PAGADA"],
    ENTREGADA: ["ACTIVA", "CUENTA_PEDIDA", "PAGADA"],
    CUENTA_PEDIDA: ["ENTREGADA", "PAGADA"],
    PAGADA: [],
    CANCELADA: [],
};

// la mesa tiene que existir en Configuracion y estar activa
// (currentTable = la mesa que ya tenia la orden, esa se acepta aunque la hayan desactivado despues)
const parseTable = async (value, currentTable = null) => {
    const tableNumber = Number(value);
    if (!Number.isInteger(tableNumber) || tableNumber < 1) {
        throw httpError(400, "Elige la mesa en el plano", { field: "tableNumber" });
    }
    const table = await tablesRepository.findByNumber(tableNumber);
    if (!table) throw httpError(400, `La mesa ${tableNumber} no existe`, { field: "tableNumber" });
    if (!table.active && tableNumber !== currentTable) throw httpError(400, `La mesa ${tableNumber} está desactivada`, { field: "tableNumber" });
    return tableNumber;
};

export const ordersService = {
    async getAll() {
        const orders = await ordersRepository.getAll();
        return orders.map(toOrder);
    },

    // reporte: ?ids=1,2  ?status=PAGADA  ?table=3  ?waiter=5  ?from=2026-11-01  ?to=2026-11-30
    async getReport(query) {
        const filters = {
            ids: parseIds(query.ids),
            status: parseOption(query.status, STATUSES, "El estado"),
            table: parseNumber(query.table, "La mesa"),
            waiter: parseNumber(query.waiter, "El mesero"),
            from: parseDate(query.from, "La fecha inicial"),
            to: parseDate(query.to, "La fecha final"),
        };

        if (filters.from && filters.to && filters.from > filters.to) {
            throw httpError(400, "La fecha inicial debe ser anterior a la final");
        }

        const orders = await ordersRepository.report(filters);
        return orders.map(toOrder);
    },

    // plano de mesas para todos los meseros (sale de la base, asi todos ven lo mismo)
    async getTables() {
        // tables = mesas activas con su zona y capacidad (las crea el administrador en Configuracion)
        // maps = los pisos del mapa del restaurante, para que el mesero vea donde queda cada mesa
        const tables = await tablesRepository.getAll(true);
        return { total: tables.length, tables, open: await ordersRepository.getOpenTables(), maps: await tablesService.getMaps() };
    },

    async getById(id) {
        const order = await ordersRepository.findById(id);
        if (!order) throw httpError(404, "No se encontro la orden solicitada");
        return toOrder(order);
    },

    // el mesero es el usuario que tiene la sesion abierta
    async create(data, waiterId) {
        const tableNumber = await parseTable(data.tableNumber);
        const items = await prepareItems(data.items);

        const inactive = items.find((item) => !item.active);
        if (inactive) throw httpError(400, `${inactive.name} está inhabilitado y no se puede pedir`, { field: "items" });

        const notes = data.notes?.trim() || "";
        const active = await ordersRepository.findActiveByTable(tableNumber);

        // mesa ocupada: no se puede abrir otra orden hasta que la que tiene se pague o se anule
        // (los platillos que falten se agregan editando la orden de esa mesa)
        if (active) {
            throw httpError(409, `La mesa ${tableNumber} está ocupada con la orden #${active.id}`, { field: "tableNumber", activeOrderId: active.id });
        }

        try {
            const created = await ordersRepository.create({ waiterId, tableNumber, notes: notes || null, items });
            // la mesa ya tiene pedido: deja de estar "ocupada sin pedir"
            await tablesRepository.setOccupiedByNumber(tableNumber, false);
            return created;
        } catch (error) {
            if (isTableTaken(error)) throw httpError(409, `La mesa ${tableNumber} se acaba de ocupar, elige otra`, { field: "tableNumber" });
            throw error;
        }
    },

    async update(id, data, userId) {
        const current = await ordersRepository.findById(id);
        if (!current) throw httpError(404, "No se encontro la orden solicitada");

        if (current.status === "PAGADA" || current.status === "CANCELADA") {
            throw httpError(400, "Esta orden ya está cerrada y no puede modificarse");
        }

        const tableNumber = await parseTable(data.tableNumber, Number(current.tableNumber ?? current.numero_mesa));
        const status = STATUSES.includes(data.status) ? data.status : current.status;
        // la orden sigue a nombre de quien la abrio; solo con el permiso de asignar mesero se puede cambiar
        const canAssign = await accessService.hasPermission(userId, "ordenes_asignar_mesero");
        const waiterId = canAssign ? Number(data.waiterId) : Number(current.waiterId);

        if (canAssign && (!waiterId || !(await ordersRepository.isActiveWaiter(waiterId)))) {
            throw httpError(400, "Debe seleccionar el mesero responsable", { field: "waiterName" });
        }

        if (await ordersRepository.findActiveByTable(tableNumber, id)) {
            throw httpError(409, `La mesa ${tableNumber} ya tiene otra orden activa`, { field: "tableNumber" });
        }

        const items = await prepareItems(data.items);

        try {
            await ordersRepository.update(id, {
                waiterId,
                tableNumber,
                notes: data.notes?.trim() || null,
                status,
                items,
            });
        } catch (error) {
            if (isTableTaken(error)) throw httpError(409, `La mesa ${tableNumber} ya tiene otra orden activa`, { field: "tableNumber" });
            throw error;
        }
    },

    // mueve la orden por el flujo de la comanda: cocina -> lista para entregar -> pagada
    async changeStatus(id, { status } = {}, currentUserId) {
        const current = await ordersRepository.findById(id);
        if (!current) throw httpError(404, "No se encontro la orden solicitada");

        if (!NEXT_STATUS[current.status]?.includes(status)) {
            throw httpError(400, "La orden no puede pasar a ese estado", { field: "status" });
        }

        await ordersRepository.updateStatus(id, status);

        await changesRepository.create({
            usuarioId: currentUserId,
            tabla: "orden",
            registroId: id,
            accion: status,
            motivo: null,
        });
    },

    // anular deja la orden en CANCELADA y guarda quien lo hizo
    async cancel(id, { reason } = {}, currentUserId) {
        const current = await ordersRepository.findById(id);
        if (!current) throw httpError(404, "No se encontro la orden solicitada");

        if (current.status === "PAGADA" || current.status === "CANCELADA") {
            throw httpError(400, "Esta orden ya está cerrada y no puede anularse");
        }

        await ordersRepository.updateStatus(id, "CANCELADA");

        await changesRepository.create({
            usuarioId: currentUserId,
            tabla: "orden",
            registroId: id,
            accion: "ANULAR",
            motivo: reason,
        });
    },
};
