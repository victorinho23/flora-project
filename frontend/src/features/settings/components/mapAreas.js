// src/features/settings/components/mapAreas.js
// lo que se puede pintar en el mapa del restaurante, con su icono y su color
// (en archivo aparte porque lo usan el mapa, el editor y la ventana de mesas del mesero)
import { useSyncExternalStore } from "react";
import { BrickWall, ChefHat, Wine, Bath, DoorOpen, Wallet, Sun, Trees } from "lucide-react";

// los mismos nombres que acepta el backend
export const AREAS = {
    pared: { label: "Pared", icon: BrickWall, cell: "bg-bg-s950 text-bg-w" },
    cocina: { label: "Cocina", icon: ChefHat, cell: "bg-m3-error-container text-m3-on-error-container" },
    barra: { label: "Barra", icon: Wine, cell: "bg-bg-t300 text-br-s950" },
    banos: { label: "Baños", icon: Bath, cell: "bg-m3-info-container text-m3-info" },
    entrada: { label: "Entrada", icon: DoorOpen, cell: "bg-m3-success text-bg-w" },
    caja: { label: "Caja", icon: Wallet, cell: "bg-bg-t800 text-bg-w" },
    terraza: { label: "Terraza", icon: Sun, cell: "bg-bg-p400 text-br-s950" },
    jardin: { label: "Jardín", icon: Trees, cell: "bg-bg-g800 text-bg-w" },
};

export const cellKey = (x, y) => `${x},${y}`;

// ===== vista realista =====
// cada zona con una textura que se parece a lo de verdad (madera, ladrillo, baldosa, pasto...)
// son solo fondos de css con los colores de Flora, no imagenes
const v = (name) => `var(--color-${name})`;
const mix = (color, percent, other = "transparent") => `color-mix(in srgb, ${color} ${percent}%, ${other})`;

// piso de madera: tablas a lo largo con una linea oscura entre cada una
export const REAL_FLOOR = {
    backgroundColor: v("bg-t100"),
    backgroundImage: `repeating-linear-gradient(90deg, transparent 0 calc(33.3% - 1px), ${mix(v("bg-t800"), 18)} calc(33.3% - 1px) 33.3%),
        linear-gradient(0deg, ${mix(v("bg-t300"), 25)}, transparent 60%)`,
};

