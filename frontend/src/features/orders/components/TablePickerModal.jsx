// src/features/orders/components/TablePickerModal.jsx
// Ventana para ver y elegir las mesas, usa el mismo DetailModal de los detalles
// - modo "browse" (lista de ordenes): mesa ocupada -> ver su orden, mesa libre -> crear orden
// - modo "select" (crear/editar orden): solo se pueden tocar las mesas libres, las ocupadas quedan bloqueadas
// El estado de las mesas se pide a la base cada vez que se abre, asi siempre esta al dia
// Se dibuja como un plano: cada zona es un espacio del restaurante y cada mesa tiene sus sillas
// segun la capacidad, asi el mesero se ubica rapido y ve cuales estan libres
import { useEffect, useMemo, useState } from "react";
import { Utensils, Clock, Users, DoorOpen, Trees, Wine, Building2 } from "lucide-react";
import { DetailModal } from "@/shared";
import { getTables, TOTAL_MESAS } from "../services/orderService";

// como se ve cada mesa segun su orden abierta
const TABLE_STATES = {
    LIBRE: { label: "Libre", tile: "bg-bg-w border-bd-s300 text-br-s950", dot: "bg-m3-outline" },
    ACTIVA: { label: "En cocina", tile: "bg-m3-secondary-container border-bd-t900 text-m3-on-secondary-container", dot: "bg-m3-secondary" },
    LISTA_PARA_ENTREGA: { label: "Lista para entregar", tile: "bg-m3-success-container border-m3-success text-m3-success", dot: "bg-m3-success" },
};

// cada zona con su icono y el orden en que aparecen en el plano (las nuevas quedan al final)
const ZONE_ICONS = { "Salón": DoorOpen, "Terraza": Trees, "Barra": Wine, "Segundo piso": Building2 };
const ZONE_ORDER = Object.keys(ZONE_ICONS);

// sillas de la mesa: la mitad arriba y la mitad abajo
const chairsOf = (capacity = 4) => [Math.ceil(capacity / 2), Math.floor(capacity / 2)];

// mesas de 2 redondas, hasta 4 cuadradas y las grandes alargadas
const shapeOf = (capacity = 4) => (capacity <= 2 ? "w-14 rounded-m3-full" : capacity <= 4 ? "w-16 rounded-m3-md" : "w-24 rounded-m3-md");

// minutos que lleva abierta la orden, para saber que mesa lleva mas tiempo esperando
const minutesSince = (date) => Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));

// arma el diccionario mesa -> orden abierta, una sola vez por lista de ordenes
// despues saber si una mesa esta ocupada es una busqueda directa
function buildOpenByTable(orders) {
    const byTable = new Map();
    for (const order of orders) {
        if (order.status === "ACTIVA" || order.status === "LISTA_PARA_ENTREGA") byTable.set(Number(order.tableNumber), order);
    }
    return byTable;
}

