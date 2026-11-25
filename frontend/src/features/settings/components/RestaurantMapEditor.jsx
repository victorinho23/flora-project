// src/features/settings/components/RestaurantMapEditor.jsx
// Editor del mapa del restaurante (Configuracion -> Mesas)
// el administrador elige una herramienta y pinta las celdas arrastrando el mouse o el dedo:
// paredes, cocina, barra, baños, entrada... y despues pone cada mesa en su lugar.
// Asi el mesero, con solo mirar el mapa, sabe a donde tiene que ir
import { useEffect, useMemo, useRef, useState } from "react";
import { Eraser, Armchair, Map as MapIcon, RotateCcw, Save, Trash2, Camera, ScanLine, ImageOff } from "lucide-react";
import { Button, Select } from "@/shared";
import RestaurantMap from "./RestaurantMap";
import { AREAS, cellKey } from "./mapAreas";
import { showConfirmAlert, showConfirmDeleteAlert, showErrorAlert, showSuccesAlert } from "@/shared/services/alertService";
import { readPhoto, detectWalls, suggestSize } from "../services/scanService";

const SENSITIVITY_OPTIONS = [
    { value: "baja", label: "Baja (solo líneas gruesas)" },
    { value: "media", label: "Media" },
    { value: "alta", label: "Alta (líneas delgadas)" },
];

// opciones de tamaño del mapa (los mismos limites del backend)
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => ({ value: String(from + index), label: String(from + index) }));
const COL_OPTIONS = range(8, 30);
const ROW_OPTIONS = range(6, 20);

// herramientas: las zonas que se pintan, el borrador y la de poner mesas
const TOOLS = [
    ...Object.entries(AREAS).map(([id, area]) => ({ id, label: area.label, icon: area.icon, swatch: area.cell })),
    { id: "borrar", label: "Borrar", icon: Eraser, swatch: "bg-bg-w text-br-s950 border border-bd-s300" },
    { id: "mesa", label: "Mesas", icon: Armchair, swatch: "bg-bg-t900 text-bg-w" },
];

// posiciones de las mesas que vienen de la base: id -> { x, y }
const positionsOf = (tables) => new Map(tables.filter((table) => table.x != null && table.y != null).map((table) => [table.id, { x: table.x, y: table.y }]));

