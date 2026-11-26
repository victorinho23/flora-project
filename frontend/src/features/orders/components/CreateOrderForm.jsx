import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Minus, X, ChevronLeft, ChevronRight, Utensils } from "lucide-react";
import { Textarea, Button, Navbar, SearchField, DetailModal } from "@/shared";
import { useNavigate, useLocation } from "react-router-dom";
import { orderSchema } from "../../../shared/schemas/orderSchema";
import { getDishCategories } from "@/services/selectServices";
import { getActiveDishCards, buildDishIndex, searchDishes, parseQuickAdd } from "@/features/products/services/dishService";
import { showSuccesAlert, showUnexpectedErrorAlert, showConfirmAlert, showConfirmDeleteAlert } from "@/shared/services/alertService";
import { createOrder, getTables } from "../services/orderService";
import TablePickerModal from "./TablePickerModal";
import { getSessionUser } from "@/features/auth/services/logoutService";
import fotoFondo from "@/assets/images/fondo-orders.png";
import { useAccess } from "@/features/auth/services/accessService";

const DISHES_PER_PAGE = 6;
// alto de cada tarjeta de platillo (foto de 96px + nombre y precio)
const DISH_TILE_HEIGHT = 150;

// El mesero se asigna automaticamente segun la sesion activa, no lo elige el usuario

