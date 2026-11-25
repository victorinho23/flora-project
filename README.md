# Flora

Sistema web para el restaurante/café Flora: usuarios y permisos, menú, órdenes con mesas y comanda, inventario y proveedores.

| Carpeta | Qué es | Cómo arrancarlo |
| --- | --- | --- |
| [`backend`](backend/README.md) | API en Node + Express + PostgreSQL | `cd backend && npm install && npm run dev` |
| [`frontend`](frontend/README.md) | React + Vite + Tailwind (Material Design 3 con los tokens de Flora) | `cd frontend && npm install && npm run dev` |

Primero el backend (puerto 4000) y después el frontend (http://localhost:5173).

## Primera vez

1. Crear la base `flora` y correr las migraciones de `backend/src/databases/migrations` en orden (0001 a 0033).
2. Copiar las variables de entorno del backend (están en `backend/README.md`).
3. Si hay fotos viejas sueltas en `backend/uploads`, correr una vez `npm run organizar-uploads` dentro de `backend`.

## Imágenes

Cada módulo guarda sus fotos en su carpeta: `backend/uploads/usuarios`, `backend/uploads/menu` y `backend/uploads/inventario`.

## Licencia

Ver [LICENSE](LICENSE).
