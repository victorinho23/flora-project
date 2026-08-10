// src/features/inventory/pages/InventoryUpdatePage.jsx

// Hook de React para manejar el estado de busqueda y las cantidades editadas
import { useMemo, useState } from "react";

// Iconos usados en el encabezado y la tabla
import { RefreshCw, Bell } from "lucide-react";

import { SearchField, Button } from "../../../shared";
import { inventory as initialInventory } from "../data/inventory";

// Cantidad minima permitida por producto antes de marcarlo como bajo stock
const CANTIDAD_MINIMA = 10;

export default function InventoryUpdatePage() {

    // Copia editable del inventario (las cantidades se actualizan localmente)
    const [items, setItems] = useState(initialInventory);

    // Texto del buscador
    const [search, setSearch] = useState("");

    // Filtra por nombre, marca o codigo de barras
    const filteredItems = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return items;

        return items.filter((item) =>
            [item.nombre, item.marca, item.codigoBarras]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(term))
        );
    }, [items, search]);

    // Actualiza la cantidad de un producto especifico
    const handleCantidadChange = (id, value) => {
        const nuevaCantidad = Number(value);

        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, cantidad: Number.isNaN(nuevaCantidad) ? 0 : nuevaCantidad }
                    : item
            )
        );
    };

    // Por ahora solo deja la constancia en consola de que se guardo
    // (aqui se conectara la llamada real cuando exista backend)
    const handleGuardar = () => {
        console.log("Guardar cambios de inventario", items);
    };

    return (
        <div className="p-6 lg:p-10 w-full">

            {/* Encabezado */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--color-primary-500)]/40">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[var(--color-primary-200)]">
                        <RefreshCw size={26} className="text-[var(--color-tertiary-600)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-secundary-900)]">
                            Actualizar inventario
                        </h1>
                        <p className="text-sm text-text-secondary">
                            Gestiona y manten actualizadas las existencias de tu inventario.
                        </p>
                    </div>
                </div>

                <Button variant="secondary" size="sm" aria-label="Notificaciones">
                    <Bell size={20} />
                </Button>
            </div>

            {/* Tarjeta clara con el buscador y la tabla editable */}
            <div className="bg-[var(--color-white)]/95 rounded-xl shadow-lg p-6 space-y-4">

                <SearchField
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar por nombre, marca o codigo de barras..."
                    fullWidth
                />

                <div className="overflow-x-auto border rounded">
                    <table className="w-full text-sm">
                        <thead className="bg-[var(--color-gray-100)]">
                            <tr>
                                <th className="p-3 text-left border-b">Id</th>
                                <th className="p-3 text-left border-b">Marca</th>
                                <th className="p-3 text-left border-b">Nombre del producto</th>
                                <th className="p-3 text-left border-b">Codigo de barras</th>
                                <th className="p-3 text-left border-b">Cantidad</th>
                                <th className="p-3 text-left border-b">Valor unitario</th>
                                <th className="p-3 text-left border-b">Estado</th>
                                <th className="p-3 text-left border-b">Fecha de vencimiento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-[var(--color-gray-50)]">
                                    <td className="p-3 border-b">{item.id}</td>
                                    <td className="p-3 border-b">{item.marca}</td>
                                    <td className="p-3 border-b">{item.nombre}</td>
                                    <td className="p-3 border-b">{item.codigoBarras}</td>
                                    <td className="p-3 border-b">
                                        <input
                                            type="number"
                                            min={0}
                                            value={item.cantidad}
                                            onChange={(e) =>
                                                handleCantidadChange(item.id, e.target.value)
                                            }
                                            className={`border rounded px-2 py-1 w-20 ${
                                                item.cantidad < CANTIDAD_MINIMA
                                                    ? "border-[var(--color-tertiary-600)] text-[var(--color-tertiary-700)]"
                                                    : ""
                                            }`}
                                        />
                                    </td>
                                    <td className="p-3 border-b">
                                        $ {(item.valorUnitario ?? 0).toLocaleString("es-CO")}
                                    </td>
                                    <td className="p-3 border-b">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                item.estado === "Disponible"
                                                    ? "bg-[var(--color-primary-200)] text-[var(--color-secundary-900)]"
                                                    : item.estado === "Vencido"
                                                    ? "bg-[var(--color-secundary-800)] text-[var(--color-primary-100)]"
                                                    : "bg-[var(--color-tertiary-200)] text-[var(--color-tertiary-900)]"
                                            }`}
                                        >
                                            {item.estado}
                                        </span>
                                    </td>
                                    <td className="p-3 border-b">{item.fechaVencimiento}</td>
                                </tr>
                            ))}

                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-6 text-center text-[var(--color-gray-400)]">
                                        No se encontraron productos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <p className="text-xs text-[var(--color-secundary-700)]">
                    La cantidad minima de cada producto es de {CANTIDAD_MINIMA}.
                </p>

                <div className="flex justify-end">
                    <Button variant="primary" size="md" onClick={handleGuardar}>
                        Guardar cambios
                    </Button>
                </div>
            </div>
        </div>
    );
}
