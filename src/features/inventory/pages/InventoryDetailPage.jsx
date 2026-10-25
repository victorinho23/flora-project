// src/features/inventory/pages/InventoryDetailPage.jsx

import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

// Componentes reutilizables del sistema de diseño
import { Button, Input, Navbar } from "@/shared";
import { users } from "@/features/users/data/users";

import { ArrowLeft, Pencil, Package } from "lucide-react";

import { inventory } from "../data/inventory";
import fotoFondo from "@/assets/images/fondo-inventory.jpeg";


const STAT = "border border-bd-s100 border-t-[5px] border-t-bd-t800 rounded-[1.25rem] bg-bg-w bg-linear-180 from-bg-w to-bg-p50 shadow-[0_26px_50px_-28px_color-mix(in_srgb,var(--color-bg-s950)_55%,transparent)]";

const toMoney = (value) => (value != null ? `$${Number(value).toLocaleString("es-CO")}` : null);

// Cuenta cuantas letras hay que cambiar para pasar de una palabra a otra
const distance = (a, b) => {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        let prev = row[0];
        row[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const current = row[j];
            row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
            prev = current;
        }
    }
    return row[b.length];
};

// Busca coincidencia exacta por ID, codigo de barras o nombre
const findProduct = (term) => {
    const value = term.trim().toLowerCase();
    return inventory.find((record) => String(record.id).toLowerCase() === value || record.barcode === value || record.name.toLowerCase() === value);
};

// Sugiere productos cuyo nombre difiere en 1 o 2 letras
const suggestionsFor = (term) => {
    const value = term.trim().toLowerCase();
    return inventory.filter((record) => {
        const name = record.name.toLowerCase();
        return distance(name, value) <= 2 || (value.length >= 3 && name.includes(value));
    });
};

export default function InventoryDetailPage() {

    const { id: paramId } = useParams();
    const location = useLocation();
    const id = paramId ?? (location.state?.id != null ? String(location.state.id) : undefined);

    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [searched, setSearched] = useState(null);
    const [searchError, setSearchError] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    // Busca el registro correspondiente en la fuente de datos
    const item = searched ?? inventory.find((record) => String(record.id) === id);

    // Busca el producto y si no existe muestra error o sugerencias
    const handleSearch = (e) => {
        e.preventDefault();
        if (!search.trim()) {
            setSearchError("Escribe el ID, el código de barras o el nombre del producto.");
            setSuggestions([]);
            return;
        }
        const found = findProduct(search);
        if (found) {
            setSearched(found);
            setSearchError("");
            setSuggestions([]);
            return;
        }
        const similar = suggestionsFor(search);
        setSearched(null);
        setSuggestions(similar);
        setSearchError(similar.length
            ? "No existe un producto con ese dato exacto. ¿Quisiste decir alguno de estos?"
            : "No existe un producto con ese nombre, ID o código de barras.");
    };

    // Muestra el producto sugerido que se eligio
    const pickSuggestion = (record) => {
        setSearched(record);
        setSearch(record.name);
        setSearchError("");
        setSuggestions([]);
    };

    const fields = item
        ? [
              { label: "ID", value: item.id },
              { label: "Marca", value: item.brand },
              { label: "Nombre del producto", value: item.name },
              { label: "Código de barras", value: item.barcode },
              { label: "Cuentadante", value: users.find((user) => String(user.id) === String(item.custodian))?.username },
              { label: "Lote", value: item.batch },
              { label: "Cantidad mínima", value: item.minQuantity },
              { label: "Ubicación", value: item.location },
              { label: "Cantidad", value: item.quantity },
              { label: "Cantidad total", value: item.totalQuantity },
              { label: "Valor unitario", value: toMoney(item.unitValue) },
              { label: "Valor total", value: toMoney(item.totalValue) },
              { label: "Estado", value: item.status },
              { label: "Fecha de vencimiento", value: item.expirationDate },
              { label: "Descripción", value: item.description, wide: true },
          ].filter((field) => field.value !== undefined && field.value !== null && field.value !== "")
        : [];

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-6 md:p-10 bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]"
        >
            <div className={`w-full max-w-3xl rounded-xl p-6 md:p-8 ${STAT}`}>

                {/* Encabezado */}
                <Navbar
                    variant="foto"
                    image={fotoFondo}
                    icon={Package}
                    title="Detalle de inventario"
                    subtitle={item ? `Producto #${item.id}` : "Producto no encontrado"}
                    className="mb-6 -mx-6 -mt-6 md:-mx-8 md:-mt-8 rounded-t-lg"
                    actions={
                        <>
                            <Button variant="sex" size="sm" onClick={() => navigate("/listInventory")}>
                                <ArrowLeft size={16} />
                                Volver al listado
                            </Button>

                            {item && (
                                <Button
                                    variant="crema"
                                    size="sm"
                                    onClick={() => navigate("/editInventory", { state: { item } })}
                                >
                                    <Pencil size={16} />
                                    Modificar
                                </Button>
                            )}
                        </>
                    }
                />

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
                    <Input
                        label="Buscar por ID, código de barras o nombre"
                        htmlFor="inventory-search"
                        variant="latte"
                        fullWidth
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Ej: 001, 172345678 o Espresso"
                    />
                    <Button variant="espresso" size="md" type="submit">
                        Buscar
                    </Button>
                </form>

                {searchError && (
                    <div className="mb-6 space-y-3">
                        <p className="text-sm inline-block px-2 py-0.5 rounded bg-red-50 text-red-900 font-medium">{searchError}</p>
                        {suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((record) => (
                                    <Button key={record.id} variant="crema" size="sm" type="button" onClick={() => pickSuggestion(record)}>
                                        {record.name}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Caso: registro no encontrado */}
                {!item ? (
                    <div className="rounded-xl border border-bd-s100 bg-bg-s50 p-6">
                        <p className="text-base text-br-s950">
                            No se encontró el producto. Búscalo por su ID, código de barras o nombre.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fields.map((field) => (
                            <div key={field.label} className={`border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 ${field.wide ? "sm:col-span-2" : ""}`}>
                                <p className="text-sm font-medium text-br-s800 mb-1">{field.label}</p>
                                <div className="text-base font-semibold text-br-s950 break-words">{field.value || "—"}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}