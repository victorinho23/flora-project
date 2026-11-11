// backend/src/features/orders/orders.service.js

import { ordersRepository } from "./orders.repository.js";
import { changesRepository } from "../changes/changes.repository.js";
import { imageUrl } from "../../config/upload.js";
import { parseIds, parseOption, parseNumber, parseDate } from "../../config/reportFilters.js";

const STATUSES = ["ACTIVA", "LISTA_PARA_ENTREGA", "PAGADA", "CANCELADA"];

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

    const dishes = await ordersRepository.getDishes([...grouped.keys()]);

    return [...grouped.entries()].map(([dishId, quantity]) => {
        const dish = dishes.find((d) => d.id === dishId);
        if (!dish) throw httpError(400, "Uno de los platillos ya no existe", { field: "items" });
        return { dishId, quantity, price: dish.precio, active: dish.estado, name: dish.nombre };
    });
};

const parseTable = (value) => {
    const tableNumber = Number(value);
    if (!Number.isInteger(tableNumber) || tableNumber < 1) {
        throw httpError(400, "El numero de mesa debe ser un numero valido", { field: "tableNumber" });
    }
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

    async getById(id) {
        const order = await ordersRepository.findById(id);
        if (!order) throw httpError(404, "No se encontro la orden solicitada");
        return toOrder(order);
    },

    // el mesero es el usuario que tiene la sesion abierta
    async create(data, waiterId) {
        const tableNumber = parseTable(data.tableNumber);
        const items = await prepareItems(data.items);

        const inactive = items.find((item) => !item.active);
        if (inactive) throw httpError(400, `${inactive.name} está inhabilitado y no se puede pedir`, { field: "items" });

        const notes = data.notes?.trim() || "";
        const active = await ordersRepository.findActiveByTable(tableNumber);

        // si la mesa ya tiene una orden activa se avisa, y si confirman se agregan alli
        if (active && !data.merge) {
            throw httpError(409, `La mesa ${tableNumber} ya tiene una orden activa`, { activeOrderId: active.id });
        }

        if (active) {
            return await ordersRepository.addItems(active.id, { notes, items });
        }

        return await ordersRepository.create({ waiterId, tableNumber, notes: notes || null, items });
    },

    async update(id, data) {
        const current = await ordersRepository.findById(id);
        if (!current) throw httpError(404, "No se encontro la orden solicitada");

        if (current.status === "PAGADA" || current.status === "CANCELADA") {
            throw httpError(400, "Esta orden ya está cerrada y no puede modificarse");
        }

        const tableNumber = parseTable(data.tableNumber);
        const status = STATUSES.includes(data.status) ? data.status : current.status;
        const waiterId = Number(data.waiterId);

        if (!waiterId || !(await ordersRepository.isActiveWaiter(waiterId))) {
            throw httpError(400, "Debe seleccionar el mesero responsable", { field: "waiterName" });
        }

        if (await ordersRepository.findActiveByTable(tableNumber, id)) {
            throw httpError(409, `La mesa ${tableNumber} ya tiene otra orden activa`, { field: "tableNumber" });
        }

        const items = await prepareItems(data.items);

        await ordersRepository.update(id, {
            waiterId,
            tableNumber,
            notes: data.notes?.trim() || null,
            status,
            items,
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