// map: el mapa guardado; tables: todas las mesas; onSave(datos): guarda en el backend; canEdit: si puede pintar
// la pagina le cambia la key cada vez que recarga de la base, asi el borrador vuelve a empezar desde lo guardado
export default function RestaurantMapEditor({ map, tables, onSave, canEdit }) {
    const [draft, setDraft] = useState(map);
    const [positions, setPositions] = useState(() => positionsOf(tables));
    const [tool, setTool] = useState("pared");
    const [selectedId, setSelectedId] = useState(null);
    const [dirty, setDirty] = useState(false);
    const painting = useRef(false);
    // foto escaneada: queda de fondo para calcar y de ella se sacan las paredes
    const [photo, setPhoto] = useState(null);
    const [sensitivity, setSensitivity] = useState("media");
    const [scanning, setScanning] = useState(false);
    const photoInput = useRef(null);
    // ultima celda pintada: si el mouse va rapido se salta celdas, asi que se rellena la linea entre las dos
    const lastCell = useRef(null);

    // al soltar el mouse o el dedo en cualquier parte se deja de pintar
    useEffect(() => {
        const stop = () => { painting.current = false; };
        window.addEventListener("pointerup", stop);
        return () => window.removeEventListener("pointerup", stop);
    }, []);

    // mesas con su celda del borrador, para dibujarlas en el mapa
    const placed = useMemo(() => tables.map((table) => ({ ...table, ...(positions.get(table.id) ?? { x: null, y: null }) })), [tables, positions]);
    const tableAt = useMemo(() => new Map(placed.filter((table) => table.x != null).map((table) => [cellKey(table.x, table.y), table])), [placed]);
    const unplaced = placed.filter((table) => table.x == null || table.x >= draft.cols || table.y >= draft.rows);

    // celdas de la linea recta entre dos celdas (para no dejar huecos al arrastrar rapido)
    const lineCells = ([x0, y0], [x1, y1]) => {
        const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
        return Array.from({ length: steps + 1 }, (_, index) => [
            Math.round(x0 + ((x1 - x0) * index) / (steps || 1)),
            Math.round(y0 + ((y1 - y0) * index) / (steps || 1)),
        ]);
    };

    // pinta (o borra) varias celdas de una vez con la herramienta elegida
    const paintLine = (from, to) => {
        const keys = lineCells(from, to).map(([x, y]) => cellKey(x, y));
        if (tool === "borrar") {
            const removed = keys.map((key) => tableAt.get(key)).filter(Boolean);
            if (removed.length) {
                setPositions((prev) => {
                    const next = new Map(prev);
                    removed.forEach((table) => next.delete(table.id));
                    return next;
                });
            }
            setDraft((prev) => {
                const cells = { ...prev.cells };
                keys.forEach((key) => delete cells[key]);
                return { ...prev, cells };
            });
        } else {
            setDraft((prev) => ({ ...prev, cells: { ...prev.cells, ...Object.fromEntries(keys.map((key) => [key, tool])) } }));
        }
        setDirty(true);
    };

    // pinta (o borra) una sola celda
    const paint = (x, y) => paintLine([x, y], [x, y]);

    // herramienta de mesas: tocar una mesa la elige; tocar una celda libre pone ahi la mesa elegida
    const placeTable = (x, y) => {
        const here = tableAt.get(cellKey(x, y));
        if (here) {
            setSelectedId(here.id);
            return;
        }
        if (!selectedId) return;
        setPositions((prev) => new Map(prev).set(selectedId, { x, y }));
        setDirty(true);
        // sigue con la siguiente mesa que falte por ubicar, asi se ponen todas rapido
        const nextTable = unplaced.find((table) => table.id !== selectedId);
        setSelectedId(nextTable?.id ?? null);
    };

    // eventos de cada celda: se pinta al presionar y al pasar por encima con el boton presionado
    const cellProps = canEdit
        ? (x, y) => ({
            onPointerDown: (e) => {
                // sin esto, en celulares el dedo queda "pegado" a la primera celda y no se puede arrastrar
                e.currentTarget.releasePointerCapture?.(e.pointerId);
                if (tool === "mesa") return placeTable(x, y);
                painting.current = true;
                lastCell.current = [x, y];
                paint(x, y);
            },
            onPointerEnter: () => {
                if (!painting.current || tool === "mesa") return;
                paintLine(lastCell.current ?? [x, y], [x, y]);
                lastCell.current = [x, y];
            },
        })
        : undefined;

    // busca las lineas oscuras de la foto y las pinta como pared (las paredes de antes se reemplazan)
    const scanWalls = async (src, cols, rows, level) => {
        setScanning(true);
        try {
            const walls = await detectWalls(src, cols, rows, level);
            setDraft((prev) => {
                const cells = Object.fromEntries(Object.entries(prev.cells).filter(([, area]) => area !== "pared"));
                walls.forEach((key) => { cells[key] = "pared"; });
                return { ...prev, cols, rows, cells };
            });
            setDirty(true);
            return walls.length;
        } finally {
            setScanning(false);
        }
    };

    // foto nueva (camara o galeria): se ajusta el tamaño del mapa a su forma y se detectan las paredes solas
    const handlePhoto = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            await showErrorAlert({ title: "Ese archivo no es una foto", text: "Usa una foto JPG, PNG o WEBP", confirmButtonText: "Entendido", timer: 4000 });
            return;
        }
        try {
            const src = await readPhoto(file);
            const size = await suggestSize(src);
            setPhoto(src);
            const found = await scanWalls(src, size.cols, size.rows, sensitivity);
            await showSuccesAlert({
                title: "Negocio escaneado",
                text: found ? `Se marcaron ${found} celdas de pared. Revisa, corrige con las herramientas y pon las mesas.` : "No se encontraron paredes; prueba con sensibilidad alta o calca encima de la foto.",
                timer: 3500,
            });
        } catch (err) {
            await showErrorAlert({ title: "No se pudo escanear", text: err.message, confirmButtonText: "Entendido", timer: 4000 });
        }
    };

    const changeSize = (e) => {
        setDraft((prev) => ({ ...prev, [e.target.name]: Number(e.target.value) }));
        setDirty(true);
    };

    const pickTable = (table) => {
        setTool("mesa");
        setSelectedId(table.id);
    };

    const handleClear = async () => {
        const result = await showConfirmDeleteAlert({
            title: "¿Limpiar el mapa?",
            text: "Se borra todo lo pintado y las mesas quedan sin ubicar. No se guarda hasta que toques Guardar mapa.",
            confirmButtonText: "Limpiar",
        });
        if (!result.isConfirmed) return;
        setDraft((prev) => ({ ...prev, cells: {} }));
        setPositions(new Map());
        setDirty(true);
    };

    const handleSave = async () => {
        const result = await showConfirmAlert({
            title: "¿Guardar el mapa?",
            text: `Los meseros verán este mapa al buscar las mesas. ${unplaced.length ? `${unplaced.length} mesa(s) quedan sin ubicar.` : "Todas las mesas están ubicadas."}`,
            confirmButtonText: "Guardar mapa",
        });
        if (!result.isConfirmed) return;
        await onSave({
            cols: draft.cols,
            rows: draft.rows,
            cells: draft.cells,
            tables: [...positions.entries()].map(([id, position]) => ({ id, ...position })),
        });
    };

    // mensaje de ayuda segun la herramienta
    const selected = placed.find((table) => table.id === selectedId);
    const hint = tool === "mesa"
        ? selected ? `Toca una celda para poner la mesa ${selected.number}. Toca una mesa del mapa para moverla.` : "Elige una mesa de la lista o toca una del mapa para moverla."
        : tool === "borrar" ? "Arrastra sobre el mapa para borrar zonas o quitar mesas." : `Arrastra sobre el mapa para pintar: ${AREAS[tool].label}.`;

    // mesa dibujada en el editor: circulo con su numero
    const renderTable = (table) => (
        <span
            className={`pointer-events-none z-10 w-[78%] aspect-square flex flex-col items-center justify-center rounded-m3-full bg-bg-t900 text-bg-w shadow-m3-1 leading-none ${table.active ? "" : "opacity-50"} ${table.id === selectedId ? "ring-3 ring-m3-focus ring-offset-1" : ""}`}
        >
            <span className="text-m3-title-medium font-bold">{table.number}</span>
            <span className="text-[0.6rem] font-semibold opacity-80">{table.capacity}p</span>
        </span>
    );

    return (
        <section aria-label="Mapa del restaurante" className="rounded-m3-lg border border-bd-s100 bg-bg-w shadow-m3-2 overflow-hidden">
            {/* encabezado de la tarjeta con las acciones del mapa */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-4 bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950">
                <MapIcon size={22} className="text-br-t100" />
                <div className="min-w-0">
                    <h2 className="text-m3-title-large font-bold text-bg-w">Mapa del restaurante</h2>
                    <p className="text-sm text-br-p100">
                        {canEdit ? "Pinta tu negocio y pon cada mesa donde está; los meseros lo ven al buscar las mesas." : "Así ven los meseros el restaurante."}
                    </p>
                </div>
                {canEdit && (
                    <div className="flex flex-wrap items-center gap-2 ml-auto">
                        {dirty && <span className="px-3 py-1 rounded-m3-sm bg-m3-secondary-container text-m3-on-secondary-container text-m3-label-medium font-semibold">Cambios sin guardar</span>}
                        <Button size="sm" variant="crema" type="button" onClick={handleClear}>
                            <Trash2 size={16} />
                            Limpiar
                        </Button>
                        <Button size="sm" variant="crema" type="button" disabled={!dirty} onClick={() => { setDraft(map); setPositions(positionsOf(tables)); setDirty(false); }}>
                            <RotateCcw size={16} />
                            Descartar
                        </Button>
                        <Button size="sm" variant="caramelo" type="button" disabled={!dirty} onClick={handleSave}>
                            <Save size={16} />
                            Guardar mapa
                        </Button>
                    </div>
                )}
            </div>

            <div className={`grid gap-5 p-5 ${canEdit ? "xl:grid-cols-[17rem_minmax(0,1fr)]" : ""}`}>
                {canEdit && (
                    <aside className="flex flex-col gap-5">
                        {/* escanear: foto del plano o croquis del negocio con la camara del celular o desde la galeria */}
                        <div className="flex flex-col gap-2 rounded-m3-md border border-dashed border-bd-t800 bg-bg-p50 p-3">
                            <p className="flex items-center gap-2 text-m3-title-small font-bold uppercase tracking-wider text-br-t950">
                                <ScanLine size={16} />
                                Escanear el negocio
                            </p>
                            <p className="text-m3-body-small text-br-s800">
                                Toma una foto desde arriba del plano o de un croquis del local. Las paredes se marcan solas y la foto queda de fondo para terminar de pintar.
                            </p>
                            <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                            <Button size="md" variant="caramelo" type="button" disabled={scanning} onClick={() => photoInput.current?.click()}>
                                <Camera size={16} />
                                {scanning ? "Escaneando..." : photo ? "Escanear otra foto" : "Tomar o subir foto"}
                            </Button>
                            {photo && (
                                <>
                                    <div className="[&_.w-80]:w-full">
                                        <Select
                                            label="Sensibilidad"
                                            name="sensitivity"
                                            htmlFor="scan-sensitivity"
                                            value={sensitivity}
                                            placeholder={false}
                                            options={SENSITIVITY_OPTIONS}
                                            onChange={(e) => setSensitivity(e.target.value)}
                                            variant="latte"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button size="sm" variant="contorno" type="button" disabled={scanning} onClick={() => scanWalls(photo, draft.cols, draft.rows, sensitivity)}>
                                            <ScanLine size={14} />
                                            Detectar
                                        </Button>
                                        <Button size="sm" variant="contorno" type="button" onClick={() => setPhoto(null)}>
                                            <ImageOff size={14} />
                                            Quitar foto
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* herramientas */}
                        <div>
                            <p className="mb-2 text-m3-title-small font-bold uppercase tracking-wider text-br-t950">Herramientas</p>
                            <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-2 gap-2" role="group" aria-label="Herramienta para pintar">
                                {TOOLS.map(({ id, label, icon: Icon, swatch }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        aria-pressed={tool === id}
                                        onClick={() => setTool(id)}
                                        className={`m3-state flex items-center gap-2 h-11 px-2 rounded-m3-sm border text-left text-m3-label-large font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${tool === id ? "border-bd-t900 bg-m3-secondary-container text-m3-on-secondary-container ring-1 ring-bd-t900" : "border-bd-s300 bg-bg-w text-br-s950"}`}
                                    >
                                        <span className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-m3-xs ${swatch}`}>
                                            <Icon size={15} />
                                        </span>
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-2 text-m3-body-small text-br-s800" aria-live="polite">{hint}</p>
                        </div>

                        {/* tamaño de la cuadricula */}
                        <div className="grid grid-cols-2 gap-3 [&_.w-80]:w-full">
                            <Select label="Columnas" name="cols" htmlFor="map-cols" value={String(draft.cols)} placeholder={false} options={COL_OPTIONS} onChange={changeSize} variant="latte" />
                            <Select label="Filas" name="rows" htmlFor="map-rows" value={String(draft.rows)} placeholder={false} options={ROW_OPTIONS} onChange={changeSize} variant="latte" />
                        </div>

                        {/* mesas: las que faltan por ubicar van con borde punteado */}
                        <div>
                            <p className="mb-2 flex items-center justify-between text-m3-title-small font-bold uppercase tracking-wider text-br-t950">
                                Mesas
                                <span className="normal-case tracking-normal text-m3-label-medium font-semibold text-br-s800">{tables.length - unplaced.length} de {tables.length} ubicadas</span>
                            </p>
                            <div className="grid grid-cols-4 sm:grid-cols-8 xl:grid-cols-4 gap-2">
                                {placed.map((table) => {
                                    const missing = unplaced.includes(table);
                                    return (
                                        <button
                                            key={table.id}
                                            type="button"
                                            onClick={() => pickTable(table)}
                                            aria-pressed={table.id === selectedId}
                                            aria-label={`Mesa ${table.number}, ${missing ? "sin ubicar" : "ubicada"}${table.active ? "" : ", deshabilitada"}`}
                                            className={`m3-state h-11 rounded-m3-sm text-m3-label-large font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${missing ? "border-2 border-dashed border-bd-t800 bg-bg-p50 text-br-t950" : "border border-transparent bg-bg-t900 text-bg-w"} ${table.id === selectedId ? "ring-3 ring-m3-focus ring-offset-1" : ""} ${table.active ? "" : "opacity-50"}`}
                                        >
                                            {table.number}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>
                )}

                <RestaurantMap
                    map={draft}
                    tables={placed}
                    renderTable={renderTable}
                    cellProps={cellProps}
                    photo={photo}
                    className={canEdit ? `touch-none ${tool === "mesa" ? "cursor-pointer" : "cursor-crosshair"}` : ""}
                />
            </div>
        </section>
    );
}
