// src/features/settings/components/RestaurantMapEditor.jsx
// Editor del mapa del restaurante (Configuracion -> Mesas)
// el administrador elige una herramienta y pinta las celdas arrastrando el mouse o el dedo:
// paredes, cocina, barra, baños, entrada... y despues pone cada mesa en su lugar.
// Asi el mesero, con solo mirar el mapa, sabe a donde tiene que ir
import { useEffect, useMemo, useRef, useState } from "react";
import { Eraser, Armchair, Map as MapIcon, RotateCcw, RotateCw, Save, Trash2, Camera, ScanLine, ImageOff, Layers, Undo2 } from "lucide-react";
import { Button, Select, Input } from "@/shared";
import RestaurantMap, { TableShape } from "./RestaurantMap";
import { AREAS, cellKey } from "./mapAreas";
import { showConfirmAlert, showConfirmDeleteAlert, showErrorAlert, showSuccesAlert } from "@/shared/services/alertService";
import { readPhoto } from "../services/scanService";
import MapScanModal from "./MapScanModal";

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

// posiciones de las mesas de este piso que vienen de la base: id -> { x, y, rotation }
const positionsOf = (tables, floorId) => new Map(
    tables.filter((table) => table.floorId === floorId && table.x != null && table.y != null).map((table) => [table.id, { x: table.x, y: table.y, rotation: table.rotation ?? 0 }]),
);

