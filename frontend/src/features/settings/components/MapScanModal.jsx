// src/features/settings/components/MapScanModal.jsx
// Ventana para escanear el negocio desde una foto, en dos pasos:
// 1. el administrador arrastra las 4 esquinas sobre el plano de la foto (asi se endereza si se tomo torcida)
// 2. ve el resultado sobre la cuadricula y ajusta la sensibilidad, el tamaño y las salidas antes de aplicarlo
import { useEffect, useMemo, useRef, useState } from "react";
import { ScanLine, ArrowLeft, ArrowRight, Check, Maximize, Crosshair } from "lucide-react";
import { Button, Select, Checkbox, DetailModal } from "@/shared";
import RestaurantMap from "./RestaurantMap";
import { straightenPhoto, analyzePhoto, cellsFromAnalysis, suggestSize, detectCorners, SENSITIVITY } from "../services/scanService";

// esquinas por defecto: casi toda la foto (arriba-izq, arriba-der, abajo-der, abajo-izq), en proporciones 0..1
const DEFAULT_CORNERS = [[0.04, 0.04], [0.96, 0.04], [0.96, 0.96], [0.04, 0.96]];
const FULL_CORNERS = [[0, 0], [1, 0], [1, 1], [0, 1]];
const CORNER_NAMES = ["arriba a la izquierda", "arriba a la derecha", "abajo a la derecha", "abajo a la izquierda"];

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => ({ value: String(from + index), label: String(from + index) }));
const COL_OPTIONS = range(8, 30);
const ROW_OPTIONS = range(6, 20);

