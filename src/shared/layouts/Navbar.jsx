import { useState } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import {
  IconButton,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  SearchField,
  Button,
} from "@/shared";
// import  logo  from "@/assets/images/1-logo.png";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";


// Opciones de la barra de navegacion, also son las rutas del mismo modulo donde no se muestra la opcion
const navigationLinks = [
  { to: "/home", label: "Inicio" },
  { to: "/userList", label: "Usuarios", also: ["/viewListUsers"] },
  { to: "/listSuppliers", label: "Proveedores", also: ["/viewlistSuppliers", "/updateSuppliers"] },
  { to: "/listMenu", label: "Menú", also: ["/viewListMenu"] },
  { to: "/orderList", label: "Órdenes", also: ["/viewListOrders"] },
  { to: "/listInventory", label: "Inventario", also: ["/updateInventory"] },
  { to: "/permissions", label: "Permisos" },
];

// Fondo con la foto de cada pagina, se usa en las variantes foto y banda
const navigationBackground = "text-bg-w bg-bg-s950 bg-cover bg-center bg-[linear-gradient(110deg,color-mix(in_srgb,var(--color-bg-s950)_82%,transparent)_0%,color-mix(in_srgb,var(--color-bg-s900)_84%,transparent)_55%,color-mix(in_srgb,var(--color-bg-t950)_88%,transparent)_100%),var(--foto)]";

