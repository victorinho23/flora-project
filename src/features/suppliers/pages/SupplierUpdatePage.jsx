// src/features/suppliers/pages/SupplierUpdatePage.jsx

// Hook de React para manejar el estado de busqueda y los datos editados
import { useMemo, useState } from "react";

// Iconos usados en el encabezado
import { RefreshCw, Bell } from "lucide-react";

import { SearchField, Button, Switch } from "../../../shared";
import { suppliers as initialSuppliers } from "../data/suppliers";

export default function SupplierUpdatePage() {

    // Copia editable de los proveedores (los datos se actualizan localmente)
    const [items, setItems] = useState(initialSuppliers);

    // Texto del buscador
    const [search, setSearch] = useState("");

    // Filtra por empresa, NIT o contacto
    const filteredItems = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return items;

        return items.filter((item) =>
            [item.companyName, item.nit, item.contactName]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(term))
        );
    }, [items, search]);

    // Actualiza el telefono de un proveedor especifico
    const handlePhoneChange = (id, value) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, phone: value } : item
            )
        );
    };

    // Actualiza el estado activo/inactivo de un proveedor especifico
    const handleActiveChange = (id, value) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isActive: value } : item
            )
        );
    };

    // Por ahora solo deja la constancia en consola de que se guardo
    // (aqui se conectara la llamada real cuando exista backend)
    const handleGuardar = () => {
        console.log("Guardar cambios de proveedores", items);
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
                            Actualizar proveedores
                        </h1>
                        <p className="text-sm text-text-secondary">
                            Gestiona y manten actualizados los datos de tus proveedores.
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
                    placeholder="Buscar por empresa, NIT o contacto..."
                    fullWidth
                />

                <div className="overflow-x-auto border rounded">
                    <table className="w-full text-sm">
                        <thead className="bg-[var(--color-gray-100)]">
                            <tr>
                                <th className="p-3 text-left border-b">Id</th>
                                <th className="p-3 text-left border-b">Empresa</th>
                                <th className="p-3 text-left border-b">NIT</th>
                                <th className="p-3 text-left border-b">Contacto</th>
                                <th className="p-3 text-left border-b">Telefono</th>
                                <th className="p-3 text-left border-b">Categoria</th>
                                <th className="p-3 text-left border-b">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-[var(--color-gray-50)]">
                                    <td className="p-3 border-b">{item.id}</td>
                                    <td className="p-3 border-b">{item.companyName}</td>
                                    <td className="p-3 border-b">{item.nit}</td>
                                    <td className="p-3 border-b">{item.contactName}</td>
                                    <td className="p-3 border-b">
                                        <input
                                            type="tel"
                                            value={item.phone}
                                            onChange={(e) =>
                                                handlePhoneChange(item.id, e.target.value)
                                            }
                                            className="border rounded px-2 py-1 w-32"
                                        />
                                    </td>
                                    <td className="p-3 border-b">{item.category}</td>
                                    <td className="p-3 border-b">
                                        <Switch
                                            checked={item.isActive}
                                            onChange={(value) => handleActiveChange(item.id, value)}
                                        />
                                    </td>
                                </tr>
                            ))}

                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-6 text-center text-[var(--color-gray-400)]">
                                        No se encontraron proveedores.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end">
                    <Button variant="primary" size="md" onClick={handleGuardar}>
                        Guardar cambios
                    </Button>
                </div>
            </div>
        </div>
    );
}
