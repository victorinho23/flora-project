// src/features/settings/components/RestaurantMap.jsx
// Dibuja el mapa del restaurante: una cuadricula donde cada celda puede ser piso, pared, cocina, barra...
// y encima las mesas en la celda donde las puso el administrador.
// Lo usan el editor de Configuracion (para pintar) y la ventana de mesas del mesero (para ubicarse)
import { useMemo } from "react";
import { AREAS, REAL_AREAS, REAL_FLOOR, cellKey, chairsFor, tableShape } from "./mapAreas";

// mesa vista desde arriba (vista realista): sillas alrededor segun la capacidad y la mesa con su forma.
// topClassName = colores de la mesa (el mesero la pinta segun el estado); rotation = 0 o 90 grados
// children = lo que va escrito encima (numero, tiempo...), que no se gira para que se lea derecho
// (la mesa con sus sillas se sale un poco de su celda para que se vea grande, como en un plano de verdad)
export function TableShape({ capacity, rotation = 0, topClassName = "bg-bg-t800 text-bg-w", children }) {
    const { kind, w, h } = tableShape(capacity);
    return (
        <span className="absolute -inset-1/4 flex items-center justify-center" style={{ transform: `rotate(${rotation}deg)` }}>
            <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 w-full h-full overflow-visible">
                {chairsFor(capacity).map((chair, index) => (
                    <rect
                        key={index}
                        x={chair.x - 7}
                        y={chair.y - 5}
                        width="14"
                        height="10"
                        rx="3.5"
                        transform={`rotate(${chair.turn} ${chair.x} ${chair.y})`}
                        className="fill-bg-t300 stroke-bg-t950"
                        strokeWidth="1.2"
                    />
                ))}
            </svg>
            <span
                className={`relative flex items-center justify-center shadow-m3-2 ${kind === "redonda" ? "rounded-m3-full" : "rounded-m3-xs"} ${topClassName}`}
                style={{ width: `${w}%`, height: `${h}%` }}
            >
                <span className="flex flex-col items-center justify-center leading-none" style={{ transform: `rotate(${-rotation}deg)` }}>
                    {children}
                </span>
            </span>
        </span>
    );
}

// cada zona pintada (celdas pegadas del mismo tipo) lleva su nombre una sola vez,
// en la celda mas cercana al centro de la zona. Las paredes no llevan nombre
function buildLabels(cells) {
    const labels = new Map();
    const seen = new Set();
    for (const [key, area] of Object.entries(cells)) {
        if (seen.has(key) || area === "pared") continue;
        // se recorre la zona completa desde esta celda
        const zone = [];
        const queue = [key];
        seen.add(key);
        while (queue.length) {
            const current = queue.pop();
            zone.push(current.split(",").map(Number));
            const [x, y] = zone[zone.length - 1];
            for (const next of [cellKey(x + 1, y), cellKey(x - 1, y), cellKey(x, y + 1), cellKey(x, y - 1)]) {
                if (!seen.has(next) && cells[next] === area) {
                    seen.add(next);
                    queue.push(next);
                }
            }
        }
        const cx = zone.reduce((sum, [x]) => sum + x, 0) / zone.length;
        const cy = zone.reduce((sum, [, y]) => sum + y, 0) / zone.length;
        const [bx, by] = zone.reduce((best, cell) => (Math.hypot(cell[0] - cx, cell[1] - cy) < Math.hypot(best[0] - cx, best[1] - cy) ? cell : best));
        labels.set(cellKey(bx, by), { area, big: zone.length >= 2 });
    }
    return labels;
}