export const REAL_AREAS = {
    // ladrillo oscuro: filas con juntas claras
    pared: {
        backgroundColor: v("bg-s950"),
        backgroundImage: `linear-gradient(0deg, ${mix(v("bg-w"), 14)} 1px, transparent 1px),
            linear-gradient(90deg, ${mix(v("bg-w"), 10)} 1px, transparent 1px)`,
        backgroundSize: "50% 25%, 50% 50%",
    },
    // baldosa de cocina en damero
    cocina: {
        backgroundColor: v("bg-w"),
        backgroundImage: `conic-gradient(${mix(v("m3-error"), 22)} 25%, transparent 0 50%, ${mix(v("m3-error"), 22)} 0 75%, transparent 0)`,
        backgroundSize: "50% 50%",
    },
    // barra de madera oscura
    barra: {
        backgroundColor: v("bg-t800"),
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0 calc(25% - 1px), ${mix(v("bg-s950"), 35)} calc(25% - 1px) 25%)`,
    },
    // baldosa azul clara con juntas blancas
    banos: {
        backgroundColor: v("m3-info-container"),
        backgroundImage: `linear-gradient(0deg, ${v("bg-w")} 1px, transparent 1px), linear-gradient(90deg, ${v("bg-w")} 1px, transparent 1px)`,
        backgroundSize: "33.3% 33.3%",
    },
    // tapete de entrada a rayas
    entrada: {
        backgroundColor: v("m3-success"),
        backgroundImage: `repeating-linear-gradient(45deg, transparent 0 0.25rem, ${mix(v("bg-w"), 18)} 0.25rem 0.5rem)`,
    },
    caja: {
        backgroundColor: v("bg-t800"),
        backgroundImage: `linear-gradient(135deg, ${mix(v("bg-w"), 12)}, transparent 70%)`,
    },
    // piedra de terraza en cuadros grandes
    terraza: {
        backgroundColor: v("bg-p400"),
        backgroundImage: `linear-gradient(0deg, ${mix(v("bg-s950"), 15)} 1px, transparent 1px), linear-gradient(90deg, ${mix(v("bg-s950"), 15)} 1px, transparent 1px)`,
        backgroundSize: "50% 50%",
    },
    // pasto con puntitos
    jardin: {
        backgroundColor: v("bg-g800"),
        backgroundImage: `radial-gradient(${mix(v("bg-w"), 22)} 1px, transparent 1.5px)`,
        backgroundSize: "0.5rem 0.5rem",
    },
};

// forma de la mesa segun cuantas personas caben:
// 1-2 redonda, 3-4 cuadrada, 5-6 rectangular, 7 o mas larga (tamaños en % de la celda)
export const tableShape = (capacity) => {
    if (capacity <= 2) return { kind: "redonda", w: 48, h: 48 };
    if (capacity <= 4) return { kind: "cuadrada", w: 50, h: 50 };
    if (capacity <= 6) return { kind: "rectangular", w: 66, h: 42 };
    return { kind: "larga", w: 80, h: 38 };
};

// donde va cada silla alrededor de la mesa (x, y en % de la celda y el giro de la silla)
export const chairsFor = (capacity) => {
    const count = Math.min(Math.max(Number(capacity) || 1, 1), 12);
    const { kind, w, h } = tableShape(count);
    const gap = 9; // que tan separada queda la silla del borde de la mesa

    // redonda: sillas repartidas en circulo
    if (kind === "redonda") {
        return Array.from({ length: count }, (_, i) => {
            const angle = (i * 360) / count - 90;
            const rad = (angle * Math.PI) / 180;
            const r = w / 2 + gap;
            return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad), turn: angle + 90 };
        });
    }

    // con esquinas: primero las puntas (izquierda y derecha) y el resto arriba y abajo
    // cuadrada: 3 -> 1 punta, 4 -> 2; rectangular: 5 -> 1, 6 -> 2; larga: siempre 2
    const ends = kind === "cuadrada" ? count - 2 : kind === "rectangular" ? count - 4 : 2;
    const sides = count - ends;
    const top = Math.ceil(sides / 2);
    const bottom = sides - top;
    const along = (n, y, turn) => Array.from({ length: n }, (_, i) => ({ x: 50 - w / 2 + (w * (i + 0.5)) / n, y, turn }));
    return [
        ...along(top, 50 - h / 2 - gap, 0),
        ...along(bottom, 50 + h / 2 + gap, 180),
        ...(ends >= 1 ? [{ x: 50 - w / 2 - gap, y: 50, turn: 270 }] : []),
        ...(ends >= 2 ? [{ x: 50 + w / 2 + gap, y: 50, turn: 90 }] : []),
    ];
};

// vista elegida para el mapa: "realista" (por defecto) o "clasica" (la de antes).
// se guarda en el navegador, asi cada quien deja la que le guste y se puede volver a la de antes cuando quiera
const STYLE_KEY = "flora-map-style";
const listeners = new Set();
const readStyle = () => {
    try {
        return localStorage.getItem(STYLE_KEY) === "clasica" ? "clasica" : "realista";
    } catch {
        return "realista";
    }
};
let mapStyle = readStyle();

export const setMapStyle = (style) => {
    mapStyle = style === "clasica" ? "clasica" : "realista";
    try {
        localStorage.setItem(STYLE_KEY, mapStyle);
    } catch {
        // si el navegador no deja guardar, igual cambia mientras la pagina este abierta
    }
    listeners.forEach((listener) => listener());
};

export function useMapStyle() {
    return useSyncExternalStore((listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, () => mapStyle);
}
