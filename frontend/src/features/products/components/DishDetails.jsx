// src/features/products/components/DishDetails.jsx
// Vista de un platillo con su informacion y el resto del menu paginado
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, SearchField, Navbar } from "@/shared";
import fotoFondo from "@/assets/images/fondo-dish.png";

// Cantidad de platillos que se muestran por pagina
const DISHES_PER_PAGE = 6;

export function DishDetails({ dish, relatedDishes = [] }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);

    const [selectedDish, setSelectedDish] = useState(dish);

    const allDishes = [dish, ...relatedDishes];

    const filteredDishes = allDishes.filter((item) =>
        item.dishName.toLowerCase().includes(search.toLowerCase())
    );

    const pageCount = Math.ceil(filteredDishes.length / DISHES_PER_PAGE);
    const visibleDishes = filteredDishes.slice(page * DISHES_PER_PAGE, (page + 1) * DISHES_PER_PAGE);

    // Busca platillos por nombre
    const handleSearch = (value) => {
        setSearch(value);
        setPage(0);
    };

    // Lleva a la edicion del platillo
    const handleEdit = () => {
        navigate(`/dishEdit/${selectedDish.id}`);
    };

    const enabled = selectedDish.isEnabled ?? true;

    return (
        <div className="min-h-screen flex flex-col">

            <Navbar
                variant="banda"
                image={fotoFondo}
                title="Visualizar Menu"
                onBack={() => navigate("/createDishes")}
                backSide="right"
            />

            <div className="flex-1 px-4 sm:px-8 py-6 xl:py-4 bajo:xl:py-3">
                <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 xl:gap-4">

                    <div className="border border-bd-s100 border-t-[5px] border-t-bd-t800 rounded-[1.25rem] bg-bg-w bg-linear-180 from-bg-w to-bg-p50 shadow-[0_26px_50px_-28px_color-mix(in_srgb,var(--color-bg-s950)_55%,transparent)] grid grid-cols-1 md:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)] gap-6 p-5 sm:p-6 bajo:sm:p-5">
                        <div className="w-full aspect-square md:aspect-auto md:h-72 xl:h-80 bajo:xl:h-64 rounded-xl overflow-hidden border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] flex items-center justify-center">
                            {selectedDish.imageUrl ? (
                                <img src={selectedDish.imageUrl} alt={selectedDish.dishName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-semibold text-br-s800">Sin imagen</span>
                            )}
                        </div>

                        <div className="flex flex-col justify-center gap-4 min-w-0 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                {selectedDish.dishCategoryLabel && (
                                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-bg-t50 text-br-t950 ring-1 ring-bd-t800/30">{selectedDish.dishCategoryLabel}</span>
                                )}
                                <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-semibold ${enabled ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>
                                    <span className={`h-2 w-2 rounded-full ${enabled ? "bg-green-700" : "bg-red-700"}`} />
                                    {enabled ? "Habilitado" : "Deshabilitado"}
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-br-s950">{selectedDish.dishName}</h2>

                            {selectedDish.dishPrice && (
                                <p className="text-2xl font-bold text-br-t900">
                                    ${Number(selectedDish.dishPrice).toLocaleString("es-CO")}
                                </p>
                            )}

                            {selectedDish.dishDescription && (
                                <p className="text-base text-br-s900 max-w-prose mx-auto md:mx-0">{selectedDish.dishDescription}</p>
                            )}

                            {selectedDish.categoryDisabled && (
                                <p className="inline-block self-start rounded bg-red-50 px-2 py-0.5 text-red-900 font-medium text-sm">
                                    Esta categoria se encuentra deshabilitada
                                </p>
                            )}

                            <div className="flex justify-center md:justify-start">
                                <Button variant="espresso" size="lgg" type="button" onClick={handleEdit}>
                                    <Pencil size={18} />
                                    Actualizar menu
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] p-4 sm:p-5 bajo:sm:p-4 flex flex-col gap-4 bajo:gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                                <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                                Platillos del menú
                            </h2>
                            <SearchField
                                value={search}
                                onChange={handleSearch}
                                placeholder="Buscar platillo por Nombre"
                                ariaLabel="Buscar platillo por nombre"
                                variant="latte"
                                className="w-full sm:w-80"
                            />
                        </div>

                        {visibleDishes.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                                {visibleDishes.map((item) => (
                                    <Button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSelectedDish(item)}
                                        className={`flex flex-col rounded-xl overflow-hidden border-2 bg-bg-w shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-t200 ${selectedDish.id === item.id ? "border-bd-t800 shadow-md" : "border-bd-s100 hover:border-bd-s400"}`}
                                    >
                                        <div className="w-full h-24 bajo:h-20 bg-bg-s50 flex items-center justify-center">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.dishName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-semibold text-br-s800">Sin imagen</span>
                                            )}
                                        </div>
                                        <span className="flex flex-col gap-0.5 px-3 py-2 text-left">
                                            <span className="text-sm font-semibold text-br-s950 truncate">{item.dishName}</span>
                                            <span className="text-sm font-bold text-br-t900">${Number(item.dishPrice).toLocaleString("es-CO")}</span>
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <p className="py-6 text-center text-sm font-semibold text-br-s800">No se encontraron platillos con ese nombre.</p>
                        )}

                        {pageCount > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <Button
                                    type="button"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 0}
                                    aria-label="Página anterior"
                                    className="h-9 min-w-9 px-3 rounded-lg text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-t200 disabled:opacity-40 disabled:cursor-not-allowed border-bd-s300 bg-bg-w text-br-s950 hover:bg-bg-t50"
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                {Array.from({ length: pageCount }, (_, index) => (
                                    <Button
                                        key={index}
                                        type="button"
                                        onClick={() => setPage(index)}
                                        className={`h-9 min-w-9 px-3 rounded-lg text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-t200 disabled:opacity-40 disabled:cursor-not-allowed ${index === page ? "border-bd-s950 bg-bg-s950 text-bg-w" : "border-bd-s300 bg-bg-w text-br-s950 hover:bg-bg-t50"}`}
                                    >
                                        {index + 1}
                                    </Button>
                                ))}
                                <Button
                                    type="button"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === pageCount - 1}
                                    aria-label="Página siguiente"
                                    className="h-9 min-w-9 px-3 rounded-lg text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-t200 disabled:opacity-40 disabled:cursor-not-allowed border-bd-s300 bg-bg-w text-br-s950 hover:bg-bg-t50"
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

        </div>
    );
}

export default DishDetails;
