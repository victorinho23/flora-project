// src/features/orders/components/TablePickerModal.jsx
// Ventana con el mapa del restaurante que dibujo el administrador en Configuracion
// el mesero ve donde queda cada mesa y en que va: libre, en cocina o lista para entregar.
// Mesa ocupada -> ver su orden; mesa libre -> crear orden con esa mesa
// highlight: numero de mesa que se resalta (cuando se abre desde el detalle de una orden para saber a donde ir)
// El estado de las mesas se pide a la base cada vez que se abre, asi siempre esta al dia
import { useEffect, useMemo, useState } from "react";
import { Map as MapIcon, Clock, Users, Info } from "lucide-react";
import { DetailModal } from "@/shared";
import RestaurantMap from "@/features/settings/components/RestaurantMap";
import { AREAS } from "@/features/settings/components/mapAreas";
import { getTables, TOTAL_MESAS } from "../services/orderService";

// como se ve cada mesa segun su orden abierta
const TABLE_STATES = {
    LIBRE: { label: "Libre", tile: "bg-bg-w border-2 border-bd-s500 text-br-s950", dot: "bg-bg-w border-2 border-bd-s500" },
    ACTIVA: { label: "En cocina", tile: "bg-m3-secondary text-m3-on-secondary", dot: "bg-m3-secondary" },
    LISTA_PARA_ENTREGA: { label: "Lista para entregar", tile: "bg-m3-success text-bg-w", dot: "bg-m3-success" },
};

