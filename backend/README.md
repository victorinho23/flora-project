# Backend de Flora

Node.js + Express + PostgreSQL. Misma estructura del proyecto de clase:
`features/<modulo>/` con `routes → controller → service → repository`.

## Arrancar

1. Crear la base de datos `flora` en pgAdmin y ejecutar las migraciones
   (`src/databases/migrations` en orden, de la 0001 a la 0032).
2. Revisar el archivo `.env` (puerto, usuario y contraseña de PostgreSQL y, si quieres correos de verdad, los datos SMTP de abajo).
3. En esta carpeta:

```bash
npm install
npm run dev
```

El backend queda en http://localhost:4000 y solo acepta peticiones del frontend en http://localhost:5173.

## Usuario inicial

La migración `0023_insert_usuario_admin.sql` crea el administrador inicial (ahí está su correo).
Su contraseña inicial la tiene el líder del proyecto; **cámbiala apenas entres**.

## Variables del `.env`

| Variable | Para qué | Por defecto |
| --- | --- | --- |
| `PORT` | puerto del backend | 4000 |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | conexión a PostgreSQL | — |
| `JWT_SECRET` | firma de los tokens (usa una frase larga y secreta) | — |
| `JWT_EXPIRES` | duración de la sesión | 8h |
| `FRONTEND_URL` | única dirección que puede llamar al backend (CORS) | http://localhost:5173 |
| `PUBLIC_URL` | dirección con la que se arman las URLs de las imágenes | http://localhost:4000 |
| `SMTP_HOST`, `SMTP_PORT` | servidor de correo para mandar el código de recuperar contraseña (ej: `smtp.gmail.com`, `587`) | — |
| `SMTP_USER`, `SMTP_PASS` | cuenta que manda el correo (en Gmail se usa una "contraseña de aplicación", no la normal) | — |
| `MAIL_FROM` | nombre y correo que ve quien recibe | `Flora <SMTP_USER>` |

Si no pones los datos `SMTP_*`, el código de recuperación se muestra en la consola del backend (sirve para probar).

## Seguridad

- Contraseñas cifradas con bcrypt y sesión con JWT.
- Cada petición revisa en la base (con caché de 30 s que se borra al cambiar permisos)
  que el usuario esté activo y tenga el permiso de la ruta. El superusuario tiene todos.
- Recuperar contraseña: código de 6 números cifrado en la base, vence en 10 minutos, se anula a los 5 intentos malos
  y solo se usa una vez. Siempre se responde lo mismo exista o no el correo, y máximo 5 pedidos cada 15 minutos por equipo.
- Login: 3 intentos fallidos bloquean la cuenta 15 minutos, y máximo 10 intentos cada 15 minutos por equipo (IP).
  El mensaje no dice si el correo existe.
- Las imágenes se revisan por su contenido (no solo por la extensión) y la foto vieja se borra al cambiarla.
- Los errores internos responden "Error interno del servidor" sin detalles; el detalle queda en la consola.
- Cabeceras de seguridad en todas las respuestas (nosniff, sin iframes, sin `x-powered-by`).

## Rutas

| Modulo | Ruta base |
| --- | --- |
| Login | /api/auth/login |
| Recuperar contraseña | /api/auth/forgot-password → /api/auth/verify-code → /api/auth/reset-password |
| Historial (registro de cambios) | GET /api/changes/:tabla/:id (ej: /api/changes/usuario/2) |
| Mesas (Configuración) | /api/tables (GET, POST, PUT /:id, PATCH /:id/status, DELETE /:id) |
| Usuarios | /api/users |
| Grupos y permisos | /api/groups, /api/permissions, /api/access |
| Menú | /api/dishes, /api/categories |
| Órdenes | /api/orders (PATCH /api/orders/:id/status para el flujo de la comanda) |
| Inventario | /api/inventory, /api/brands |
| Proveedores | /api/suppliers |

## Imágenes

Cada módulo guarda sus fotos en su propia carpeta dentro de `uploads/`
(se crean solas al arrancar el servidor):

| Módulo | Carpeta |
| --- | --- |
| Usuarios | `uploads/usuarios` |
| Menú | `uploads/menu` |
| Inventario | `uploads/inventario` |

Las imágenes viejas que quedaron sueltas en `uploads/` siguen funcionando igual.

## Flujo de las órdenes (comanda)

`ACTIVA` (en cocina) → `LISTA_PARA_ENTREGA` → `PAGADA`.
Una orden lista puede volver a `ACTIVA` si a la mesa le faltó algo. Cada cambio queda en `registro_cambios`.

La migración `0026_create_index_orden_mesa.sql` agrega el índice para encontrar rápido la orden abierta de cada mesa.
La migración `0027_insert_mas_categorias.sql` agrega 20 categorías más para el menú (si ya existe una con el mismo nombre no la repite).
La migración `0028_create_index_mesa_ocupada.sql` hace que la base no deje tener dos órdenes abiertas en la misma mesa.
La migración `0029_alter_usuario_recuperacion.sql` agrega al usuario los datos del código para recuperar la contraseña.
La migración `0030_create_mesa.sql` crea la tabla de mesas (con las 12 de antes en el salón) y los permisos `mesas_*`.
La migración `0031_insert_permiso_asignar_mesero.sql` agrega el permiso para cambiar el mesero de una orden (solo el administrador).
La migración `0032_alter_user_permissions_permitido.sql` deja que un permiso individual dé o quite: los permisos de un usuario son los de su grupo + los que se le dieron − los que se le quitaron.

## Mesas

- Una mesa está **ocupada** mientras tenga una orden en cocina (`ACTIVA`) o lista para entregar (`LISTA_PARA_ENTREGA`).
- Mientras esté ocupada no se puede abrir otra orden en ella ni pasar otra orden a esa mesa (responde 409).
  Lo que falte se agrega editando la orden que ya tiene.
- Queda libre cuando su orden se **paga** o se **anula**.
- Si dos meseros guardan la misma mesa al mismo tiempo, la base acepta solo una (índice único de la migración 0028).
- Las mesas se crean, editan, desactivan o eliminan en **Configuración** (`/settings`). Una mesa con orden abierta no se puede desactivar ni cambiar de número, y solo se elimina si nunca ha tenido órdenes.
- `GET /api/orders/tables` devuelve `{ total, tables, open }`: las mesas activas con su zona y capacidad, y las órdenes abiertas con su mesa.

## Imágenes por módulo

Cada módulo guarda sus fotos en su propia carpeta:

| Módulo | Carpeta |
| --- | --- |
| Usuarios (foto de perfil) | `uploads/usuarios` |
| Menú (platillos) | `uploads/menu` |
| Inventario (productos) | `uploads/inventario` |

Al cambiar una foto se borra la anterior, y solo se aceptan JPG, PNG o WEBP de verdad (se revisa el contenido del archivo, no solo la extensión).

Si tienes fotos viejas sueltas en `uploads/`, córrelo una sola vez:

```bash
npm run organizar-uploads
```

Mueve cada foto a la carpeta de su módulo y actualiza la ruta en la base. Las que no usa ningún registro quedan en `uploads/sin-uso` (no se borran).