export default function CreateOrderForm() {
    // el backend toma el mesero del token y aqui solo se muestra el nombre
    const currentWaiter = { name: getSessionUser()?.name ?? "" };

    // platillos activos del menu que se pueden agregar a la orden
    const [availableDishes, setAvailableDishes] = useState([]);

    useEffect(() => {
        getActiveDishCards().then(setAvailableDishes).catch(console.error);
    }, []);

    // ===== Busqueda de platillos =====
    // el indice se arma una vez cuando llegan los platillos; al escribir solo se compara
    const dishIndex = useMemo(() => buildDishIndex(availableDishes), [availableDishes]);
    const [dishQuery, setDishQuery] = useState("");
    const searchRef = useRef(null);
    // "2 capuchino" -> agrega 2 del primer resultado al presionar Enter
    const quick = parseQuickAdd(dishQuery);
    const searched = dishQuery.trim() ? searchDishes(dishIndex, quick.query) : availableDishes;
    const [lastAdded, setLastAdded] = useState("");

    // atajo de teclado: "/" pone el cursor en el buscador (si no estas escribiendo en otro campo)
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key !== "/" || ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
            e.preventDefault();
            searchRef.current?.focus();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, []);

    // categorias del menu para filtrar como en una caja registradora
    // salen TODAS de la base (no solo las que ya tienen platillos) y cada una dice cuantos platillos tiene
    const [category, setCategory] = useState("Todas");
    const [menuCategories, setMenuCategories] = useState([]);
    useEffect(() => {
        getDishCategories().then((list) => setMenuCategories(list.map((item) => item.label))).catch(() => setMenuCategories([]));
    }, []);
    // cuantos platillos activos hay por categoria (se cuenta una sola vez cuando llegan los platillos)
    const dishCount = useMemo(() => {
        const count = new Map();
        for (const dish of availableDishes) count.set(dish.category, (count.get(dish.category) ?? 0) + 1);
        return count;
    }, [availableDishes]);
    const categories = useMemo(() => {
        const names = [...new Set([...menuCategories, ...dishCount.keys()])];
        // primero las que tienen platillos, despues las vacias (cada grupo en orden alfabetico)
        names.sort((a, b) => Number(!dishCount.has(a)) - Number(!dishCount.has(b)) || a.localeCompare(b, "es"));
        return ["Todas", ...names];
    }, [menuCategories, dishCount]);

    // en la fila solo van "Todas", las que tienen platillos (maximo 5) y la elegida si es otra
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const quickCategories = useMemo(() => {
        const withDishes = categories.filter((name) => name !== "Todas" && dishCount.has(name)).slice(0, 5);
        const list = ["Todas", ...withDishes];
        if (!list.includes(category)) list.push(category);
        return list;
    }, [categories, dishCount, category]);
    const pickCategory = (name) => {
        setCategory(name);
        setDishPage(0);
        setCategoriesOpen(false);
    };
    const filteredDishes = category === "Todas" ? searched : searched.filter((dish) => dish.category === category);

    const [dishPage, setDishPage] = useState(0);
    // cuantos platillos caben sin que salga scroll: se mide el espacio libre de la tarjeta
    // (en pantallas grandes); en celular se muestran DISHES_PER_PAGE y la pagina baja normal
    const dishGridRef = useRef(null);
    const [perPage, setPerPage] = useState(DISHES_PER_PAGE);
    useEffect(() => {
        const grid = dishGridRef.current;
        if (!grid) return;
        const observer = new ResizeObserver(() => {
            if (window.innerWidth < 1280) return setPerPage(DISHES_PER_PAGE);
            const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
            const rows = Math.max(1, Math.floor((grid.clientHeight + 16) / (DISH_TILE_HEIGHT + 16)));
            setPerPage(cols * rows);
        });
        observer.observe(grid);
        return () => observer.disconnect();
    }, []);
    const dishPageCount = Math.ceil(filteredDishes.length / perPage);
    const currentPage = Math.min(dishPage, Math.max(0, dishPageCount - 1));
    const visibleDishes = filteredDishes.slice(currentPage * perPage, (currentPage + 1) * perPage);
    const navigate = useNavigate();
    const can = useAccess();
    // si no puede ver el listado (por ejemplo, solo le dieron el permiso de crear) se vuelve al inicio
    const listPath = can("ordenes_listar") ? "/orderList" : "/home";
    const [errors, setErrors] = useState({});
    // si se llego desde el tablero de mesas la mesa ya viene puesta
    const [tableNumber, setTableNumber] = useState(useLocation().state?.tableNumber ?? "");
    const [notes, setNotes] = useState("");

    // ventana de mesas (el plano se carga solo al abrirla)
    const [tablesOpen, setTablesOpen] = useState(false);
    const openTables = () => setTablesOpen(true);

    // mesas ocupadas: mesa -> orden abierta. Se piden a la base al entrar, cada 20 segundos
    // y al cerrar el plano, asi se ve lo que van haciendo los demas meseros
    const [occupied, setOccupied] = useState(() => new Map());
    useEffect(() => {
        const load = () => getTables()
            .then(({ open }) => setOccupied(new Map(open.map((item) => [Number(item.tableNumber), item]))));
        load();
        const timer = setInterval(load, 20000);
        return () => clearInterval(timer);
    }, [tablesOpen]);

    // si la mesa escrita ya tiene una orden abierta no se deja guardar (busqueda directa en el Map)
    const takenBy = occupied.get(Number(tableNumber));
    const tableTaken = Boolean(takenBy);
    // mensaje debajo de la mesa: el que mando el backend o que esta ocupada
    const tableError = errors.tableNumber ?? (tableTaken ? `Mesa ocupada con la orden #${takenBy.id}, elige otra en el plano` : undefined);

    // Platillos de la orden guardados por id: { "3": { dishId, quantity, ... } }
    // asi sumar, restar o quitar un platillo va directo a su id sin recorrer la lista
    const [orderItems, setOrderItems] = useState({});
    const itemList = Object.values(orderItems);

    // agrega el platillo (una o varias unidades) directo por su id
    const addDish = (dish, quantity = 1) => {
        setOrderItems((prev) => ({
            ...prev,
            [dish.id]: prev[dish.id]
                ? { ...prev[dish.id], quantity: prev[dish.id].quantity + quantity }
                : { dishId: dish.id, dishName: dish.title, price: dish.price, image: dish.image, quantity },
        }));
    };

    const changeQuantity = (dishId, delta) => {
        // si con el menos queda en 0, es quitar el platillo: se pide confirmacion
        if (orderItems[dishId] && orderItems[dishId].quantity + delta <= 0) return removeItem(dishId);
        setOrderItems((prev) => {
            const quantity = prev[dishId].quantity + delta;
            return { ...prev, [dishId]: { ...prev[dishId], quantity } };
        });
    };

    // quitar un platillo de la orden, preguntando antes para no borrarlo por error
    const removeItem = async (dishId) => {
        const item = orderItems[dishId];
        if (!item) return;
        const result = await showConfirmDeleteAlert({
            title: "¿Quitar el platillo?",
            text: `Se quitará ${item.quantity > 1 ? `${item.quantity} x ` : ""}${item.dishName} de la orden.`,
            confirmButtonText: "Quitar",
        });
        if (!result.isConfirmed) return;
        setOrderItems((prev) => {
            const rest = { ...prev };
            delete rest[dishId];
            return rest;
        });
    };

    const total = itemList.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        // mesa ocupada: no se deja abrir otra orden hasta que la de esa mesa se pague o se anule
        if (tableTaken) {
            setErrors({ tableNumber: `Mesa ocupada con la orden #${takenBy.id}, elige otra en el plano` });
            return;
        }

        const formData = {
            tableNumber,
            notes,
            items: itemList.map((item) => ({
                dishId: item.dishId,
                dishName: item.dishName,
                quantity: item.quantity,
            })),
        };

        const result = orderSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        // confirmacion antes de mandar la orden a cocina
        const confirmation = await showConfirmAlert({
            title: `¿Enviar la orden de la mesa ${tableNumber} a cocina?`,
            text: `${itemList.reduce((sum, item) => sum + item.quantity, 0)} platillo(s) por $${total.toLocaleString("es-CO")}`,
            confirmButtonText: "Enviar a cocina",
        });
        if (!confirmation.isConfirmed) return;

        setErrors({});

        try {
            // el backend vuelve a revisar la mesa (otro mesero pudo ocuparla hace un momento)
            let response;
            try {
                response = await createOrder(result.data);
            } catch (error) {
                if (error.status !== 409) throw error;
                setErrors({ tableNumber: error.message });
                const activeOrderId = error.data?.activeOrderId;
                const choice = await showConfirmAlert({
                    title: `La mesa ${tableNumber} está ocupada`,
                    text: activeOrderId
                        ? `Tiene abierta la orden #${activeOrderId}. Si es la misma mesa, agrega los platillos editando esa orden.`
                        : error.message,
                    confirmButtonText: activeOrderId ? "Ver esa orden" : "Elegir otra mesa",
                });
                if (!choice.isConfirmed) return;
                if (activeOrderId) navigate(listPath, { state: { openOrder: activeOrderId } });
                else openTables();
                return;
            }

            await showSuccesAlert({
                title: "Orden creada",
                text: "La orden fue creada correctamente",
                timer: 3000,
            });

            navigate(listPath, { replace: true, state: { openOrder: response.orderId } });
        } catch (error) {
            console.log("Error: ", error.message);
            await showUnexpectedErrorAlert({
                text: error.message,
                timer: 3000,
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col">

            <Navbar
                variant="banda"
                image={fotoFondo}
                title="Crear orden"
                onBack={() => navigate(listPath)}
                actions={
                    <>
                        {can("ordenes_listar") && (
                            <Button variant="crema" size="sm" type="button" onClick={() => navigate("/orderList")}>
                                Ver listado
                            </Button>
                        )}
                    </>
                }
            />

            <div className="flex-1 px-4 sm:px-8 py-6 xl:py-4">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-8xl mx-auto grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)] gap-6 xl:h-[calc(100vh-7.5rem)] [&_.w-80]:w-full"
                >

                    <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-m3-md bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-m3-1 p-4 sm:p-5 bajo:sm:p-4 xl:self-start">
                        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                            <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                            Datos de la orden
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                            {/* la mesa ya no se escribe: se elige tocando el plano, asi no se equivocan de numero */}
                            <div className="w-full sm:col-span-2 xl:col-span-1">
                                <p className="text-sm font-semibold text-br-s900 mb-1">Mesa</p>
                                <button
                                    type="button"
                                    onClick={openTables}
                                    aria-label={tableNumber ? `Mesa ${tableNumber}, toca para cambiarla en el plano` : "Elegir la mesa en el plano"}
                                    className={`m3-state w-full h-12 flex items-center justify-between gap-3 px-4 rounded-m3-xs border bg-bg-w text-left shadow-m3-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${tableError ? "border-m3-error border-2" : "border-bd-s400"}`}
                                >
                                    <span className={tableNumber ? "text-m3-title-medium font-bold text-br-s950" : "text-br-s800"}>
                                        {tableNumber ? `Mesa ${tableNumber}` : "Sin mesa elegida"}
                                    </span>
                                    <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap text-m3-label-large font-semibold text-br-t900">
                                        <Utensils size={16} />
                                        {tableNumber ? "Cambiar" : "Ver plano"}
                                    </span>
                                </button>
                                {tableError && (
                                    <p className="text-sm inline-block mt-1 px-2 py-0.5 rounded bg-m3-error-container text-m3-on-error-container font-medium">{tableError}</p>
                                )}
                            </div>

                            <div className="w-full">
                                <p className="text-sm font-semibold text-br-s900 mb-1">
                                    Mesero responsable
                                </p>
                                <div className="h-12 rounded-m3-xs border border-bd-s400 bg-bg-s50 flex items-center px-4 text-br-s950 font-medium">
                                    {currentWaiter.name}
                                </div>
                                <p className="mt-1 text-m3-body-small text-br-s800">Se asigna solo con la sesión que está abierta</p>
                            </div>
                        </div>

                        <Textarea
                            name="notes"
                            label="Observaciones (opcional)"
                            placeholder="Alguna indicación especial del cliente"
                            htmlFor="notes"
                            variant="latte"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-m3-md bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-m3-1 p-4 sm:p-5 bajo:sm:p-4 xl:min-h-0">
                        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                            <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                            Platillos disponibles
                        </h2>
                        {/* Buscador: sin tildes, varias palabras y "2 capuchino" + Enter para agregar rapido */}
                        <div className="flex flex-col gap-1">
                            <SearchField
                                ref={searchRef}
                                value={dishQuery}
                                onChange={(value) => { setDishQuery(value); setDishPage(0); }}
                                onClear={() => setDishPage(0)}
                                onSubmit={() => {
                                    const top = filteredDishes[0];
                                    if (!top) return;
                                    addDish(top, quick.quantity);
                                    setLastAdded(`Se agregó ${quick.quantity} × ${top.title}`);
                                    setDishQuery("");
                                }}
                                placeholder='Buscar o escribe "2 capuchino" y Enter'
                                ariaLabel="Buscar platillo"
                                fullWidth
                            />
                            <p className="min-h-5 text-m3-body-small text-br-s800" aria-live="polite">
                                {dishQuery.trim()
                                    ? filteredDishes[0]
                                        ? <>Enter agrega <b>{quick.quantity} × {filteredDishes[0].title}</b> · {filteredDishes.length} {filteredDishes.length === 1 ? "resultado" : "resultados"}</>
                                        : "No hay platillos que coincidan"
                                    : lastAdded || <>Atajo: presiona <kbd className="px-1.5 rounded-m3-xs border border-bd-s300 bg-bg-w font-mono">/</kbd> para buscar</>}
                            </p>
                        </div>
                        {/* filtro por categoria: una sola fila con las que tienen platillos (sin scroll);
                            todas las demas se ven en la ventana "Todas las categorías" */}
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
                            {quickCategories.map((name) => (
                                <Button
                                    key={name}
                                    type="button"
                                    aria-pressed={category === name}
                                    onClick={() => pickCategory(name)}
                                    className={`m3-state shrink-0 h-8 px-4 rounded-m3-sm border text-m3-label-large font-semibold transition-colors duration-200 ease-m3-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${category === name ? "bg-m3-secondary-container text-m3-on-secondary-container border-transparent" : "bg-bg-w text-br-s950 border-bd-s300"}`}
                                >
                                    {name}
                                    <span className="ml-1.5 text-m3-label-small opacity-80">{name === "Todas" ? availableDishes.length : dishCount.get(name) ?? 0}</span>
                                </Button>
                            ))}
                            <Button
                                type="button"
                                onClick={() => setCategoriesOpen(true)}
                                className="m3-state shrink-0 h-8 px-4 rounded-m3-sm border border-dashed border-bd-t800 bg-bg-t50 text-m3-label-large font-semibold text-br-t950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus"
                            >
                                Todas las categorías ({categories.length - 1})
                            </Button>
                        </div>
                        <div ref={dishGridRef} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 content-start auto-rows-max gap-4 xl:flex-1 xl:min-h-0 xl:overflow-hidden">
                                {/* categoria sin platillos activos todavia */}
                                {!visibleDishes.length && (
                                    <p className="col-span-full py-8 text-center text-m3-body-medium text-br-s800">
                                        {dishQuery.trim() ? "No hay platillos que coincidan con la búsqueda." : category === "Todas" ? "No hay platillos activos en el menú." : `Todavía no hay platillos en ${category}.`}
                                    </p>
                                )}
                                {visibleDishes.map((dish) => (
                                    <Button
                                        key={dish.id}
                                        type="button"
                                        onClick={() => addDish(dish)}
                                        className="m3-state relative flex flex-col rounded-m3-md overflow-hidden border border-bd-s100 bg-bg-w shadow-m3-1 hover:border-bd-t900 hover:shadow-m3-2 transition-shadow duration-200 ease-m3-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus"
                                        aria-label={`Agregar ${dish.title}`}
                                    >
                                        {/* cuantos de este platillo ya van en la orden */}
                                        {orderItems[dish.id] && (
                                            <span className="absolute top-2 right-2 z-10 min-w-6 h-6 px-1.5 flex items-center justify-center rounded-m3-full bg-m3-primary text-m3-on-primary text-m3-label-medium font-bold shadow-m3-1">
                                                {orderItems[dish.id].quantity}
                                            </span>
                                        )}
                                        <div className="w-full h-24 bg-bg-s50">
                                            <img
                                                src={dish.image}
                                                alt={dish.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="bg-bg-w text-br-s950 text-sm font-semibold px-2 pt-2 text-center">
                                            {dish.title}
                                        </span>
                                        <span className="bg-bg-w text-br-t900 text-m3-label-medium font-bold pb-2 text-center">
                                            ${Number(dish.price).toLocaleString("es-CO")}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                            {dishPageCount > 1 && (
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => setDishPage(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        aria-label="Página anterior"
                                        className="h-9 min-w-9 px-3 rounded-m3-sm text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus disabled:opacity-40 disabled:cursor-not-allowed border-bd-s300 bg-bg-w text-br-s950 hover:bg-bg-t50"
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>
                                    {Array.from({ length: dishPageCount }, (_, index) => (
                                        <Button
                                            key={index}
                                            type="button"
                                            onClick={() => setDishPage(index)}
                                            className={`h-9 min-w-9 px-3 rounded-m3-sm text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus disabled:opacity-40 disabled:cursor-not-allowed ${index === currentPage ? "border-bd-s950 bg-bg-s950 text-bg-w" : "border-bd-s300 bg-bg-w text-br-s950 hover:bg-bg-t50"}`}
                                        >
                                            {index + 1}
                                        </Button>
                                    ))}
                                    <Button
                                        type="button"
                                        onClick={() => setDishPage(currentPage + 1)}
                                        disabled={currentPage === dishPageCount - 1}
                                        aria-label="Página siguiente"
                                        className="h-9 min-w-9 px-3 rounded-m3-sm text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus disabled:opacity-40 disabled:cursor-not-allowed border-bd-s300 bg-bg-w text-br-s950 hover:bg-bg-t50"
                                    >
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            )}
                        {errors.items && (
                            <span className="inline-block rounded bg-m3-error-container px-2 py-0.5 text-m3-on-error-container font-medium text-sm">{errors.items}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 xl:min-h-0">

                        <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-m3-md bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-m3-1 p-4 sm:p-5 bajo:sm:p-4 flex-1 min-h-64 xl:min-h-0 overflow-y-auto">
                            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                                <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                                Resumen de la orden
                            </h2>
                            {itemList.length === 0 ? (
                                <p className="text-br-s800 text-sm text-center py-10">
                                    Aún no has agregado platillos
                                </p>
                            ) : (
                                itemList.map((item) => (
                                    <div
                                        key={item.dishId}
                                        className="flex items-center gap-3 bg-bg-w border border-bd-s100 rounded-m3-sm p-2"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.dishName}
                                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-br-s950 text-sm font-semibold truncate">
                                                {item.dishName}
                                            </p>
                                            <p className="text-br-s800 text-sm">
                                                ${Number(item.price).toLocaleString("es-CO")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => changeQuantity(item.dishId, -1)}
                                                aria-label={`Quitar uno de ${item.dishName}`}
                                                className="m3-state w-9 h-9 flex items-center justify-center rounded-m3-full bg-bg-s100 text-br-s950"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                            <span className="text-br-s950 text-sm font-semibold w-4 text-center">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                type="button"
                                                onClick={() => changeQuantity(item.dishId, 1)}
                                                aria-label={`Agregar uno de ${item.dishName}`}
                                                className="m3-state w-9 h-9 flex items-center justify-center rounded-m3-full bg-bg-s100 text-br-s950"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => removeItem(item.dishId)}
                                            className="inline-block rounded bg-m3-error-container px-2 py-0.5 text-m3-on-error-container font-medium hover:text-m3-on-error-container"
                                            aria-label="Quitar"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex items-center justify-between border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-m3-1 rounded-m3-sm px-4 py-3">
                            <span className="text-br-s950 font-semibold">Total</span>
                            <span className="text-br-t900 font-bold text-lg">
                                ${total.toLocaleString("es-CO")}
                            </span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                variant="contorno"
                                size="lgg"
                                type="button"
                                onClick={() => navigate(listPath)}
                            >
                                Cancelar
                            </Button>

                            <Button
                                variant="espresso"
                                size="lgg"
                                type="submit"
                            >
                                Crear orden
                            </Button>
                        </div>

                    </div>

                </form>
            </div>

            {/* todas las categorias del menu: lista corta, va en ventana */}
            <DetailModal
                open={categoriesOpen}
                onClose={() => setCategoriesOpen(false)}
                icon={Utensils}
                title="Categorías del menú"
                subtitle="Toca una para ver sus platillos"
                size="max-w-3xl"
                bodyClassName="grid-cols-2 sm:grid-cols-3"
            >
                {categories.map((name) => (
                    <button
                        key={name}
                        type="button"
                        aria-pressed={category === name}
                        onClick={() => pickCategory(name)}
                        className={`m3-state flex items-center justify-between gap-2 min-h-12 px-4 rounded-m3-md border text-left text-m3-label-large font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${category === name ? "bg-m3-secondary-container text-m3-on-secondary-container border-transparent" : "bg-bg-w text-br-s950 border-bd-s300"}`}
                    >
                        <span>{name}</span>
                        <span className="text-m3-label-small text-br-s800">{name === "Todas" ? availableDishes.length : dishCount.get(name) ?? 0}</span>
                    </button>
                ))}
            </DetailModal>

            <TablePickerModal
                open={tablesOpen}
                onClose={() => setTablesOpen(false)}
                mode="select"
                currentTable={tableNumber}
                onPick={(table) => {
                    setTableNumber(table);
                    setTablesOpen(false);
                }}
            />
        </div>
    );
}