// tiempo que lleva abierta la orden, corto para que quepa en la mesa: 12 min, 2 h, 3 d
const timeSince = (date) => {
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} h`;
    return `${Math.floor(minutes / 1440)} d`;
};

// arma el diccionario mesa -> orden abierta, una sola vez por lista de ordenes
// despues saber si una mesa esta ocupada es una busqueda directa
function buildOpenByTable(orders) {
    const byTable = new Map();
    for (const order of orders) {
        if (order.status === "ACTIVA" || order.status === "LISTA_PARA_ENTREGA") byTable.set(Number(order.tableNumber), order);
    }
    return byTable;
}

export default function TablePickerModal({ open, onClose, onPick, canOpenFree = true, highlight }) {
    const [board, setBoard] = useState({ total: TOTAL_MESAS, tables: [], open: [], map: null });
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
    const map = board.map;

    // mesas que estan dentro del mapa y las que el administrador todavia no ha ubicado
    const inside = (table) => map && table.x != null && table.y != null && table.x < map.cols && table.y < map.rows;
    const onMap = board.tables.filter(inside);
    const offMap = board.tables.filter((table) => !inside(table));
    const freeCount = board.tables.filter((table) => !openByTable.has(Number(table.number))).length;

    // zonas pintadas en el mapa para la leyenda
    const usedAreas = useMemo(() => [...new Set(Object.values(map?.cells ?? {}))].filter((area) => AREAS[area]), [map]);

    // datos de cada mesa para dibujarla (en el mapa o en la lista de abajo)
    const describe = (table) => {
        const order = openByTable.get(Number(table.number));
        const state = TABLE_STATES[order?.status ?? "LIBRE"];
        // sin permiso de crear ordenes las mesas libres no se pueden abrir
        const blocked = !order && !canOpenFree;
        const isTarget = String(table.number) === String(highlight);
        return { order, state, blocked, isTarget };
    };

    const ariaLabel = (table, { order, state, blocked }) =>
        `Mesa ${table.number}, ${table.capacity} personas, ${order ? `${state.label}, orden ${order.id}` : blocked ? "libre, sin permiso para abrir orden" : "libre, toca para abrir orden"}`;

    // mesa dentro del mapa: un boton del color de su estado con el numero grande
    const renderTable = (table) => {
        const info = describe(table);
        const { order, state, blocked, isTarget } = info;
        return (
            <button
                type="button"
                onClick={() => onPick(table.number, order)}
                disabled={blocked}
                aria-label={ariaLabel(table, info)}
                className={`m3-state z-10 w-[86%] aspect-square flex flex-col items-center justify-center gap-0.5 rounded-m3-full shadow-m3-2 leading-none enabled:hover:shadow-m3-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus disabled:cursor-not-allowed disabled:opacity-60 ${state.tile} ${isTarget ? "ring-4 ring-m3-focus ring-offset-2 scale-110" : ""}`}
            >
                <span className="text-m3-title-large font-bold">{table.number}</span>
                <span className="text-[0.65rem] font-semibold opacity-90">{order ? timeSince(order.createdAt) : `${table.capacity}p`}</span>
            </button>
        );
    };

    return (
        <DetailModal
            open={open}
            onClose={onClose}
            icon={MapIcon}
            title={highlight ? `¿Dónde queda la mesa ${highlight}?` : "Mapa del restaurante"}
            subtitle={loading ? "Cargando mesas..." : `${freeCount} de ${board.tables.length} mesas libres · toca una mesa para ver o abrir su orden`}
            size="max-w-7xl"
            bodyClassName="grid-cols-1"
        >
            {/* convenciones: estados de las mesas y zonas pintadas */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-m3-label-large text-br-s900">
                {Object.entries(TABLE_STATES).map(([key, state]) => (
                    <span key={key} className="flex items-center gap-1.5">
                        <span className={`w-4 h-4 rounded-m3-full ${state.dot}`} />
                        {state.label}
                    </span>
                ))}
                {usedAreas.length > 0 && <span className="hidden sm:block w-px h-5 bg-bd-s300" aria-hidden="true" />}
                {usedAreas.map((area) => {
                    const { label, icon: Icon, cell } = AREAS[area];
                    return (
                        <span key={area} className="flex items-center gap-1.5">
                            <span className={`w-5 h-5 flex items-center justify-center rounded-m3-xs ${cell}`}><Icon size={12} /></span>
                            {label}
                        </span>
                    );
                })}
            </div>

            {onMap.length > 0 ? (
                <RestaurantMap map={map} tables={onMap} renderTable={renderTable} fitScreen />
            ) : (
                !loading && (
                    <p className="flex items-center gap-2 rounded-m3-md bg-m3-info-container text-m3-info px-4 py-3 text-m3-body-large font-medium">
                        <Info size={18} className="shrink-0" />
                        Todavía no hay mesas en el mapa. El administrador lo dibuja en Configuración → Mesas.
                    </p>
                )
            )}

            {/* mesas que no estan en el mapa: se pueden usar igual */}
            {offMap.length > 0 && (
                <div>
                    {onMap.length > 0 && <p className="mb-2 text-m3-title-small font-bold uppercase tracking-wider text-br-t950">Sin ubicar en el mapa</p>}
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-3">
                        {offMap.map((table) => {
                            const info = describe(table);
                            const { order, state, blocked, isTarget } = info;
                            return (
                                <button
                                    key={table.number}
                                    type="button"
                                    onClick={() => onPick(table.number, order)}
                                    disabled={blocked}
                                    aria-label={ariaLabel(table, info)}
                                    className={`m3-state flex flex-col items-center gap-1 p-3 rounded-m3-md shadow-m3-1 enabled:hover:shadow-m3-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus disabled:cursor-not-allowed disabled:opacity-60 ${state.tile} ${isTarget ? "ring-4 ring-m3-focus ring-offset-2" : ""}`}
                                >
                                    <span className="text-m3-title-large font-bold">Mesa {table.number}</span>
                                    <span className="text-m3-label-medium font-semibold">{state.label}</span>
                                    <span className="flex items-center gap-2 text-m3-body-small opacity-90">
                                        <span className="flex items-center gap-1"><Users size={12} />{table.capacity}</span>
                                        {order && <span className="flex items-center gap-1"><Clock size={12} />{timeSince(order.createdAt)}</span>}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </DetailModal>
    );
}
