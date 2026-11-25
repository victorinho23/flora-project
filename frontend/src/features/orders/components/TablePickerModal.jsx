// src/features/orders/components/TablePickerModal.jsx
// Ventana para ver y elegir las mesas, usa el mismo DetailModal de los detalles
// - modo "browse" (lista de ordenes): mesa con orden -> ver su orden; mesa sin orden -> abajo salen las acciones
//   (marcarla ocupada cuando se sientan los clientes, liberarla o tomar el pedido)
// - modo "select" (crear/editar orden): solo se pueden tocar las mesas libres, las ocupadas quedan bloqueadas
// El estado de las mesas se pide a la base al abrir y cada 15 segundos: el color de cada mesa
// va cambiando solo (libre, ocupada, esperando pedido, pedido listo, entregado, pidio la cuenta)
// Se dibuja como un plano: cada zona es un espacio del restaurante y cada mesa tiene sus sillas
// segun la capacidad, asi el mesero se ubica rapido y ve cuales estan libres.
// Arriba hay dos vistas: "Mesas" (las cajitas por zona) y "Mapa del negocio" (el que dibuja el administrador)
// highlight: numero de mesa que se resalta en el mapa (desde el detalle de una orden, para saber a donde ir)
import { useEffect, useMemo, useState } from "react";
import { Utensils, Clock, Users, DoorOpen, Trees, Wine, Building2, LayoutGrid, Map as MapIcon, Info, UserCheck, UserX, ClipboardPlus } from "lucide-react";
import { DetailModal, Button } from "@/shared";
import RestaurantMap from "@/features/settings/components/RestaurantMap";
import { AREAS } from "@/features/settings/components/mapAreas";
import { getTables, setTableOccupied, TOTAL_MESAS, TABLE_STATES, OPEN_STATUSES } from "../services/orderService";
import { showErrorAlert } from "@/shared/services/alertService";

// cada cuanto se vuelve a pedir el estado de las mesas mientras la ventana esta abierta
const REFRESH_MS = 15000;

// cada zona con su icono y el orden en que aparecen en el plano (las nuevas quedan al final)
const ZONE_ICONS = { "Salón": DoorOpen, "Terraza": Trees, "Barra": Wine, "Segundo piso": Building2 };
const ZONE_ORDER = Object.keys(ZONE_ICONS);

// sillas de la mesa: la mitad arriba y la mitad abajo
const chairsOf = (capacity = 4) => [Math.ceil(capacity / 2), Math.floor(capacity / 2)];

// mesas de 2 redondas, hasta 4 cuadradas y las grandes alargadas
const shapeOf = (capacity = 4) => (capacity <= 2 ? "w-14 rounded-m3-full" : capacity <= 4 ? "w-16 rounded-m3-md" : "w-24 rounded-m3-md");

// tiempo que lleva la mesa en su estado (desde que se abrio la orden o se sentaron), corto: 12 min, 2 h, 3 d
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
        if (OPEN_STATUSES.includes(order.status)) byTable.set(Number(order.tableNumber), order);
    }
    return byTable;
}

