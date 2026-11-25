// src/features/products/pages/ViewMenuListPage.jsx
// Consulta del menu con filtros y reportes
import { DataTable, Navbar } from "@/shared/index";
import DishDetailModal from "@/features/products/components/DishDetailModal"
import { createMenuColumns, menuFilters, menuInitialSort } from "@/features/products/table/ColumnsMenu"
import { getDishes, updateDishStatus } from "@/features/products/services/dishService"
import { showErrorAlert } from "@/shared/services/alertService"
import { useEffect, useMemo, useState } from "react"
import { UtensilsCrossed } from "lucide-react"
import fotoFondo from "@/assets/images/fondo-dish.png";
import { useAccess } from "@/features/auth/services/accessService";


export default function ViewMenuListPage () {
    // permisos del usuario: lo que no puede hacer no se muestra (el backend igual lo bloquea)
    const can = useAccess();

    const [selectedId, setSelectedId] = useState(null);
    const [rows, setRows] = useState([]);

    // Columnas de la tabla, aqui solo se puede ver el detalle
    const columns = useMemo(
        () => createMenuColumns({ onView: can("menu_visualizar") ? (dish) => setSelectedId(dish.id) : undefined, onStatusChange: !can("menu_habilitar") ? undefined : async (dish, value, reason) => {
            await updateDishStatus(dish.id, value, reason);
            setRows((prev) => prev.map((d) => (d.id === dish.id ? { ...d, is_active: value } : d)));
        } }),
        [can]
    );

    // platillos reales que llegan de la base
    useEffect(() => {
        getDishes().then(setRows).catch((error) => showErrorAlert({ title: "No se pudo cargar el menú", text: error.message, confirmButtonText: "Entendido", timer: 4000 }));
    }, []);

    // Datos para las tarjetas de resumen
    const totalDishes = rows.length;
    const avgPrice = totalDishes
        ? Math.round(rows.reduce((sum, d) => sum + (d.price || 0), 0) / totalDishes)
        : 0;

    return (
        <div className="p-6 md:p-10 min-h-screen bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            <div className="w-full space-y-6">
                <Navbar
                    variant="foto"
                    navigation
                    image={fotoFondo}
                    icon={UtensilsCrossed}
                    title="Menú"
                    subtitle="Consulta los platillos y bebidas disponibles en la carta."
                    className="rounded-m3-lg shadow-m3-2"
                />

                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-m3-lg bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-m3-2">
                        <p className="text-sm font-medium text-bg-w">Total de platillos</p>
                        <p className="text-2xl font-bold text-bg-w">{totalDishes}</p>
                    </div>
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-m3-lg bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-m3-2">
                        <p className="text-sm font-medium text-bg-w">Precio promedio</p>
                        <p className="text-2xl font-bold text-bg-w">${avgPrice.toLocaleString("es-CO")}</p>
                    </div>
                </div>

                <DataTable variant="cafe" data={rows} columns={columns} filters={menuFilters(rows)} initialSort={menuInitialSort} />
            </div>
            <DishDetailModal
                dish={rows.find((d) => d.id === selectedId)}
                onClose={() => setSelectedId(null)}
            />
        </div>
    )
}