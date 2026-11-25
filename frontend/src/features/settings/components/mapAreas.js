// src/features/settings/components/mapAreas.js
// lo que se puede pintar en el mapa del restaurante, con su icono y su color
// (en archivo aparte porque lo usan el mapa, el editor y la ventana de mesas del mesero)
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