// currentOrderId: al editar, la orden que se esta editando (su propia mesa no se bloquea)
export default function TablePickerModal({ open, onClose, mode = "browse", currentTable, currentOrderId, onPick, canOpenFree = true, highlight }) {
    // vista elegida: cajitas por zona o el mapa del negocio. Mientras no se elija ninguna se abre en el mapa
    // si el administrador ya lo dibujo (asi el mesero lo conoce y se ubica), si no en las cajitas
    const [picked, setPicked] = useState(null);
    const setView = setPicked;
    // mesa sin orden que se toco en el modo "browse": abajo salen sus acciones
    const [selectedTable, setSelectedTable] = useState(null);
    const [saving, setSaving] = useState(false);
    const close = () => {
        setPicked(null);
        setPickedFloor(null);
        setSelectedTable(null);
        onClose();
    };

    // cuantas mesas tiene el restaurante y cuales estan ocupadas, segun el backend
    // todas las mesas empiezan libres; al llegar la respuesta se marcan las que tienen orden abierta
    const [board, setBoard] = useState({ total: TOTAL_MESAS, tables: [], open: [], maps: [] });
    // piso que se esta viendo en el mapa (si no se ha elegido se abre el de la mesa buscada o el primero con mesas)
    const [pickedFloor, setPickedFloor] = useState(null);
    const [loading, setLoading] = useState(true);

    // "version" sube cuando el mesero cambia algo, para volver a pedir las mesas de una
    const [version, setVersion] = useState(0);
    useEffect(() => {
        if (!open) return;
        let alive = true;
        const load = () => getTables().then((data) => {
            if (!alive) return;
            setBoard(data);
            setLoading(false);
        });
        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => {
            alive = false;
            clearInterval(timer);
        };
    }, [open, version]);

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
    // en que va la mesa: su orden abierta, o si no "ocupada" (clientes sentados) o "libre"
    const stateOf = (table) => {
        const order = openByTable.get(table);
        const since = info.get(table)?.occupiedSince;
        const key = order?.status ?? (since ? "OCUPADA" : "LIBRE");
        return { order, key, state: TABLE_STATES[key] ?? TABLE_STATES.ACTIVA, since: order?.createdAt ?? since };
    };
    const freeCount = tables.filter((table) => stateOf(table).key === "LIBRE").length;

    // mesas que el administrador ya puso en el mapa
    // mesas ubicadas en cada piso
    const floors = board.maps.map((floor) => ({
        ...floor,
        tables: board.tables.filter((table) => table.floorId === floor.id && table.x != null && table.y != null && table.x < floor.cols && table.y < floor.rows),
    }));
    const usedFloors = floors.filter((floor) => floor.tables.length > 0);
    const targetFloor = usedFloors.find((floor) => floor.tables.some((table) => String(table.number) === String(highlight)));
    const map = usedFloors.find((floor) => floor.id === pickedFloor) ?? targetFloor ?? usedFloors[0];
    const onMap = map?.tables ?? [];
    const view = picked ?? (highlight || onMap.length ? "map" : "tables");
    const usedAreas = [...new Set(Object.values(map?.cells ?? {}))].filter((area) => AREAS[area]);

    // estado de una mesa: su orden abierta, si esta bloqueada y que pasa al tocarla (igual en las dos vistas)
    const describe = (table) => {
        const { order, key, state, since } = stateOf(table);
        const ownTable = order && String(order.id) === String(currentOrderId);
        return {
            order,
            key,
            state,
            since,
            isCurrent: String(table) === String(currentTable),
            // al elegir mesa para una orden se bloquean las que ya tienen orden (menos la de la orden que se edita)
            blocked: mode === "select" && order && !ownTable,
            pick: () => {
                // mesa sin orden en la lista de ordenes: se muestran sus acciones abajo
                if (mode === "browse" && !order) return setSelectedTable(table);
                setPicked(null);
                setPickedFloor(null);
                setSelectedTable(null);
                return mode === "select" ? onPick(String(table)) : onPick(table, order);
            },
        };
    };

    // marcar la mesa ocupada (se sentaron) o liberarla (se fueron sin pedir)
    const changeOccupied = async (table, occupied) => {
        const id = info.get(table)?.id;
        if (!id) return;
        setSaving(true);
        try {
            await setTableOccupied(id, occupied);
            setSelectedTable(null);
            setVersion((value) => value + 1);
        } catch (err) {
            await showErrorAlert({ title: "No se pudo cambiar la mesa", text: err.message, confirmButtonText: "Entendido", timer: 4000 });
        } finally {
            setSaving(false);
        }
    };

    const selected = selectedTable != null ? { number: selectedTable, ...describe(selectedTable) } : null;

    // mesa dentro del mapa: circulo del color de su estado con el numero grande
    const renderMapTable = (info) => {
        const table = Number(info.number);
        const { order, state, since, isCurrent, blocked, pick } = describe(table);
        const isTarget = String(table) === String(highlight) || table === selectedTable;
        return (
            <button
                type="button"
                onClick={pick}
                disabled={blocked}
                aria-label={`Mesa ${table}, ${info.capacity} personas, ${state.label}${order ? `, orden ${order.id}` : ""}`}
                title={`Mesa ${table} · ${state.label}`}
                className={`m3-state relative z-10 w-[86%] aspect-square flex flex-col items-center justify-center gap-0.5 rounded-m3-full shadow-m3-2 leading-none transition-colors duration-300 enabled:hover:shadow-m3-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus disabled:cursor-not-allowed disabled:opacity-60 ${state.tile} ${isTarget || (isCurrent && !blocked) ? "ring-4 ring-m3-focus ring-offset-2 scale-110" : ""}`}
            >
                {/* punto que titila cuando alguien tiene que ir a la mesa */}
                {state.attention && (
                    <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 flex w-3.5 h-3.5">
                        <span className={`absolute inline-flex w-full h-full rounded-m3-full ${state.dot} opacity-75 animate-ping`} />
                        <span className={`relative inline-flex w-3.5 h-3.5 rounded-m3-full border-2 border-bg-w ${state.dot}`} />
                    </span>
                )}
                <span className="text-m3-title-large font-bold">{table}</span>
                <span className="text-[0.65rem] font-semibold opacity-90">{since ? timeSince(since) : `${info.capacity}p`}</span>
            </button>
        );
    };

    return (
        <DetailModal
            open={open}
            onClose={close}
            icon={Utensils}
            title={highlight ? `¿Dónde queda la mesa ${highlight}?` : mode === "select" ? "Elegir mesa en el plano" : "Plano de mesas"}
            subtitle={loading ? "Cargando mesas..." : `${freeCount} de ${tableCount} mesas libres`}
            size="max-w-7xl"
            bodyClassName="grid-cols-1"
        >
            {/* las dos vistas: cajitas por zona o el mapa del negocio */}
            <div className="col-span-full flex flex-wrap gap-2" role="group" aria-label="Vista de las mesas">
                {[["tables", "Mesas", LayoutGrid], ["map", "Mapa del negocio", MapIcon]].map(([id, label, Icon]) => (
                    <button
                        key={id}
                        type="button"
                        aria-pressed={view === id}
                        onClick={() => setView(id)}
                        className={`m3-state flex items-center gap-2 h-10 px-4 rounded-m3-full border text-m3-label-large font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${view === id ? "bg-m3-secondary-container text-m3-on-secondary-container border-transparent" : "bg-bg-w text-br-s950 border-bd-s300"}`}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>

            {/* convenciones de color */}
            <div className="col-span-full flex flex-wrap gap-x-4 gap-y-2 text-m3-label-medium text-br-s800">
                {Object.entries(TABLE_STATES).map(([key, state]) => (
                    <span key={key} className="flex items-center gap-1.5">
                        <span className={`w-3 h-3 rounded-m3-full ${state.dot}`} />
                        {state.label}
                    </span>
                ))}
            </div>

            {/* mapa del negocio: el que dibuja el administrador en Configuracion */}
            {view === "map" && (
                onMap.length > 0 ? (
                    <div className="col-span-full flex flex-col gap-3">
                        {/* pisos: solo salen si el negocio tiene mas de uno con mesas */}
                        {usedFloors.length > 1 && (
                            <div className="flex flex-wrap gap-2" role="group" aria-label="Pisos">
                                {usedFloors.map((floor) => (
                                    <button
                                        key={floor.id}
                                        type="button"
                                        aria-pressed={floor.id === map.id}
                                        onClick={() => setPickedFloor(floor.id)}
                                        className={`m3-state h-9 px-4 rounded-m3-full border text-m3-label-large font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${floor.id === map.id ? "bg-bg-s950 text-bg-w border-transparent" : "bg-bg-w text-br-s950 border-bd-s300"}`}
                                    >
                                        {floor.name}
                                        <span className="ml-1.5 opacity-80">({floor.tables.length})</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {usedAreas.length > 0 && (
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-m3-label-medium text-br-s800">
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
                        )}
                        <RestaurantMap map={map} tables={onMap} renderTable={renderMapTable} fitScreen />
                    </div>
                ) : (
                    <p className="col-span-full flex items-center gap-2 rounded-m3-md bg-m3-info-container text-m3-info px-4 py-3 text-m3-body-large font-medium">
                        <Info size={18} className="shrink-0" />
                        {loading ? "Cargando el mapa..." : "Todavía no hay mesas en el mapa. El administrador lo dibuja en Configuración → Mesas."}
                    </p>
                )
            )}

            {/* plano: una seccion por zona del restaurante */}
            {view === "tables" && zones.map(({ zone, list }) => {
                const ZoneIcon = ZONE_ICONS[zone] ?? Utensils;
                const free = list.filter((table) => stateOf(table).key === "LIBRE").length;
                return (
                    <section key={zone} aria-label={`Zona ${zone}`} className="col-span-full rounded-m3-lg border-2 border-dashed border-bd-t300 bg-bg-p50 p-4">
                        <h3 className="flex items-center gap-2 mb-3 text-m3-title-medium font-bold text-br-t950">
                            <ZoneIcon size={18} />
                            {zone}
                            <span className="ml-auto text-m3-label-medium font-semibold text-br-s800">{free} de {list.length} libres</span>
                        </h3>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
                            {list.map((table) => {
                                const { order, state, since, isCurrent, blocked, pick } = describe(table);
                                const capacity = info.get(table)?.capacity ?? 4;
                                const [top, bottom] = chairsOf(capacity);
                                const handleClick = pick;

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
                                        aria-label={`Mesa ${table}, ${capacity} personas, ${state.label}${order ? `, orden ${order.id}` : ""}`}
                                        className={`m3-state relative flex flex-col items-center gap-1.5 p-3 border rounded-m3-md shadow-m3-1 enabled:hover:shadow-m3-2 transition-[box-shadow,background-color] duration-300 ease-m3-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none ${state.box} ${(isCurrent && !blocked) || table === selectedTable ? "ring-2 ring-m3-primary ring-offset-2" : ""}`}
                                    >
                                        {state.attention && (
                                            <span aria-hidden="true" className="absolute top-2 right-2 flex w-3 h-3">
                                                <span className={`absolute inline-flex w-full h-full rounded-m3-full ${state.dot} opacity-75 animate-ping`} />
                                                <span className={`relative inline-flex w-3 h-3 rounded-m3-full ${state.dot}`} />
                                            </span>
                                        )}
                                        {/* la mesa dibujada con sus sillas */}
                                        {chairs(top)}
                                        <span className={`${shapeOf(capacity)} h-11 flex items-center justify-center border-2 border-current/40 bg-bg-w/60 text-m3-title-large font-bold`}>
                                            {table}
                                        </span>
                                        {chairs(bottom)}

                                        <span className="text-m3-label-medium font-semibold text-center">{blocked && order ? `Ocupada · ${state.label.toLowerCase()}` : isCurrent ? "Mesa actual" : state.label}</span>
                                        <span className="flex items-center gap-1 text-m3-body-small opacity-80"><Users size={12} />{capacity} personas</span>
                                        {since ? (
                                            <span className="flex items-center gap-2 text-m3-body-small">
                                                {order && <span>#{order.id}</span>}
                                                <span className="flex items-center gap-1"><Clock size={12} />{timeSince(since)}</span>
                                            </span>
                                        ) : (
                                            <span className="text-m3-body-small text-br-s800">{mode === "select" ? "Toca para elegirla" : "Toca para ver opciones"}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                );
            })}
            {/* acciones de la mesa sin orden que se toco: queda pegado abajo para no tener que bajar */}
            {selected && mode === "browse" && (
                <div className="col-span-full sticky bottom-0 z-20 -mx-6 -mb-6 px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 border-t border-bd-s100 bg-bg-w shadow-m3-3">
                    <p className="flex items-center gap-2 text-m3-title-medium font-bold text-br-s950">
                        <span className={`w-3.5 h-3.5 rounded-m3-full ${selected.state.dot}`} />
                        Mesa {selected.number} · {selected.state.label}
                        {selected.since && <span className="text-m3-body-medium font-normal text-br-s800">desde hace {timeSince(selected.since)}</span>}
                    </p>
                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:ml-auto [&_button]:w-full sm:[&_button]:w-auto">
                        <Button size="md" variant="contorno" type="button" onClick={() => setSelectedTable(null)}>
                            Cerrar
                        </Button>
                        {selected.key === "LIBRE" ? (
                            <Button size="md" variant="contorno" type="button" disabled={saving} onClick={() => changeOccupied(selected.number, true)}>
                                <UserCheck size={16} />
                                Marcar ocupada
                            </Button>
                        ) : (
                            <Button size="md" variant="contorno" type="button" disabled={saving} onClick={() => changeOccupied(selected.number, false)}>
                                <UserX size={16} />
                                Liberar mesa
                            </Button>
                        )}
                        {canOpenFree && (
                            <Button size="md" variant="espresso" type="button" onClick={() => { const table = selected.number; setSelectedTable(null); onPick(table, null); }}>
                                <ClipboardPlus size={16} />
                                Tomar pedido
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </DetailModal>
    );
}
