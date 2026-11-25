// src/features/orders/components/TablePickerModal.jsx
// Ventana para ver y elegir las mesas, usa el mismo DetailModal de los detalles
// - modo "browse" (lista de ordenes): mesa ocupada -> ver su orden, mesa libre -> crear orden
// - modo "select" (crear/editar orden): solo se pueden tocar las mesas libres, las ocupadas quedan bloqueadas
// El estado de las mesas se pide a la base cada vez que se abre, asi siempre esta al dia
import { useEffect, useMemo, useState } from "react";
import { Utensils, Clock, Users } from "lucide-react";
import { DetailModal } from "@/shared";
import { getTables, TOTAL_MESAS } from "../services/orderService";

// como se ve cada mesa segun su orden abierta
const TABLE_STATES = {
    LIBRE: { label: "Libre", tile: "bg-bg-w border-bd-s300 text-br-s950", dot: "bg-m3-outline" },
    ACTIVA: { label: "En cocina", tile: "bg-m3-secondary-container border-bd-t900 text-m3-on-secondary-container", dot: "bg-m3-secondary" },
    LISTA_PARA_ENTREGA: { label: "Lista para entregar", tile: "bg-m3-success-container border-m3-success text-m3-success", dot: "bg-m3-success" },
};

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
    const freeCount = tables.filter((table) => !openByTable.has(table)).length;

    return (
        <DetailModal
            open={open}
            onClose={onClose}
            icon={Utensils}
            title={mode === "select" ? "Elegir mesa" : "Mesas"}
            subtitle={loading ? "Cargando mesas..." : `${freeCount} de ${tableCount} mesas libres`}
            size="max-w-4xl"
            bodyClassName="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
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

            {tables.map((table) => {
                const order = openByTable.get(table);
                const state = TABLE_STATES[order?.status ?? "LIBRE"];
                const isCurrent = String(table) === String(currentTable);
                // al elegir mesa para una orden, las ocupadas se bloquean (menos la de la orden que se edita)
                // y en el plano de la lista, sin permiso de crear ordenes las mesas libres no se pueden abrir
                const ownTable = order && String(order.id) === String(currentOrderId);
                const blocked = (mode === "select" && order && !ownTable) || (mode === "browse" && !order && !canOpenFree);

                const handleClick = () => {
                    if (mode === "select") onPick(String(table));
                    else onPick(table, order);
                };

                return (
                    <button
                        key={table}
                        type="button"
                        onClick={handleClick}
                        disabled={blocked}
                        aria-pressed={mode === "select" ? isCurrent : undefined}
                        aria-label={order ? `Mesa ${table}, ${state.label}, orden ${order.id}${blocked ? ", ocupada" : ""}` : `Mesa ${table} libre`}
                        className={`m3-state relative flex flex-col items-start gap-1 min-h-28 p-4 text-left border rounded-m3-md shadow-m3-1 enabled:hover:shadow-m3-2 transition-shadow duration-200 ease-m3-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none ${state.tile} ${isCurrent && !blocked ? "ring-2 ring-m3-primary ring-offset-2" : ""}`}
                    >
                        <span className="flex w-full items-center justify-between gap-2">
                            <span className="text-m3-title-large font-bold">Mesa {table}</span>
                            <span className={`w-2.5 h-2.5 rounded-m3-full ${state.dot}`} />
                        </span>
                        <span className="text-m3-label-medium font-semibold">{blocked && order ? "Ocupada" : isCurrent ? "Mesa actual" : state.label}</span>
                        {/* zona y capacidad que se configuran en Configuracion */}
                        {info.get(table) && (
                            <span className="flex items-center gap-1 text-m3-body-small opacity-80">
                                <Users size={12} />{info.get(table).capacity} · {info.get(table).zone}
                            </span>
                        )}
                        {order ? (
                            <span className="mt-auto flex w-full items-center justify-between gap-2 text-m3-body-small">
                                <span>#{order.id} · ${(order.total ?? 0).toLocaleString("es-CO")}</span>
                                <span className="flex items-center gap-1"><Clock size={12} />{minutesSince(order.createdAt)} min</span>
                            </span>
                        ) : (
                            <span className="mt-auto text-m3-body-small text-br-s800">{mode === "select" ? "Toca para elegirla" : canOpenFree ? "Toca para abrir orden" : "Sin permiso para crear órdenes"}</span>
                        )}
                    </button>
                );
            })}
        </DetailModal>
    );
}
