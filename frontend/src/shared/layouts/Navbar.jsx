import { useState } from "react";
import { Menu, Moon, Sun, ArrowLeft } from "lucide-react";
import {
  IconButton,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  SearchField,
  Button,
} from "@/shared";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/icons/flora-icon.svg";
import { useAccess } from "@/features/auth/services/accessService";


// Secciones de la barra de navegacion y todas las rutas que pertenecen a cada una
// (listado, crear, ver, editar). Asi la seccion queda marcada aunque estes dentro de un formulario
const navigationLinks = [
  { to: "/home", label: "Inicio", routes: ["home"] },
  { to: "/userList", permission: "usuarios_listar", label: "Usuarios", routes: ["userList", "viewListUsers", "userCreate", "userEdit", "viewUser"] },
  { to: "/listSuppliers", permission: "proveedores_listar", label: "Proveedores", routes: ["listSuppliers", "viewlistSuppliers", "updateSuppliers", "suppliersCreate", "editSupplier"] },
  { to: "/listMenu", permission: "menu_listar", label: "Menú", routes: ["listMenu", "viewListMenu", "createDishes", "viewDish", "dishEdit", "categories"] },
  { to: "/orderList", permission: "ordenes_listar", label: "Órdenes", routes: ["orderList", "viewListOrders", "createOrders", "orderView", "orderEdit"] },
  { to: "/listInventory", permission: "inventario_listar", label: "Inventario", routes: ["listInventory", "updateInventory", "createInventory", "editInventory", "detailsInventory"] },
  { to: "/permissions", permission: "permisos_gestionar", label: "Permisos", routes: ["permissions"] },
  { to: "/settings", permission: "mesas_listar", label: "Configuración", routes: ["settings"] },
];

// Destinos del buscador de la barra: modulos y acciones frecuentes, con palabras parecidas
// (asi "pedido", "comanda" o "carta" tambien encuentran lo que buscas)
const searchTargets = [
  { label: "Órdenes", to: "/orderList", permission: "ordenes_listar", words: "ordenes pedidos comandas mesas cocina" },
  { label: "Nueva orden", to: "/createOrders", permission: "ordenes_crear", words: "nueva orden pedido tomar comanda mesa" },
  { label: "Menú", to: "/listMenu", permission: "menu_listar", words: "menu carta platos platillos comida" },
  { label: "Crear platillo", to: "/createDishes", permission: "menu_agregar", words: "crear nuevo plato platillo agregar menu" },
  { label: "Categorías del menú", to: "/categories", permission: "menu_listar", words: "categorias tipos secciones carta" },
  { label: "Inventario", to: "/listInventory", permission: "inventario_listar", words: "inventario productos stock existencias bodega lotes" },
  { label: "Nuevo producto", to: "/createInventory", permission: "inventario_crear", words: "nuevo producto inventario registrar insumo" },
  { label: "Proveedores", to: "/listSuppliers", permission: "proveedores_listar", words: "proveedores compras distribuidores" },
  { label: "Nuevo proveedor", to: "/suppliersCreate", permission: "proveedores_registrar", words: "nuevo proveedor registrar" },
  { label: "Usuarios", to: "/userList", permission: "usuarios_listar", words: "usuarios empleados meseros personal" },
  { label: "Nuevo usuario", to: "/userCreate", permission: "usuarios_crear", words: "nuevo usuario empleado mesero registrar" },
  { label: "Permisos", to: "/permissions", permission: "permisos_gestionar", words: "permisos roles grupos accesos" },
  { label: "Configuración · Mesas", to: "/settings", permission: "mesas_listar", words: "configuracion ajustes mesas crear mesa zonas capacidad" },
  { label: "Mi perfil", to: "/viewUser", words: "mi perfil cuenta datos" },
  { label: "Inicio", to: "/home", words: "inicio home principal" },
];

// Diccionario ruta -> seccion, se arma una sola vez al cargar el archivo
// asi saber en que seccion estoy es una busqueda directa, no recorre la lista en cada render
const sectionByRoute = Object.fromEntries(
  navigationLinks.flatMap((link) => link.routes.map((route) => [route, link.to]))
);

// /orderView/12 -> "orderView"
const sectionOf = (pathname) => sectionByRoute[pathname.split("/")[1]];