// map: el piso guardado { id, name, cols, rows, cells }; tables: todas las mesas; floors: todos los pisos (para avisar
// cuales mesas estan en otro piso); onSave(datos): guarda el piso; onDelete: borra el piso (no llega si es el unico)
// canEdit: si puede pintar. La pagina le cambia la key cada vez que recarga, asi el borrador vuelve a empezar desde lo guardado
export default function RestaurantMapEditor({ map, tables, floors = [], onSave, onDelete, canEdit }) {
    const [draft, setDraft] = useState(map);
    const [positions, setPositions] = useState(() => positionsOf(tables, map.id));
    // piso donde esta cada mesa que no es de este, para marcarla en la lista (ej: "P2")
    const floorLabel = useMemo(() => new Map(floors.map((floor, index) => [floor.id, `P${index + 1}`])), [floors]);
    const [tool, setTool] = useState("pared");
    const [selectedId, setSelectedId] = useState(null);
    const [dirty, setDirty] = useState(false);
    const painting = useRef(false);
    // foto escaneada (ya enderezada): queda de fondo para calcar
    const [photo, setPhoto] = useState(null);
    // foto recien tomada que se esta escaneando en la ventana
    const [scanPhoto, setScanPhoto] = useState(null);
    // como estaba el mapa antes de aplicar el escaneo, para poder deshacerlo
    const [beforeScan, setBeforeScan] = useState(null);
    const photoInput = useRef(null);
    // ultima celda pintada: si el mouse va rapido se salta celdas, asi que se rellena la linea entre las dos
    const lastCell = useRef(null);
    // mesa que se esta arrastrando con el mouse o el dedo
    const dragTable = useRef(null);

    // al soltar el mouse o el dedo en cualquier parte se deja de pintar
    useEffect(() => {
        const stop = () => {
            painting.current = false;
            dragTable.current = null;
        };
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
        setPositions((prev) => new Map(prev).set(selectedId, { rotation: 0, ...prev.get(selectedId), x, y }));
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
                const here = tableAt.get(cellKey(x, y));
                // con cualquier herramienta (menos borrar) una mesa se agarra y se arrastra a otra celda
                if (here && tool !== "borrar") {
                    dragTable.current = here.id;
                    setSelectedId(here.id);
                    return;
                }
                if (tool === "mesa") return placeTable(x, y);
                painting.current = true;
                lastCell.current = [x, y];
                paint(x, y);
            },
            // arrastrando una mesa: se mueve a la celda donde esta el puntero si esta libre (no se monta sobre otra)
            onPointerMove: () => {
                const id = dragTable.current;
                if (!id) return;
                const current = positions.get(id);
                if (current?.x === x && current?.y === y) return;
                if (tableAt.has(cellKey(x, y))) return;
                setPositions((prev) => new Map(prev).set(id, { rotation: 0, ...prev.get(id), x, y }));
                setDirty(true);
            },
            onPointerEnter: () => {
                if (dragTable.current) return;
                if (!painting.current || tool === "mesa") return;
                paintLine(lastCell.current ?? [x, y], [x, y]);
                lastCell.current = [x, y];
            },
        })
        : undefined;

    // foto nueva (camara o galeria): se abre la ventana para marcar las esquinas y revisar el resultado
    const handlePhoto = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            await showErrorAlert({ title: "Ese archivo no es una foto", text: "Usa una foto JPG, PNG o WEBP", confirmButtonText: "Entendido", timer: 4000 });
            return;
        }
        try {
            setScanPhoto(await readPhoto(file));
        } catch (err) {
            await showErrorAlert({ title: "No se pudo abrir la foto", text: err.message, confirmButtonText: "Entendido", timer: 4000 });
        }
    };

    // pone el escaneo en el mapa: reemplaza las paredes, agrega las salidas en celdas vacias
    // y deja las demas zonas pintadas como estaban
    const applyScan = async ({ cols, rows, walls, exits, photo: straight }) => {
        setBeforeScan({ draft, photo });
        setDraft((prev) => {
            const cells = Object.fromEntries(Object.entries(prev.cells).filter(([, area]) => area !== "pared"));
            exits.forEach((key) => { cells[key] ??= "entrada"; });
            walls.forEach((key) => { cells[key] = "pared"; });
            return { ...prev, cols, rows, cells };
        });
        setPhoto(straight);
        setScanPhoto(null);
        setDirty(true);
        await showSuccesAlert({ title: "Escaneo aplicado", text: "Revisa, pinta lo que falte (cocina, barra, baños...) y pon las mesas. No se guarda hasta que toques Guardar mapa.", timer: 3500 });
    };

    const undoScan = () => {
        setDraft(beforeScan.draft);
        setPhoto(beforeScan.photo);
        setBeforeScan(null);
    };

    const changeSize = (e) => {
        setDraft((prev) => ({ ...prev, [e.target.name]: Number(e.target.value) }));
        setDirty(true);
    };

    // gira la mesa elegida (vista realista): acostada <-> parada
    const rotateSelected = () => {
        setPositions((prev) => {
            const current = prev.get(selectedId);
            if (!current) return prev;
            return new Map(prev).set(selectedId, { ...current, rotation: current.rotation === 90 ? 0 : 90 });
        });
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
            text: `Los meseros verán ${draft.name} al buscar las mesas. ${tables.length - unplaced.length} mesa(s) quedan en este piso.`,
            confirmButtonText: "Guardar mapa",
        });
        if (!result.isConfirmed) return;
        await onSave({
            name: draft.name,
            cols: draft.cols,
            rows: draft.rows,
            cells: draft.cells,
            tables: [...positions.entries()].map(([id, position]) => ({ id, ...position })),
        });
    };

    // mensaje de ayuda segun la herramienta
    const selected = placed.find((table) => table.id === selectedId);
    const hint = tool === "mesa"
        ? selected ? `Toca una celda para poner la mesa ${selected.number}, o arrastra cualquier mesa del mapa para moverla.` : "Elige una mesa de la lista para ponerla, o arrastra una mesa del mapa para moverla."
        : tool === "borrar" ? "Arrastra sobre el mapa para borrar zonas o quitar mesas." : `Arrastra sobre el mapa para pintar: ${AREAS[tool].label}. Las mesas se mueven arrastrándolas.`;

    // mesa dibujada en el editor: la mesa con sus sillas, o un circulo con su numero cuando hay foto de fondo
    const renderTable = (table, key, realistic) => realistic ? (
        <span className={`pointer-events-none relative z-10 w-full h-full ${table.active ? "" : "opacity-50"}`}>
            <TableShape
                capacity={table.capacity}
                rotation={table.rotation}
                topClassName={`bg-bg-t800 text-bg-w ${table.id === selectedId ? "ring-3 ring-m3-focus ring-offset-1" : ""}`}
            >
                {/* las sillas ya dicen cuantas personas caben, solo va el numero */}
                <span className="text-m3-title-medium font-bold">{table.number}</span>
            </TableShape>
        </span>
    ) : (
        <span
            className={`pointer-events-none z-10 w-[78%] aspect-square flex flex-col items-center justify-center rounded-m3-full bg-bg-t900 text-bg-w shadow-m3-1 leading-none ${table.active ? "" : "opacity-50"} ${table.id === selectedId ? "ring-3 ring-m3-focus ring-offset-1" : ""}`}
        >
            <span className="text-m3-title-medium font-bold">{table.number}</span>
            <span className="text-m3-label-small font-semibold opacity-80">{table.capacity}p</span>
        </span>
    );

    return (
        <section aria-label={`Mapa: ${draft.name}`} className="rounded-m3-lg border border-bd-s100 bg-bg-w shadow-m3-2 overflow-hidden">
            {/* encabezado de la tarjeta con las acciones del mapa */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-4 bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950">
                <MapIcon size={22} className="text-br-t100" />
                <div className="min-w-0">
                    <h2 className="text-m3-title-large font-bold text-bg-w">{draft.name}</h2>
                    <p className="text-sm text-br-p100">
                        {canEdit ? "Pinta tu negocio y pon cada mesa donde está; los meseros lo ven al buscar las mesas." : "Así ven los meseros el restaurante."}
                    </p>
                </div>
                {canEdit && (
                    <div className="flex flex-wrap items-center gap-2 ml-auto">
                        {onDelete && (
                            <Button size="sm" variant="crema" type="button" onClick={onDelete}>
                                <Layers size={16} />
                                Eliminar piso
                            </Button>
                        )}
                        {/* el aviso siempre ocupa su espacio (invisible si no hay cambios) para que el mapa no salte al pintar */}
                        <span aria-hidden={!dirty} className={`px-3 py-1 rounded-m3-sm bg-m3-secondary-container text-m3-on-secondary-container text-m3-label-medium font-semibold ${dirty ? "" : "invisible"}`}>Cambios sin guardar</span>
                        <Button size="sm" variant="crema" type="button" onClick={handleClear}>
                            <Trash2 size={16} />
                            Limpiar
                        </Button>
                        <Button size="sm" variant="crema" type="button" disabled={!dirty} onClick={() => { setDraft(map); setPositions(positionsOf(tables, map.id)); setDirty(false); }}>
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
                        {/* nombre del piso: es lo que ve el mesero en las pestañas del mapa */}
                        <div className="[&_.w-80]:w-full">
                            <Input
                                type="text"
                                name="floorName"
                                label="Nombre del piso"
                                htmlFor={`floor-name-${map.id}`}
                                variant="latte"
                                value={draft.name}
                                maxLength={40}
                                onChange={(e) => {
                                    setDraft((prev) => ({ ...prev, name: e.target.value }));
                                    setDirty(true);
                                }}
                            />
                        </div>

                        {/* escanear: foto del plano o croquis del negocio con la camara del celular o desde la galeria */}
                        <div className="flex flex-col gap-2 rounded-m3-md border border-dashed border-bd-t800 bg-bg-p50 p-3">
                            <p className="flex items-center gap-2 text-m3-title-small font-bold uppercase tracking-wider text-br-t950">
                                <ScanLine size={16} />
                                Escanear el negocio
                            </p>
                            <p className="text-m3-body-small text-br-s800">
                                Foto del mapa de evacuación, de un croquis o captura de una app de planos. Marcas las esquinas, las paredes se detectan solas y la foto queda de fondo para terminar de pintar.
                            </p>
                            <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                            <Button size="md" variant="caramelo" type="button" onClick={() => photoInput.current?.click()}>
                                <Camera size={16} />
                                {photo ? "Escanear otra foto" : "Tomar o subir foto"}
                            </Button>
                            {(photo || beforeScan) && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button size="sm" variant="contorno" type="button" disabled={!beforeScan} onClick={undoScan}>
                                        <Undo2 size={14} />
                                        Deshacer
                                    </Button>
                                    <Button size="sm" variant="contorno" type="button" disabled={!photo} onClick={() => setPhoto(null)}>
                                        <ImageOff size={14} />
                                        Quitar foto
                                    </Button>
                                </div>
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
                                        className={`m3-state flex items-center gap-2 h-12 px-2 rounded-m3-sm border text-left text-m3-label-large font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${tool === id ? "border-bd-t900 bg-m3-secondary-container text-m3-on-secondary-container ring-1 ring-bd-t900" : "border-bd-s300 bg-bg-w text-br-s950"}`}
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
                                <span className="normal-case tracking-normal text-m3-label-medium font-semibold text-br-s800">{tables.length - unplaced.length} en este piso</span>
                            </p>
                            <div className="grid grid-cols-4 sm:grid-cols-8 xl:grid-cols-4 gap-2">
                                {placed.map((table) => {
                                    const missing = unplaced.includes(table);
                                    // mesa ubicada en otro piso: si se pone aqui, se pasa a este piso al guardar
                                    const elsewhere = missing && table.floorId && table.floorId !== map.id ? floorLabel.get(table.floorId) : null;
                                    return (
                                        <button
                                            key={table.id}
                                            type="button"
                                            onClick={() => pickTable(table)}
                                            aria-pressed={table.id === selectedId}
                                            aria-label={`Mesa ${table.number}, ${elsewhere ? `en el piso ${elsewhere}` : missing ? "sin ubicar" : "en este piso"}${table.active ? "" : ", deshabilitada"}`}
                                            className={`m3-state relative h-12 rounded-m3-sm text-m3-label-large font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${missing ? "border-2 border-dashed border-bd-t800 bg-bg-p50 text-br-t950" : "border border-transparent bg-bg-t900 text-bg-w"} ${table.id === selectedId ? "ring-3 ring-m3-focus ring-offset-1" : ""} ${table.active ? "" : "opacity-50"}`}
                                        >
                                            {table.number}
                                            {elsewhere && <span className="absolute -top-1.5 -right-1.5 px-1 rounded-m3-xs bg-bg-s950 text-bg-w text-m3-label-small leading-4">{elsewhere}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                            {/* girar la mesa elegida (se nota en la vista realista) */}
                            {selected && positions.has(selected.id) && (
                                <div className="mt-3">
                                    <Button size="sm" variant="contorno" type="button" onClick={rotateSelected}>
                                        <RotateCw size={14} />
                                        Girar mesa {selected.number}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </aside>
                )}

                <div className="min-w-0">
                <RestaurantMap
                    map={draft}
                    tables={placed}
                    renderTable={renderTable}
                    cellProps={cellProps}
                    photo={photo}
                    minCell={2.5}
                    showGrid={canEdit}
                    className={canEdit ? `touch-none ${tool === "mesa" ? "cursor-pointer" : "cursor-crosshair"}` : ""}
                />
                </div>
            </div>
            <MapScanModal photo={scanPhoto} onClose={() => setScanPhoto(null)} onApply={applyScan} />
        </section>
    );
}
