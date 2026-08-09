import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/shared";

export function DishDetails({ dish, relatedDishes = [] }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    // El platillo seleccionado empieza siendo el "dish" real de la pagina,
    // pero se actualiza al hacer click en cualquier card de la grilla y se queda asi
    const [selectedDish, setSelectedDish] = useState(dish);

    const filteredRelated = relatedDishes.filter((item) =>
        item.dishName.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = () => {
        navigate(`/dishEdit/${selectedDish.id}`);
    };

    const handleSelect = (item) => {
        setSelectedDish(item);
    };

    return (
        <div className="min-h-screen flex flex-col">

            <div className="w-full bg-bg-s700 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 bg-bg-s900/90 border border-bd-w/15">
                <div className="w-8" />
                <h1 className="text-title text-bg-w font-bold text-center">
                    Visualizar Menu
                </h1>
                <Button
                    type="button"
                    onClick={() => navigate("/createDishes")}
                    className="text-bg-w hover:text-bg-w/70 transition-colors"
                    aria-label="Volver"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>
            </div>

            <div className="flex-1 px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
                <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-10">

                    {/* Columna izquierda: buscador + platillo seleccionado + grilla */}
                    <div className="flex flex-col gap-6 lg:flex-[2] lg:min-w-0">

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bg-w/60" />
                            <input
                                type="text"
                                placeholder="Buscar platillo por Nombre"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 rounded-lg bg-bg-w/10 backdrop-blur-md border border-bg-w/30 text-bg-w placeholder-bg-w/60 focus:outline-none focus:border-bg-w/60"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 bg-bg-s800/60 border border-bd-w/15 rounded-2xl p-4 backdrop-blur-sm transition-all duration-300">
                            <div className="w-full sm:w-40 h-40 rounded-xl overflow-hidden bg-bg-s900 flex items-center justify-center flex-shrink-0">
                                {selectedDish.imageUrl ? (
                                    <img
                                        src={selectedDish.imageUrl}
                                        alt={selectedDish.dishName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <p className="text-bg-w/50 text-xs px-2 text-center">Sin imagen</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 justify-center">
                                <p className="text-bg-w font-bold">
                                    {selectedDish.dishName}
                                </p>
                                {selectedDish.dishPrice && (
                                    <p className="text-lg font-bold text-bg-w">
                                        ${Number(selectedDish.dishPrice).toLocaleString()}
                                    </p>
                                )}
                                {selectedDish.dishDescription && (
                                    <p className="text-bg-w/80 text-sm">
                                        {selectedDish.dishDescription}
                                    </p>
                                )}
                                {selectedDish.categoryDisabled && (
                                    <p className="text-red-400 text-xs">
                                        Esta categoria se encuentra deshabilitada
                                    </p>
                                )}
                            </div>
                        </div>

                        {filteredRelated.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {filteredRelated.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleSelect(item)}
                                        className={`
                                            flex flex-col rounded-xl overflow-hidden border transition-all
                                            ${selectedDish.id === item.id
                                                ? "border-br-t500 shadow-[0_0_12px_var(--color-br-t500)]/40"
                                                : "border-bd-w/15 hover:border-bd-w/40"
                                            }
                                        `}
                                    >
                                        <div className="w-full h-28 bg-bg-s900 flex items-center justify-center">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.dishName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <p className="text-bg-w/40 text-xs">Sin imagen</p>
                                            )}
                                        </div>
                                        <span className="bg-bg-s800/80 text-bg-w text-sm font-semibold px-2 py-2 text-center">
                                            {item.dishName}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Columna derecha: panel del platillo seleccionado */}
                    <div className="flex flex-col gap-4 lg:flex-1 lg:min-w-0">

                        <div className="w-full h-72 rounded-xl overflow-hidden bg-bg-s900 flex items-center justify-center transition-all duration-300">
                            {selectedDish.imageUrl ? (
                                <img
                                    src={selectedDish.imageUrl}
                                    alt={selectedDish.dishName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <p className="text-bg-w/50 text-sm">Sin imagen</p>
                            )}
                        </div>

                        <div className="bg-bg-s800/60 border border-bd-w/15 rounded-xl p-4">
                            <p className="text-bg-w font-bold text-center">
                                {selectedDish.dishName}
                            </p>
                            {selectedDish.dishDescription && (
                                <p className="text-bg-w/80 text-sm text-center mt-2">
                                    {selectedDish.dishDescription}
                                </p>
                            )}
                        </div>

                        <div
                            className={`
                                flex items-center justify-center gap-2
                                px-5 py-3 rounded-lg font-semibold text-white
                                ${(selectedDish.isEnabled ?? true) ? "bg-green-600" : "bg-red-600"}
                            `}
                        >
                            <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                            {(selectedDish.isEnabled ?? true) ? "Habilitado" : "Deshabilitado"}
                        </div >

                        <Button
                            variant="primary"
                            size="lggg"
                            type="button"
                            onClick={handleEdit}
                        >
                            Actualizar menu
                        </Button>

                    </div>

                </div>
            </div>

        </div>
    );
}

export default DishDetails;