// quita tildes y mayusculas para que "ordenes" encuentre "Órdenes"
const normalize = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Fondo con la foto de cada pagina, se usa en las variantes foto y banda
const navigationBackground = "text-bg-w bg-bg-s950 bg-cover bg-center bg-[linear-gradient(110deg,color-mix(in_srgb,var(--color-bg-s950)_82%,transparent)_0%,color-mix(in_srgb,var(--color-bg-s900)_84%,transparent)_55%,color-mix(in_srgb,var(--color-bg-t950)_88%,transparent)_100%),var(--foto)]";

// backSide se deja por compatibilidad, pero en Material 3 volver siempre va a la izquierda del titulo
export default function Navbar({ variant = "default", image, icon: Icon, avatar, title, subtitle, onBack, actions, navigation = false, className = "" }){

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const currentSection = sectionOf(pathname);

  // solo se muestran los modulos que la persona puede abrir (el admin los ve todos)
  const can = useAccess();
  const allowedLinks = navigationLinks.filter((link) => can(link.permission));

  // Tema actual y cambio entre claro y oscuro guardando la preferencia
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? "light");

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("flora-theme", next);
    } catch {
      setTheme(next);
    }
    setTheme(next);
  };

  // Buscador del inicio: escribes el nombre de un modulo (ej. "ordenes") y te lleva alli
  const [search, setSearch] = useState("");

  const handleSearch = (value) => {
    const query = normalize(value);
    if (!query) return;
    // gana el destino cuyo nombre empieza con lo escrito; si no, el que tenga todas las palabras
    const words = query.split(/\s+/);
    const allowed = searchTargets.filter((target) => can(target.permission));
    const found =
      allowed.find((target) => normalize(target.label).startsWith(query)) ??
      allowed.find((target) => words.every((word) => normalize(`${target.label} ${target.words}`).includes(word)));
    if (found) {
      navigate(found.to);
      setSearch("");
    }
  };

  const handleClear = () => setSearch("");

    const style = image ? { "--foto": `url(${image})` } : undefined;

    // Opciones de navegacion: la seccion actual queda marcada con el indicador de Material 3
    const links = (navigation || variant === "links") && (
      <div className={`w-full grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-bg-w/30 pt-3 lg:flex lg:w-fit lg:mx-auto lg:items-center lg:gap-1 lg:border-t-0 lg:pt-0 ${variant === "links" ? "lg:mx-0" : "xl:mx-0 xl:shrink-0"}`}>
        {allowedLinks.map((link) => {
          const active = link.to === currentSection;
          return (
            <Link
              key={link.to}
              to={link.to}
              aria-current={active ? "page" : undefined}
              className={`m3-state px-4 py-2 rounded-m3-full text-center text-m3-label-large font-semibold whitespace-nowrap transition-colors duration-200 ease-m3-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-t200 xl:px-3 2xl:px-4 ${active ? "bg-m3-secondary-container text-m3-on-secondary-container" : "text-bg-w border border-bg-w/30 lg:border-transparent"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    );

    // Boton de volver: siempre arriba a la izquierda, lleva a la pagina "padre" de esta
    const backButton = (size) => (
      <Button
        type="button"
        onClick={onBack}
        className="m3-state shrink-0 flex items-center justify-center w-12 h-12 rounded-m3-full text-bg-w focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-t200"
        aria-label="Volver"
        title="Volver"
      >
        <ArrowLeft className={size} />
      </Button>
    );

    // Variante links: logo y opciones, como la barra del home pero sin buscador (gestion de permisos)
    if (variant === "links") {
      return (
        <nav className={`relative z-50 w-full bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950 shadow-m3-2 ${className}`}>
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 lg:py-0 flex flex-col lg:flex-row lg:h-20 items-center justify-center lg:justify-between gap-2 lg:gap-6">
            <Link to="/home" aria-label="Ir al inicio" className="shrink-0">
              <img className="w-24 h-16 sm:w-32 lg:w-40 lg:h-20 object-contain" src={logo} alt="Flora" />
            </Link>
            {links}
          </div>
        </nav>
      );
    }

    // Variante foto: encabezado redondeado de los listados con titulo, opciones y botones
    if (variant === "foto") {
      return (
        <nav className={`flex flex-col xl:flex-row xl:items-center justify-between gap-4 xl:gap-3 2xl:gap-4 p-6 xl:px-5 2xl:px-6 bajo:py-3 ${navigationBackground} ${className}`} style={style}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 xl:contents">
            <div className="flex items-center gap-3 min-w-0">
              {onBack && backButton("w-6 h-6")}
              {Icon && (
                <div className="p-3 xl:p-2 2xl:p-3 rounded-m3-md bg-bg-w/10 ring-1 ring-bd-w/25 shrink-0">
                  <Icon size={26} className="text-br-t100" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-m3-headline-small xl:text-m3-title-large 2xl:text-m3-headline-small font-bold text-bg-w xl:whitespace-nowrap">{title}</h1>
                {subtitle && <p className={`text-m3-body-medium text-bg-w/85 ${navigation ? "xl:max-w-64 2xl:max-w-xs" : ""}`}>{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="grid grid-cols-2 w-full sm:w-auto sm:flex sm:flex-nowrap justify-center md:justify-end gap-3 xl:order-last xl:shrink-0 [&_button]:whitespace-nowrap max-sm:[&>*]:w-full max-sm:[&_button]:w-full max-sm:[&_button]:px-2 max-sm:[&_button]:text-sm xl:[&_button]:text-sm xl:[&_button]:px-3 2xl:[&_button]:text-base 2xl:[&_button]:px-4 [&:has(>:only-child)]:flex">{actions}</div>}
          </div>
          {links}
        </nav>
      );
    }

    // Variante banda: encabezado de los formularios con volver, titulo y acciones a la derecha
    if (variant === "banda") {
      return (
        <nav className={`w-full flex flex-wrap xl:flex-nowrap items-center justify-center sm:justify-between gap-3 px-4 sm:px-8 py-4 sm:py-6 bajo:sm:py-2 ${navigationBackground} ${className}`} style={style}>
          <div className="flex items-center gap-3 sm:gap-5">
            {onBack && backButton("w-7 h-7")}
            {Icon && (
              <span className="flex items-center justify-center w-10 h-10 rounded-m3-full bg-bg-w/10 border-2 border-bg-w/80 shrink-0">
                <Icon className="w-6 h-6 text-bg-w" />
              </span>
            )}
            {avatar && <img className="w-20 h-20 sm:w-32 sm:h-32 bajo:sm:w-20 bajo:sm:h-20" src={avatar} alt="" />}
            <h1 className="text-m3-headline-small text-bg-w font-bold">{title}</h1>
          </div>
          {links && <div className="order-last w-full xl:order-none xl:w-auto xl:mr-auto">{links}</div>}
          {actions}
        </nav>
      );
    }

    return (
      <nav className="relative z-50 w-full bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950 h-20 flex justify-center items-center shadow-m3-2">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex w-full h-16 items-center justify-between gap-3 sm:gap-6">

            {/* Logo: lleva al inicio */}
            <Link to="/home" aria-label="Ir al inicio" className="shrink-0">
              <img className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-contain" src={logo} alt="Flora" />
            </Link>

            {/* Buscador de modulos */}
            <div className="flex-1 min-w-0 max-w-200">
                 <SearchField
                    value={search}
                    onChange={setSearch}
                    onSubmit={handleSearch}
                    onClear={handleClear}
                    placeholder="¿A dónde vas? órdenes, nueva orden, categorías, inventario..."
                    size="md"
                    variant="white"
                    className="w-full"
                />
            </div>

            <IconButton
                variant="primary"
                onClick={toggleTheme}
                ariaLabel={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                className="shrink-0"
            >
                {theme === "dark" ? <Sun/> : <Moon/>}
            </IconButton>

            {/* Menu de modulos, la seccion actual queda marcada */}
            <Dropdown className="relative shrink-0">
                <DropdownTrigger>
                    <IconButton variant="primary" ariaLabel="Menú de módulos">
                        <Menu/>
                    </IconButton>
                </DropdownTrigger>

                <DropdownContent className="absolute right-0 top-full mt-2 z-50 w-60 max-w-[calc(100vw-1.5rem)] bg-bg-s950 border-bd-t300/40 text-bg-w">
                  {allowedLinks.slice(1).map((link) => (
                    <DropdownItem key={link.to} to={link.to} active={link.to === currentSection}>
                      {link.label}
                    </DropdownItem>
                  ))}

                  <div className="my-1 border-t border-bg-w/15" />

                  <DropdownItem to="/viewUser" active={pathname === "/viewUser"}>Mi perfil</DropdownItem>
                  <DropdownItem to="/auth">Cerrar sesión</DropdownItem>
                </DropdownContent>
            </Dropdown>

            </div>
          </div>
      </nav>
    );


}