// map: { cols, rows, cells: { "x,y": "cocina" } }
// tables: mesas con { number, x, y, capacity }
// renderTable(table, key, realistic): como se dibuja cada mesa (el editor y el mesero las pintan distinto;
// realistic = true en el mapa normal, para que la dibujen con TableShape; false solo cuando hay foto de fondo)
// cellProps(x, y): props extra de cada celda (el editor las usa para pintar con el mouse o el dedo)
// fitScreen: el mapa se achica lo necesario para verse completo en la pantalla sin bajar (ventana del mesero)
// photo: foto escaneada del negocio que va detras de la cuadricula para calcar encima (solo en el editor)
// minCell: lo minimo que mide cada celda (en rem) antes de deslizarse de lado; la vista previa del escaneo usa menos
// showGrid: en la vista realista se marcan suavemente las celdas (el editor lo usa para saber donde pinta)
export default function RestaurantMap({ map, tables = [], renderTable, cellProps, fitScreen = false, photo, minCell = 3, showGrid = false, className = "" }) {
    const { cols, rows, cells } = map;
    // el mapa siempre se ve realista; solo con la foto del escaneo de fondo va en cuadricula simple
    // para que se vea bien lo detectado y se pueda calcar encima
    const realistic = !photo;

    // mesa que hay en cada celda, para buscarla directo al dibujar
    const tableAt = useMemo(() => {
        const byCell = new Map();
        for (const table of tables) {
            if (table.x != null && table.y != null && table.x < cols && table.y < rows) byCell.set(cellKey(table.x, table.y), table);
        }
        return byCell;
    }, [tables, cols, rows]);

    const labels = useMemo(() => buildLabels(cells), [cells]);

    return (
        // en pantallas pequeñas el mapa no se aplasta: cada celda mide minimo 3rem y se desliza de lado
        <div className="overflow-x-auto">
            <div
                className={`relative grid select-none ${realistic ? "rounded-m3-lg border-4 border-bg-s950 shadow-m3-2 overflow-hidden" : "gap-px p-px rounded-m3-md bg-bd-s100 border border-bd-s300"} ${className}`}
                style={{
                    ...(realistic && REAL_FLOOR),
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    minWidth: `${cols * minCell}rem`,
                    ...(fitScreen && { width: "100%", maxWidth: `calc((100vh - 20rem) * ${cols / rows})`, marginInline: "auto" }),
                }}
            >
                {/* la foto se estira al tamaño de la cuadricula; el piso queda transparente para verla */}
                {photo && (
                    <img src={photo} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 w-full h-full object-fill opacity-60 rounded-m3-md" />
                )}
                {Array.from({ length: rows * cols }, (_, index) => {
                    const x = index % cols;
                    const y = Math.floor(index / cols);
                    const key = cellKey(x, y);
                    const area = AREAS[cells[key]];
                    const table = tableAt.get(key);
                    const label = labels.get(key);
                    const LabelIcon = label && AREAS[label.area].icon;

                    // realista: cada zona con su textura y el piso de madera se ve debajo (sin cuadricula)
                    const look = realistic
                        ? { className: `${area ? area.cell.split(" ").filter((name) => name.startsWith("text-")).join(" ") : "text-br-s950"} ${showGrid ? "outline outline-1 -outline-offset-1 outline-bg-s950/10" : ""}`, style: area ? REAL_AREAS[cells[key]] : undefined }
                        : { className: area ? area.cell : photo ? "bg-bg-w/30" : "bg-bg-w" };

                    return (
                        <div
                            key={key}
                            data-x={x}
                            data-y={y}
                            className={`relative aspect-square flex items-center justify-center ${look.className}`}
                            style={look.style}
                            {...cellProps?.(x, y)}
                        >
                            {/* nombre de la zona: sale por encima de las celdas vecinas para que se lea completo */}
                            {label && !table && (
                                <span className={`pointer-events-none absolute z-10 flex flex-col items-center gap-0.5 whitespace-nowrap text-m3-label-medium font-bold ${realistic ? "px-2 py-1 rounded-m3-sm bg-bg-s950/70 text-bg-w backdrop-blur-[2px]" : ""}`}>
                                    <LabelIcon size={18} aria-hidden="true" />
                                    {label.big && AREAS[label.area].label}
                                </span>
                            )}
                            {table && renderTable(table, key, realistic)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