export default function Navbar({ variant = "default", image, icon: Icon, avatar, title, subtitle, onBack, backSide = "left", actions, navigation = false, className = "" }){

  const { pathname } = useLocation();

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

  // Componente de búsqueda 😂😂😂
  const [search, setSearch] = useState("");


  const handleSearch = (value) => {
    console.log("Buscar:", value);
  };


  const handleClear = () => {
    console.log("Campo limpiado");
  };

;


    const style = image ? { "--foto": `url(${image})` } : undefined;

    // Opciones de navegacion: en celular en cuadricula y en pantallas grandes en linea con separadores
    const links = (navigation || variant === "links") && (
      <div className={`w-full grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-bg-w/40 pt-3 lg:flex lg:w-fit lg:mx-auto lg:items-center lg:gap-0 lg:border-t-0 lg:pt-0 ${variant === "links" ? "lg:mx-0 lg:border-l lg:border-bg-w/50 lg:pl-1" : "xl:mx-0 xl:shrink-0 xl:border-l xl:border-bg-w/50 xl:pl-1"}`}>
        {navigationLinks
          .filter((link) => link.to !== pathname && !link.also?.includes(pathname))
          .map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2.5 rounded-lg border border-bg-w/40 text-center text-base font-semibold text-bg-w whitespace-nowrap hover:bg-bg-w/15 transition-colors lg:rounded-none lg:border-0 lg:border-l lg:border-bg-w/50 lg:first:border-l-0 lg:px-4 xl:px-2.5 2xl:px-4 xl:text-sm 2xl:text-base lg:py-1"
            >
              {link.label}
            </Link>
          ))}
      </div>
    );

    // Boton de volver que usan las variantes
    const backButton = (size, hover) => (
      <Button
        type="button"
        onClick={onBack}
        className={`text-bg-w ${hover} transition-colors`}
        aria-label="Volver"
      >
        <ArrowLeft className={size} />
      </Button>
    );

    // Variante links: logo y opciones, como la barra del home pero sin buscador (gestion de permisos)
    if (variant === "links") {
      return (
        <nav className={`relative z-50 w-full bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950 shadow-[0_10px_30px_-14px_color-mix(in_srgb,var(--color-bg-s950)_80%,transparent)] ${className}`}>
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 lg:py-0 flex flex-col lg:flex-row lg:h-20 items-center justify-center lg:justify-between gap-2 lg:gap-6">
            <img className="w-24 h-16 sm:w-32 lg:w-40 lg:h-20 shrink-0 object-contain" src="src/assets/icons/flora-icon.svg" alt="" />
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
            <div className="flex items-center gap-4 min-w-0">
              {onBack && backButton("w-7 h-7", "hover:text-br-t100")}
              {Icon && (
                <div className="p-3 xl:p-2 2xl:p-3 rounded-xl bg-bg-w/10 ring-1 ring-bd-w/25 shrink-0">
                  <Icon size={26} className="text-br-t100" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-2xl xl:text-xl 2xl:text-2xl font-bold text-bg-w xl:whitespace-nowrap">{title}</h1>
                {subtitle && <p className={`text-sm text-bg-w ${navigation ? "xl:max-w-64 2xl:max-w-xs" : ""}`}>{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="grid grid-cols-2 w-full sm:w-auto sm:flex sm:flex-nowrap justify-center md:justify-end gap-3 xl:order-last xl:shrink-0 [&_button]:whitespace-nowrap max-sm:[&>*]:w-full max-sm:[&_button]:w-full max-sm:[&_button]:px-2 max-sm:[&_button]:text-sm xl:[&_button]:text-sm xl:[&_button]:px-3 2xl:[&_button]:text-base 2xl:[&_button]:px-4 [&:has(>:only-child)]:flex">{actions}</div>}
          </div>
          {links}
        </nav>
      );
    }

    // Variante banda: encabezado de los formularios con titulo y boton de volver
    if (variant === "banda") {
      return (
        <nav className={`w-full flex flex-wrap xl:flex-nowrap items-center justify-center sm:justify-between gap-3 px-4 sm:px-8 py-4 sm:py-6 bajo:sm:py-2 ${navigationBackground} ${className}`} style={style}>
          <div className="flex items-center gap-3 sm:gap-5">
            {onBack && backSide === "left" && backButton("w-8 h-8", "hover:text-bg-w/70")}
            {Icon && (
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-bg-w/10 border-2 border-bg-w/80 shrink-0">
                <Icon className="w-6 h-6 text-bg-w" />
              </span>
            )}
            {avatar && <img className="w-20 h-20 sm:w-32 sm:h-32 bajo:sm:w-20 bajo:sm:h-20" src={avatar} alt="" />}
            <h1 className="text-title text-bg-w font-bold">{title}</h1>
          </div>
          {links && <div className="order-last w-full xl:order-none xl:w-auto xl:mr-auto">{links}</div>}
          {onBack && backSide === "right" ? backButton("w-8 h-8", "hover:text-bg-w/70") : actions}
        </nav>
      );
    }

    return (
      <nav className="relative z-50 w-full bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950 h-20 flex justify-center items-center shadow-[0_10px_30px_-14px_color-mix(in_srgb,var(--color-bg-s950)_80%,transparent)]">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex w-full h-16 items-center justify-between gap-3 sm:gap-6">
            {/* Logo de marca */}
            <div className=" hidden sm:block items-center">
              <Link to="/dashboard" className="text-h1 font-heading">
                {/* <img src={logo} alt="logo" className="h-12" /> */}
              </Link>
            </div>


            {/* Switch */}
            {/* inline-flex :Ocupa solo su contenido, no todo el ancho. */}

            {/**SearchField + iconButton */}

           
                 <img className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 shrink-0 object-contain" src="src/assets/icons/flora-icon.svg" alt="" />
            <div className="flex-1 min-w-0 max-w-200">
                
                 <SearchField
                    value={search}
                    onChange={setSearch}
                    onSubmit={handleSearch}
                    onClear={handleClear}
                    placeholder="Realizar una busqueda"
                    size="md"
                    variant="white"
                    className="w-full"
                />
                
            </div>

            {/* ======= Dropdown ======= */}

            <IconButton
                variant="primary"
                onClick={toggleTheme}
                ariaLabel={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                className="shrink-0"
            >
                {theme === "dark" ? <Sun/> : <Moon/>}
            </IconButton>

            <Dropdown className="relative shrink-0">
                <div className="relative text-text-primary flex ">

               
                <DropdownTrigger>
                    <IconButton
                        flex
                        jusitify-start
                        variant="primary"
                        arialabel ="Menu de usuario">
                        <Menu/>
                    </IconButton>
                </DropdownTrigger>

                <DropdownContent className="absolute right-0 top-full mt-2 z-50 w-56 max-w-[calc(100vw-1.5rem)] bg-bg-s950 border-bd-t300 text-bg-w">

                  <DropdownItem><Link to="/userList"  
                    className="block w-full" >Listar Usuarios</Link></DropdownItem>

                  <DropdownItem><Link to="/listSuppliers"  
                    className="block w-full" >Listar proveedores</Link></DropdownItem>

                  <DropdownItem><Link to="/listMenu"  
                  className="block w-full" >Listar Menu</Link></DropdownItem>

                  <DropdownItem><Link to="/orderList"  
                    className="block w-full" >Listar Ordenes</Link></DropdownItem>

                  <DropdownItem><Link to="/listInventory"  
                   className="block w-full" >Listar inventario</Link></DropdownItem>

                    <DropdownItem><Link to="/permissions"  
                   className="block w-full" >Gestion de Permisos</Link></DropdownItem>


                  <DropdownItem><Link to="/auth"  
                   className="block w-full" >Cerrar sesión</Link></DropdownItem>

                </DropdownContent>
               
                </div>
            </Dropdown>

            {/* Ícono de usuario */}
            
            </div>
            
          </div>
        
      </nav>
    );


}