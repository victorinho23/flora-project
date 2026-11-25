// src/features/auth/services/accessService.js
// Permisos del usuario que inicio sesion.
// El backend es el que de verdad bloquea (responde 403), aqui solo se usan para
// esconder vistas y botones que la persona no puede usar.
// Se vuelven a pedir al cambiar de pagina y cada 30 segundos, asi si el admin
// quita o da un permiso, la persona lo nota sin tener que cerrar sesion.

import { useCallback, useSyncExternalStore } from "react";
import { request } from "@/features/config";

const REFRESH_MS = 30000;

// lo que llega del login, mientras se piden los permisos frescos
const initial = () => {
    try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        return { permissions: new Set(user?.permissions ?? []), loadedAt: 0 };
    } catch {
        return { permissions: new Set(), loadedAt: 0 };
    }
};

let state = initial();
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());

// "*" = superusuario (el admin tiene todos). Set -> la pregunta es directa
export const can = (permission) => !permission || state.permissions.has("*") || state.permissions.has(permission);

// pide los permisos al backend; si pasaron menos de 5 segundos usa los que ya tiene
let pending = null;
export function refreshAccess({ force = false } = {}) {
    if (!sessionStorage.getItem("token")) return Promise.resolve();
    if (!force && Date.now() - state.loadedAt < 5000) return Promise.resolve();
    pending ??= request("/access/me")
        .then((access) => {
            state = { permissions: new Set(access.permissions), loadedAt: Date.now() };
            // se guardan tambien en la sesion para que al recargar no parpadee
            const user = JSON.parse(sessionStorage.getItem("user") ?? "{}");
            sessionStorage.setItem("user", JSON.stringify({ ...user, permissions: access.permissions }));
            emit();
        })
        .catch(() => {})
        .finally(() => { pending = null; });
    return pending;
}

// al iniciar o cerrar sesion se vuelve a leer lo guardado
export function resetAccess() {
    state = initial();
    emit();
}

const subscribe = (listener) => {
    listeners.add(listener);
    // mientras alguien use los permisos, se refrescan cada 30 segundos
    const timer = listeners.size === 1 ? setInterval(() => refreshAccess({ force: true }), REFRESH_MS) : null;
    if (timer) subscribe.timer = timer;
    return () => {
        listeners.delete(listener);
        if (!listeners.size) clearInterval(subscribe.timer);
    };
};

// si el backend responde 403 en cualquier peticion, se piden los permisos de nuevo
if (typeof window !== "undefined") {
    window.addEventListener("flora:forbidden", () => refreshAccess({ force: true }));
}

// hook para los componentes: se vuelven a pintar cuando cambian los permisos
// devuelve una funcion nueva cuando cambian los permisos, asi las tablas (useMemo) se vuelven a armar
export function useAccess() {
    const snapshot = useSyncExternalStore(subscribe, () => state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback((permission) => can(permission), [snapshot]);
}
