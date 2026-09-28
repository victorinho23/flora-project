// src/features/suppliers/pages/SupplierUpdatePage.jsx

// Hook de React para manejar el estado de busqueda y los datos editados
import { useMemo, useState } from "react";

// Iconos usados en el encabezado
import { RefreshCw, Bell, ArrowLeft } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { SearchField, Button, Switch } from "../../../shared";
import Tablerowactions from "@/shared/components/Tablerowactions";
import SupplierDetailModal from "@/features/users/components/SupplierDetailModal";
import { suppliers as initialSuppliers } from "../data/suppliers";
import authBg from "@/assets/images/white.jpg";

const METAL = "bg-[linear-gradient(180deg,var(--color-br-t50)_0%,var(--color-br-t300)_45%,var(--color-br-t500)_55%,var(--color-br-t400)_100%)] bg-clip-text text-transparent";
const PANEL = "border-2 border-bd-t500 bg-bg-g950/95 backdrop-blur-xl shadow-[0_0_15px_var(--color-tertiary-400),0_0_35px_color-mix(in_srgb,var(--color-tertiary-400)_40%,transparent),0_20px_40px_-12px_rgb(0_0_0/0.6)]";
const TABLA = "bg-bg-g950/95 border-2 border-br-t300 shadow-[0_0_0_1px_var(--color-br-t500),0_0_8px_var(--color-br-t400),0_0_20px_var(--color-br-t500),0_0_45px_color-mix(in_srgb,var(--color-br-t500)_60%,transparent),inset_0_0_12px_color-mix(in_srgb,var(--color-br-t400)_50%,transparent)]";

const COLUMNAS = ["Id", "Empresa", "NIT", "Contacto", "Telefono", "Categoria", "Estado", "Acciones"];

export default function SupplierUpdatePage() {

    // Copia editable de los proveedores (los datos se actualizan localmente)
    const [items, setItems] = useState(initialSuppliers);

    const [selectedSupplier, setSelectedSupplier] = useState(null);

    // Hook para volver al listado despues de guardar
    const navigate = useNavigate();

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
        alert("Proveedores actualizados correctamente");
        navigate("/listSuppliers");
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
                            onClick={() => navigate("/listSuppliers")}
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
                                Actualizar proveedores
                            </h1>
                            <p className="text-sm text-bg-g300">
                                Gestiona y manten actualizados los datos de tus proveedores.
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
                            placeholder="Buscar por empresa, NIT o contacto..."
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
                                        <td className="p-3 border-b border-bd-w/20">{item.companyName}</td>
                                        <td className="p-3 border-b border-bd-w/20">{item.nit}</td>
                                        <td className="p-3 border-b border-bd-w/20">{item.contactName}</td>
                                        <td className="p-3 border-b border-bd-w/20">
                                            <input
                                                type="tel"
                                                value={item.phone}
                                                onChange={(e) =>
                                                    handlePhoneChange(item.id, e.target.value)
                                                }
                                                className="w-32 rounded px-2 py-1 bg-bg-g900/90 border border-bd-w/20 text-text-primary focus:outline-none focus:border-br-t400"
                                            />
                                        </td>
                                        <td className="p-3 border-b border-bd-w/20">{item.category}</td>
                                        <td className="p-3 border-b border-bd-w/20">
                                            <Switch
                                                checked={item.isActive}
                                                onChange={(value) => handleActiveChange(item.id, value)}
                                            />
                                        </td>
                                        <td className="p-3 border-b border-bd-w/20">
                                            <Tablerowactions onView={() => setSelectedSupplier(item)} />
                                        </td>
                                    </tr>
                                ))}

                                {filteredItems.length === 0 && (
                                    <tr>
                                        <td colSpan={COLUMNAS.length} className="p-6 text-center text-br-g400">
                                            No se encontraron proveedores.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end p-4 border-t border-bd-w/20">
                        <Button variant="remolino" size="md" onClick={handleGuardar}>
                            Guardar cambios
                        </Button>
                    </div>
                </div>
            </div>

            <SupplierDetailModal
                supplier={selectedSupplier}
                onClose={() => setSelectedSupplier(null)}
            />
        </div>
    );
}