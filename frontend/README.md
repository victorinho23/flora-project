# Frontend de Flora

React + Vite + Tailwind v4. Corre en http://localhost:5173 y habla con el backend en http://localhost:4000/api
(la dirección está en `.env.development` → `VITE_API_URL`).

## Arrancar

```bash
npm install
npm run dev
```

## Estructura

| Carpeta | Qué tiene |
| --- | --- |
| `src/app` | `app.jsx` (cierre de sesión por inactividad) y `router.jsx` (todas las rutas) |
| `src/features/<módulo>` | páginas, formularios, modales y servicios de cada módulo (usuarios, menú, órdenes, inventario, proveedores, permisos) |
| `src/shared` | componentes que se reutilizan (Button, DataTable, DetailModal, Navbar, SearchField...) y esquemas de validación |
| `src/shared/reports` | generador de reportes PDF/Excel que usan todos los módulos (cada módulo deja sus campos en `features/<módulo>/reports/config`) |
| `src/styles` | tokens de diseño: `tokens.css` → `semantic.css` → `global.css` |

## Diseño (Material Design 3 con los tokens de Flora)

Los colores de la marca están en `tokens.css`. Encima va la capa de Material 3:

- **Roles de color** (`--md-sys-color-*` en `semantic.css`): primary, secondary, surface, outline, error, focus...
  En Tailwind se usan como `bg-m3-primary`, `text-m3-on-surface`, `ring-m3-focus`, etc.
- **Forma**: `rounded-m3-xs` (4px) a `rounded-m3-xl` (28px) y `rounded-m3-full`.
- **Elevación**: `shadow-m3-0` a `shadow-m3-5`.
- **Movimiento**: `ease-m3-standard`, `ease-m3-decelerate`.
- **Tipografía**: `text-m3-display-small`, `text-m3-headline-*`, `text-m3-title-*`, `text-m3-body-*`, `text-m3-label-*`.
- **Capa de estado**: la clase `m3-state` pone el velo de hover/foco/presionado de M3.
- **Modo oscuro**: solo cambian los roles en `:root[data-theme="dark"]`.

Contraste revisado con la fórmula de WCAG 2.1: todas las combinaciones de texto y fondo del proyecto pasan AA
(la mayoría AAA) y el anillo de foco tiene 7.4:1 sobre blanco.

## Navegación

El botón de volver siempre lleva a la página "padre": editar → detalle → listado → inicio.
Después de guardar, la página del formulario se reemplaza para que volver no regrese al formulario enviado.

## Órdenes

- Botón **Mesas** en la lista de órdenes: plano de mesas en una ventana (libre, en cocina, lista para entregar).
  El plano sale de la base, así todos los meseros ven lo mismo.
- Una mesa ocupada no se puede usar hasta que su orden se pague o se anule. En crear/editar orden,
  **Elegir mesa en el plano** solo deja tocar las libres y si escribes una ocupada sale el aviso y no deja guardar.
- Los filtros de categorías muestran **todas** las categorías del menú (las que tienen platillos primero).
- Buscador de platillos: sin tildes, varias palabras, `/` para buscar y `2 capuchino` + Enter para agregar rápido.
- La comanda se imprime desde el detalle de la orden (ticket de 80 mm).

## Permisos

- El backend revisa los permisos en la base en cada petición (no en el token), así que si a alguien le quitas un permiso o lo
  inhabilitas desde el panel, lo pierde al instante (la pantalla se actualiza sola en máximo 30 segundos o al cambiar de página).
- El frontend pide sus permisos a `GET /api/access/me` (`features/auth/services/accessService.js`) y con `can("codigo")`
  esconde botones, acciones de las tablas, enlaces del menú y bloquea las páginas (`ProtectedRoute permission=...`).
- Si el backend responde 403 los permisos se refrescan solos. El administrador (superusuario) lo tiene todo.

## Menú y categorías

- Cada módulo vive en su carpeta: listas de menú en `features/products/pages`, de órdenes en `features/orders/pages`,
  de proveedores en `features/suppliers/pages`.
- `/categories` (botón **Categorías** en la lista del menú): crear, renombrar e inhabilitar categorías.
- Crear platillo tiene vista previa en vivo con la misma tarjeta del inicio.
- El buscador de la barra de navegación entiende sinónimos ("platos", "comandas", "stock"...) y solo muestra a dónde puedes entrar.

## Páginas y ventanas

- Crear, ver y modificar (usuarios, menú, órdenes, inventario) son páginas propias.
- Lo que tiene poco contenido se abre en una ventana sin salir del listado:
  la **lupa** de inventario (consultar producto), las **categorías** del menú y el **plano de mesas**.
- Proveedores no tiene página de detalle, por eso su "ver" sigue en ventana.