// currentOrderId: al editar, la orden que se esta editando (su propia mesa no se bloquea)
export default function TablePickerModal({ open, onClose, mode = "browse", currentTable, currentOrderId, onPick, canOpenFree = true }) {
    // cuantas mesas tiene el restaurante y cuales estan ocupadas, segun el backend
    // todas las mesas empiezan libres; al llegar la respuesta se marcan las que tienen orden abierta
    const [board, setBoard] = useState({ total: TOTAL_MESAS, tables: [], open: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!open) return;
        let alive = true;
        getTables().then((data) => {
            if (!alive) return;
            setBoard(data);
            setLoading(false);
        });
        return () => { alive = false; };
    }, [open]);

    const openByTable = useMemo(() => buildOpenByTable(board.open), [board]);

    // mesas del tablero: las activas de Configuracion y alguna extra si una orden abierta usa una que ya no esta
    const info = useMemo(() => new Map(board.tables.map((table) => [Number(table.number), table])), [board]);
    const tables = [...new Set([...info.keys(), ...openByTable.keys()])].sort((a, b) => a - b);
    const tableCount = tables.length;

    // mesas agrupadas por zona para dibujar el plano
    const zones = useMemo(() => {
        const byZone = new Map();
        for (const table of tables) {
            const zone = info.get(table)?.zone ?? "Salón";
            if (!byZone.has(zone)) byZone.set(zone, []);
            byZone.get(zone).push(table);
        }
        const rank = (zone) => (ZONE_ORDER.includes(zone) ? ZONE_ORDER.indexOf(zone) : ZONE_ORDER.length);
        return [...byZone.entries()].sort((a, b) => rank(a[0]) - rank(b[0])).map(([zone, list]) => ({ zone, list }));
    }, [tables, info]);
    const freeCount = tables.filter((table) => !openByTable.has(table)).length;

    return (
        <DetailModal
            open={open}
            onClose={onClose}
            icon={Utensils}
            title={mode === "select" ? "Elegir mesa en el plano" : "Plano de mesas"}
            subtitle={loading ? "Cargando mesas..." : `${freeCount} de ${tableCount} mesas libres`}
            size="max-w-6xl"
            bodyClassName="grid-cols-1"
        >
            {/* convenciones de color */}
            <div className="col-span-full flex flex-wrap gap-4 text-m3-label-medium text-br-s800">
                {Object.entries(TABLE_STATES).map(([key, state]) => (
                    <span key={key} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-m3-full ${state.dot}`} />
                        {state.label}
                    </span>
                ))}
            </div>

            {/* plano: una seccion por zona del restaurante */}
            {zones.map(({ zone, list }) => {
                const ZoneIcon = ZONE_ICONS[zone] ?? Utensils;
                const free = list.filter((table) => !openByTable.has(table)).length;
                return (
                    <section key={zone} aria-label={`Zona ${zone}`} className="col-span-full rounded-m3-lg border-2 border-dashed border-bd-t300 bg-bg-p50 p-4">
                        <h3 className="flex items-center gap-2 mb-3 text-m3-title-medium font-bold text-br-t950">
                            <ZoneIcon size={18} />
                            {zone}
                            <span className="ml-auto text-m3-label-medium font-semibold text-br-s800">{free} de {list.length} libres</span>
                        </h3>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
                            {list.map((table) => {
                                const order = openByTable.get(table);
                                const state = TABLE_STATES[order?.status ?? "LIBRE"];
                                const capacity = info.get(table)?.capacity ?? 4;
                                const [top, bottom] = chairsOf(capacity);
                                const isCurrent = String(table) === String(currentTable);
                                // al elegir mesa para una orden, las ocupadas se bloquean (menos la de la orden que se edita)
                                // y en el plano de la lista, sin permiso de crear ordenes las mesas libres no se pueden abrir
                                const ownTable = order && String(order.id) === String(currentOrderId);
                                const blocked = (mode === "select" && order && !ownTable) || (mode === "browse" && !order && !canOpenFree);

                                const handleClick = () => {
                                    if (mode === "select") onPick(String(table));
                                    else onPick(table, order);
                                };

                                const chairs = (count) => (
                                    <span aria-hidden="true" className="flex justify-center gap-1.5 h-2.5">
                                        {Array.from({ length: count }, (_, index) => <span key={index} className={`w-3.5 h-2.5 rounded-m3-xs ${state.dot} opacity-70`} />)}
                                    </span>
                                );

                                return (
                                    <button
                                        key={table}
                                        type="button"
                                        onClick={handleClick}
                                        disabled={blocked}
                                        aria-pressed={mode === "select" ? isCurrent : undefined}
                                        aria-label={`Mesa ${table}, ${capacity} personas, ${order ? `${state.label}, orden ${order.id}${blocked ? ", ocupada" : ""}` : "libre"}`}
                                        className={`m3-state relative flex flex-col items-center gap-1.5 p-3 border rounded-m3-md shadow-m3-1 enabled:hover:shadow-m3-2 transition-shadow duration-200 ease-m3-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none ${state.tile} ${isCurrent && !blocked ? "ring-2 ring-m3-primary ring-offset-2" : ""}`}
                                    >
                                        {/* la mesa dibujada con sus sillas */}
                                        {chairs(top)}
                                        <span className={`${shapeOf(capacity)} h-11 flex items-center justify-center border-2 border-current/40 bg-bg-w/60 text-m3-title-large font-bold`}>
                                            {table}
                                        </span>
                                        {chairs(bottom)}

                                        <span className="text-m3-label-medium font-semibold">{blocked && order ? "Ocupada" : isCurrent ? "Mesa actual" : state.label}</span>
                                        <span className="flex items-center gap-1 text-m3-body-small opacity-80"><Users size={12} />{capacity} personas</span>
                                        {order ? (
                                            <span className="flex items-center gap-2 text-m3-body-small">
                                                <span>#{order.id}</span>
                                                <span className="flex items-center gap-1"><Clock size={12} />{minutesSince(order.createdAt)} min</span>
                                            </span>
                                        ) : (
                                            <span className="text-m3-body-small text-br-s800">{mode === "select" ? "Toca para elegirla" : canOpenFree ? "Toca para abrir orden" : "Sin permiso"}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </DetailModal>
    );
}
