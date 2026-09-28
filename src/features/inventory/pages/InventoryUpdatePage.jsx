// src/features/inventory/pages/InventoryUpdatePage.jsx

// Hook de React para manejar el estado de busqueda y las cantidades editadas
import { useMemo, useState } from "react";

// Iconos usados en el encabezado y la tabla
import { RefreshCw, Bell, ArrowLeft } from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

import { SearchField, Button } from "../../../shared";
import Tablerowactions from "@/shared/components/Tablerowactions";
import authBg from "@/assets/images/white.jpg";
import { inventory as initialInventory } from "../data/inventory";

// Cantidad minima permitida por producto antes de marcarlo como bajo stock
const MIN_QUANTITY = 10;

const METAL = "bg-[linear-gradient(180deg,var(--color-br-t50)_0%,var(--color-br-t300)_45%,var(--color-br-t500)_55%,var(--color-br-t400)_100%)] bg-clip-text text-transparent";
const PANEL = "border-2 border-bd-t500 bg-bg-g950/95 backdrop-blur-xl shadow-[0_0_15px_var(--color-tertiary-400),0_0_35px_color-mix(in_srgb,var(--color-tertiary-400)_40%,transparent),0_20px_40px_-12px_rgb(0_0_0/0.6)]";
const TABLA = "bg-bg-g950/95 border-2 border-br-t300 shadow-[0_0_0_1px_var(--color-br-t500),0_0_8px_var(--color-br-t400),0_0_20px_var(--color-br-t500),0_0_45px_color-mix(in_srgb,var(--color-br-t500)_60%,transparent),inset_0_0_12px_color-mix(in_srgb,var(--color-br-t400)_50%,transparent)]";

const COLUMNAS = ["Id", "Marca", "Nombre del producto", "Codigo de barras", "Cantidad", "Valor unitario", "Estado", "Fecha de vencimiento", "Acciones"];

const statusStyle = (status) => {
    if (status === "Disponible") return "bg-br-t300/15 text-br-t200 border border-br-t300/40";
    if (status === "Vencido") return "bg-red-500/15 text-red-300 border border-red-400/40";
    return "bg-br-t500/20 text-br-t200 border border-br-t500/50";
};

export default function InventoryUpdatePage() {

    // Copia editable del inventario (las cantidades se actualizan localmente)
    const [items, setItems] = useState(initialInventory);

    // Hook para volver al listado despues de guardar
    const navigate = useNavigate();

    // Texto del buscador
    const location = useLocation();
    const [search, setSearch] = useState(location.state?.search ?? "");

    // Filtra por nombre, marca o codigo de barras
    const filteredItems = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return items;

        return items.filter((item) =>
            [item.name, item.brand, item.barcode]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(term))
        );
    }, [items, search]);

    // Actualiza la cantidad de un producto especifico
    const handleQuantityChange = (id, value) => {
        const newQuantity = Number(value);

        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, quantity: Number.isNaN(newQuantity) ? 0 : newQuantity }
                    : item
            )
        );
    };

    // Por ahora solo deja la constancia en consola de que se guardo
    // (aqui se conectara la llamada real cuando exista backend)
    const handleSave = () => {
        console.log("Guardar cambios de inventario", items);
        alert("Inventario actualizado correctamente");
        navigate("/listInventory");
    };

    return (
        <div
            className="p-6 md:p-10 bg-fixed min-h-screen"
            style={{
                backgroundImage: `url(${authBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="w-full space-y-6">

                {/* Encabezado */}
                <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl p-5 ${PANEL}`}>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/listInventory")}
                            className="text-bg-w hover:text-bg-g300 transition-colors"
                            aria-label="Volver"
                        >
                            <ArrowLeft className="w-7 h-7" />
                        </button>

                        <div className="p-3 rounded-lg bg-bg-g900 border border-bd-t500/60">
                            <svg width="0" height="0" className="absolute" aria-hidden="true">
                                <defs>
                                    <linearGradient id="metalCaramelo" x1="0" y1="2" x2="0" y2="22" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" style={{ stopColor: "var(--color-br-t50)" }} />
                                        <stop offset="45%" style={{ stopColor: "var(--color-br-t300)" }} />
                                        <stop offset="55%" style={{ stopColor: "var(--color-br-t500)" }} />
                                        <stop offset="100%" style={{ stopColor: "var(--color-br-t400)" }} />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <RefreshCw size={26} color="url(#metalCaramelo)" />
                        </div>

                        <div>
                            <h1 className={`text-2xl font-bold ${METAL}`}>
                                Actualizar inventario
                            </h1>
                            <p className="text-sm text-bg-g300">
                                Gestiona y manten actualizadas las existencias de tu inventario.
                            </p>
                        </div>
                    </div>

                    <Button variant="remolino" size="sm" aria-label="Notificaciones">
                        <Bell size={18} />
                    </Button>
                </div>

                <div className={`rounded-xl overflow-hidden ${TABLA}`}>

                    <div className="p-4">
                        <SearchField
                            value={search}
                            onChange={setSearch}
                            placeholder="Buscar por nombre, marca o codigo de barras..."
                            variant="twentieth"
                            fullWidth
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-bg-g950">
                                <tr>
                                    {COLUMNAS.map((col) => (
                                        <th
                                            key={col}
                                            className={`p-3 text-left font-semibold border-b border-bd-w/20 ${METAL}`}
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredItems.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={`text-br-t100 transition-colors duration-150 hover:bg-bg-w/10 ${index % 2 === 1 ? "bg-bg-w/5" : ""}`}
                                    >
                                        <td className="p-3 border-b border-bd-w/20">{item.id}</td>
                                        <td className="p-3 border-b border-bd-w/20">{item.brand}</td>
                                        <td className="p-3 border-b border-bd-w/20">{item.name}</td>
                                        <td className="p-3 border-b border-bd-w/20">{item.barcode}</td>
                                        <td className="p-3 border-b border-bd-w/20">
                                            <input
                                                type="number"
                                                min={0}
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleQuantityChange(item.id, e.target.value)
                                                }
                                                className={`w-20 rounded px-2 py-1 bg-bg-g900/90 border text-text-primary focus:outline-none focus:border-br-t400 ${
                                                    item.quantity < MIN_QUANTITY
                                                        ? "border-br-t400 text-br-t300"
                                                        : "border-bd-w/20"
                                                }`}
                                            />
                                        </td>
                                        <td className="p-3 border-b border-bd-w/20">
                                            $ {(item.unitValue ?? 0).toLocaleString("es-CO")}
                                        </td>
                                        <td className="p-3 border-b border-bd-w/20">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-3 border-b border-bd-w/20">{item.expirationDate}</td>
                                        <td className="p-3 border-b border-bd-w/20">
                                            <Tablerowactions
                                                onView={() => navigate("/detailsInventory", { state: { id: item.id } })}
                                            />
                                        </td>
                                    </tr>
                                ))}

                                {filteredItems.length === 0 && (
                                    <tr>
                                        <td colSpan={COLUMNAS.length} className="p-6 text-center text-br-g400">
                                            No se encontraron productos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-bd-w/20">
                        <p className="text-xs text-bg-g300">
                            La cantidad minima de cada producto es de {MIN_QUANTITY}. Las cantidades por debajo se resaltan en caramelo.
                        </p>

                        <Button variant="remolino" size="md" onClick={handleSave}>
                            Guardar cambios
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}