// photo: la foto tal cual llego de la camara o la galeria
// onApply({ cols, rows, walls, exits, photo }): pone el resultado en el mapa (photo = la foto enderezada)
export default function MapScanModal({ photo, onClose, onApply }) {
    const [step, setStep] = useState("corners");
    const [corners, setCorners] = useState(DEFAULT_CORNERS);
    const [dragging, setDragging] = useState(null);
    const [working, setWorking] = useState(false);
    const [error, setError] = useState("");
    // "buscando" mientras se buscan las esquinas solas, "encontradas" o "manual" si no se pudo
    const [autoCorners, setAutoCorners] = useState("buscando");
    const frame = useRef(null);

    // resultado del paso 2
    const [straight, setStraight] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [size, setSize] = useState({ cols: 20, rows: 12 });
    const [level, setLevel] = useState("3");
    const [withExits, setWithExits] = useState(true);

    // cada vez que llega otra foto se empieza de nuevo
    const [lastPhoto, setLastPhoto] = useState(photo);
    if (photo !== lastPhoto) {
        setLastPhoto(photo);
        setStep("corners");
        setCorners(DEFAULT_CORNERS);
        setStraight(null);
        setAnalysis(null);
        setError("");
        setAutoCorners("buscando");
    }

    // busca las esquinas de la hoja (la persona igual las puede mover despues)
    // "intento" sube cada vez que se toca Buscar esquinas otra vez
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        if (!photo) return;
        let alive = true;
        detectCorners(photo)
            .then((found) => {
                if (!alive) return;
                if (found) setCorners(found);
                setAutoCorners(found ? "encontradas" : "manual");
            })
            .catch(() => alive && setAutoCorners("manual"));
        return () => { alive = false; };
    }, [photo, attempt]);

    // mover una esquina con el mouse o el dedo (posicion en proporcion de la foto)
    const moveTo = (index, clientX, clientY) => {
        const box = frame.current?.getBoundingClientRect();
        if (!box) return;
        const x = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
        const y = Math.min(1, Math.max(0, (clientY - box.top) / box.height));
        setCorners((prev) => prev.map((point, i) => (i === index ? [x, y] : point)));
    };

    // con el teclado las flechas mueven la esquina un poquito (1%)
    const nudge = (index, e) => {
        const step = { ArrowLeft: [-0.01, 0], ArrowRight: [0.01, 0], ArrowUp: [0, -0.01], ArrowDown: [0, 0.01] }[e.key];
        if (!step) return;
        e.preventDefault();
        setCorners((prev) => prev.map((point, i) => (i === index ? [Math.min(1, Math.max(0, point[0] + step[0])), Math.min(1, Math.max(0, point[1] + step[1]))] : point)));
    };

    // paso 1 -> 2: se endereza la foto y se analiza una sola vez
    const goPreview = async () => {
        setWorking(true);
        setError("");
        try {
            const result = await straightenPhoto(photo, corners);
            const data = await analyzePhoto(result.src);
            setStraight(result.src);
            setAnalysis(data);
            setSize(suggestSize(result.width, result.height));
            setStep("preview");
        } catch (err) {
            setError(err.message || "No se pudo escanear la foto");
        } finally {
            setWorking(false);
        }
    };

    // celdas detectadas: se recalculan al instante al cambiar sensibilidad, tamaño o salidas
    const result = useMemo(
        () => (analysis ? cellsFromAnalysis(analysis, size.cols, size.rows, level, withExits) : { walls: [], exits: [] }),
        [analysis, size, level, withExits],
    );
    const preview = useMemo(() => ({
        cols: size.cols,
        rows: size.rows,
        cells: Object.fromEntries([...result.exits.map((key) => [key, "entrada"]), ...result.walls.map((key) => [key, "pared"])]),
    }), [result, size]);

    // al soltar en cualquier parte se deja de arrastrar
    useEffect(() => {
        const stop = () => setDragging(null);
        window.addEventListener("pointerup", stop);
        return () => window.removeEventListener("pointerup", stop);
    }, []);

    const polygon = corners.map(([x, y]) => `${x * 100},${y * 100}`).join(" ");

    return (
        <DetailModal
            open={Boolean(photo)}
            onClose={onClose}
            icon={ScanLine}
            title="Escanear el negocio"
            subtitle={step === "corners" ? "Paso 1 de 2 · Marca las esquinas del plano" : "Paso 2 de 2 · Revisa el resultado"}
            size="max-w-6xl"
            bodyClassName="grid-cols-1"
            footer={false}
            closeOnBackdrop={false}
        >
            {step === "corners" && (
                <div className="flex flex-col gap-4">
                    {/* aviso de la deteccion automatica */}
                    <p
                        aria-live="polite"
                        className={`self-start flex items-center gap-2 px-3 py-1.5 rounded-m3-sm text-m3-label-large font-semibold ${autoCorners === "encontradas" ? "bg-m3-success-container text-m3-success" : autoCorners === "manual" ? "bg-m3-secondary-container text-m3-on-secondary-container" : "bg-bg-s50 text-br-s900"}`}
                    >
                        <Crosshair size={16} />
                        {autoCorners === "buscando" && "Buscando las esquinas de la hoja..."}
                        {autoCorners === "encontradas" && "Encontramos la hoja sola. Revisa que los puntos estén en las esquinas."}
                        {autoCorners === "manual" && "No se encontró la hoja sola: arrastra los puntos a las esquinas."}
                    </p>
                    <p className="text-m3-body-medium text-br-s800">
                        Arrastra los 4 puntos a las esquinas del plano si hace falta. Si la foto quedó torcida o de lado, se endereza sola; lo que quede por fuera (mesa, dedos, pared) no se tiene en cuenta.
                    </p>

                    {/* foto con las 4 esquinas encima */}
                    <div className="flex justify-center">
                        <div
                            ref={frame}
                            className="relative inline-block touch-none select-none"
                            onPointerMove={(e) => dragging !== null && moveTo(dragging, e.clientX, e.clientY)}
                        >
                            <img src={photo} alt="Foto del plano" className="block max-h-[55vh] max-w-full rounded-m3-md" draggable={false} />
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                                <polygon points={polygon} className="fill-bg-t300/25 stroke-bg-t900" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
                            </svg>
                            {corners.map(([x, y], index) => (
                                <button
                                    key={CORNER_NAMES[index]}
                                    type="button"
                                    aria-label={`Esquina ${CORNER_NAMES[index]}, muévela con las flechas`}
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        setDragging(index);
                                    }}
                                    onKeyDown={(e) => nudge(index, e)}
                                    style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-m3-full border-[3px] border-bg-w bg-bg-t900 shadow-m3-2 cursor-grab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${dragging === index ? "scale-125 cursor-grabbing" : ""}`}
                                />
                            ))}
                        </div>
                    </div>

                    {error && <p role="alert" className="text-sm self-start px-2 py-0.5 rounded bg-m3-error-container text-m3-on-error-container font-medium">{error}</p>}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 [&_button]:w-full sm:[&_button]:w-auto">
                        <Button size="md" variant="contorno" type="button" onClick={() => { setAutoCorners("buscando"); setAttempt((value) => value + 1); }}>
                            <Crosshair size={16} />
                            Buscar esquinas otra vez
                        </Button>
                        <Button size="md" variant="contorno" type="button" onClick={() => setCorners(FULL_CORNERS)}>
                            <Maximize size={16} />
                            Usar la foto completa
                        </Button>
                        <Button size="md" variant="espresso" type="button" disabled={working} onClick={goPreview}>
                            {working ? "Escaneando..." : "Siguiente"}
                            {!working && <ArrowRight size={16} />}
                        </Button>
                    </div>
                </div>
            )}

            {step === "preview" && analysis && (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
                    {/* resultado: la foto enderezada de fondo y lo detectado encima */}
                    <RestaurantMap map={preview} photo={straight} renderTable={() => null} minCell={1.25} />

                    <div className="flex flex-col gap-4 [&_.w-80]:w-full">
                        <p className="text-m3-body-medium text-br-s800">
                            Se marcaron <b>{result.walls.length}</b> celdas de pared{withExits && <> y <b>{result.exits.length}</b> de salida</>}. Cambia la sensibilidad si faltan paredes o sobran puntos.
                        </p>
                        <Select label="Sensibilidad" name="scanLevel" htmlFor="scan-level" value={level} placeholder={false} options={SENSITIVITY} onChange={(e) => setLevel(e.target.value)} variant="latte" />
                        <div className="grid grid-cols-2 gap-3">
                            <Select label="Columnas" name="scanCols" htmlFor="scan-cols" value={String(size.cols)} placeholder={false} options={COL_OPTIONS} onChange={(e) => setSize((prev) => ({ ...prev, cols: Number(e.target.value) }))} variant="latte" />
                            <Select label="Filas" name="scanRows" htmlFor="scan-rows" value={String(size.rows)} placeholder={false} options={ROW_OPTIONS} onChange={(e) => setSize((prev) => ({ ...prev, rows: Number(e.target.value) }))} variant="latte" />
                        </div>
                        <Checkbox
                            id="scan-exits"
                            name="scanExits"
                            label="Marcar lo verde como Entrada (salidas del mapa de evacuación)"
                            checked={withExits}
                            onChange={(e) => setWithExits(e.target.checked)}
                            variant="latte"
                        />
                        <p className="text-m3-body-small text-br-s800">Al aplicar se reemplazan las paredes del piso; la cocina, barra y demás zonas que ya pintaste se quedan.</p>

                        <div className="mt-auto flex flex-col gap-3 [&_button]:w-full">
                            <Button size="md" variant="espresso" type="button" onClick={() => onApply({ ...size, ...result, photo: straight })}>
                                <Check size={16} />
                                Aplicar al mapa
                            </Button>
                            <Button size="md" variant="contorno" type="button" onClick={() => setStep("corners")}>
                                <ArrowLeft size={16} />
                                Volver a las esquinas
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DetailModal>
    );
}
