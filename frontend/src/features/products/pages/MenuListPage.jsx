// src/features/products/pages/MenuListPage.jsx
// Listado del menu con filtros, cambio de estado y reportes
import { DataTable, Navbar, DetailModal } from "@/shared/index";
import CategoriesPage from "@/features/products/pages/CategoriesPage";
import DishDetailModal from "@/features/products/components/DishDetailModal"
import CreateDishsForm from "@/features/products/components/CreateDishsForm"
import { createMenuColumns, menuFilters, menuInitialSort } from "@/features/products/table/ColumnsMenu"
import { getDishes, getDishesReport, updateDishStatus } from "@/features/products/services/dishService"
import { showErrorAlert } from "@/shared/services/alertService"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/shared/index"
import ReportConfigModal from "@/shared/reports/components/ReportConfigModal"
import { menuReportFields, menuReportScopes } from "@/features/products/reports/config/menuReportFields"
import { useEffect, useMemo, useState } from "react"
import { UtensilsCrossed, Tags, Plus } from "lucide-react"
import fotoFondo from "@/assets/images/fondo-dish.png";
import { useAccess } from "@/features/auth/services/accessService";


export default function MenuListPage () {
    // permisos del usuario: lo que no puede hacer no se muestra (el backend igual lo bloquea)
    const can = useAccess();

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    // Copia de los platillos para reflejar al instante los cambios de estado
    const [rows, setRows] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    // al volver de editar llega el id del platillo para abrir su detalle; desde el buscador llega createDish
    const [selectedId, setSelectedId] = useState(location.state?.openDish ?? null);
    const [createOpen, setCreateOpen] = useState(Boolean(location.state?.createDish));
    // cambia cada vez que se cierran las categorias, asi el formulario de crear recarga su select
    const [categoriesKey, setCategoriesKey] = useState(0);

    const handleView = (dish) => setSelectedId(dish.id);
    // categorias: lista corta, se maneja en una ventana sin salir del menu
    const [categoriesOpen, setCategoriesOpen] = useState(false);

    const handleEdit = (dish) => navigate(`/dishEdit/menu-${dish.id}`);

    // Columnas de la tabla con las acciones de ver, editar y cambiar estado
    const columns = useMemo(
        () => createMenuColumns({ onView: can("menu_visualizar") ? handleView : undefined, onEdit: can("menu_actualizar") ? handleEdit : undefined, onStatusChange: !can("menu_habilitar") ? undefined : async (dish, value, reason) => {
            await updateDishStatus(dish.id, value, reason);
            setRows((prev) => prev.map((d) => (d.id === dish.id ? { ...d, is_active: value } : d)));
        } }),
        [can]
    );

    // platillos reales que llegan de la base
    const loadRows = () => getDishes().then(setRows).catch((error) => showErrorAlert({ title: "No se pudo cargar el menú", text: error.message, confirmButtonText: "Entendido", timer: 4000 }));

    useEffect(() => {
        // se limpia el estado de la navegacion para que al recargar no se vuelva a abrir la ventana
        if (location.state) navigate(location.pathname, { replace: true, state: null });
        loadRows();
    }, []);

    // platillo guardado: se cierra la ventana, se recarga el menu y se abre su detalle
    const handleCreated = async (dishId) => {
        setCreateOpen(false);
        await loadRows();
        setSelectedId(dishId);
    };

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
                    subtitle="Gestiona los platillos y bebidas disponibles en la carta."
                    onBack={() => navigate("/home")}
                    className="rounded-m3-lg shadow-m3-2"
                    actions={
                        <>
                            <Button size="sm" variant="crema" onClick={() => setCategoriesOpen(true)}>
                                Categorías
                            </Button>

                            {can("menu_reporte") && (
                                <Button size="sm" variant="crema" onClick={() => setIsReportModalOpen(true)}>
                                    Reportar menú
                                </Button>
                            )}

                            {can("menu_agregar") && (
                                <Button size="sm" variant="crema" onClick={() => setCreateOpen(true)}>
                                    Agregar platillo
                                </Button>
                            )}
                        </>
                    }
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
                onEdit={can("menu_actualizar") ? handleEdit : undefined}
            />

            {/* crear platillo en ventana: no se cierra tocando afuera para no perder lo escrito */}
            <DetailModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                icon={Plus}
                title="Crear plato"
                subtitle="Foto, nombre, precio, categoría y descripción del platillo"
                size="max-w-6xl"
                bodyClassName="grid-cols-1"
                footer={false}
                closeOnBackdrop={false}
            >
                <CreateDishsForm
                    onDone={handleCreated}
                    onCancel={() => setCreateOpen(false)}
                    onManageCategories={() => setCategoriesOpen(true)}
                    categoriesKey={categoriesKey}
                />
            </DetailModal>

            {/* categorias en ventana; al cerrarla se recarga el menu por si cambio algun nombre */}
            <DetailModal
                open={categoriesOpen}
                onClose={() => {
                    setCategoriesOpen(false);
                    setCategoriesKey((key) => key + 1);
                    loadRows();
                }}
                icon={Tags}
                title="Categorías del menú"
                subtitle="Lo que crees aquí aparece al crear platillos y al tomar órdenes"
                size="max-w-4xl"
                bodyClassName="grid-cols-1"
            >
                <CategoriesPage inModal />
            </DetailModal>

            <ReportConfigModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Generar reporte de menú"
                data={rows}
                fetchReport={getDishesReport}
                fields={menuReportFields}
                scopes={menuReportScopes}
                fileNamePrefix="menu-report"
                reportTitle="Reporte de Menú"
                sheetName="Menu"
            />
        </div>
    )
}