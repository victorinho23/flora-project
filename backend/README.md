# Backend de Flora

Node.js + Express + PostgreSQL. Misma estructura del proyecto de clase:
`features/<modulo>/` con `routes → controller → service → repository`.

## Arrancar

1. Crear la base de datos `flora` en pgAdmin y ejecutar las migraciones
   (`src/databases/migrations` en orden, o `src/databases/flora_todas_las_migraciones.sql` de una vez).
2. Revisar el archivo `.env` (puerto, usuario y contraseña de PostgreSQL). Hay un `.env.example` de guía.
3. En esta carpeta:

```bash
npm install
npm run dev
```

El backend queda en http://localhost:4000 y solo acepta peticiones del frontend en http://localhost:5173.

## Usuario inicial

- Correo: admin@flora.com
- Contraseña: Flora2026*

## Rutas

| Modulo | Ruta base |
| --- | --- |
| Login | /api/auth/login |
| Usuarios | /api/users |
| Grupos y permisos | /api/groups, /api/permissions, /api/access |
| Menú | /api/dishes, /api/categories |
| Órdenes | /api/orders |
| Inventario | /api/inventory, /api/brands |
| Proveedores | /api/suppliers |
