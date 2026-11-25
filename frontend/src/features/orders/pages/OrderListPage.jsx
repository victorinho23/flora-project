// src/features/orders/pages/OrderListPage.jsx
// Listado de ordenes con filtros por mesa, estado, mesero y fecha
import { DataTable, Navbar } from "@/shared/index";
import OrderDetailModal from "@/features/orders/components/OrderDetailModal"
import TablePickerModal from "@/features/orders/components/TablePickerModal"
import { createOrderColumns, orderFilters, orderDateFilter, orderInitialSort } from "@/features/orders/table/OrderColumns"
import { getOrders, getOrdersReport } from "@/features/orders/services/orderService"
import { showErrorAlert } from "@/shared/services/alertService"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/shared/index"
import ReportConfigModal from "@/shared/reports/components/ReportConfigModal"
import { orderReportFields, orderReportScopes, orderReportFilters, orderReportDateRange } from "@/features/orders/reports/config/orderReportFields"
import { useEffect, useMemo, useState } from "react"
import { ClipboardList, Utensils } from "lucide-react"
import fotoFondo from "@/assets/images/fondo-orders.png";
import { useAccess } from "@/features/auth/services/accessService";


// cada cuanto se vuelve a pedir las ordenes para ver lo que cambian otros meseros o la cocina
const REFRESH_MS = 30000;

export default function OrderListPage () {
    // permisos del usuario: lo que no puede hacer no se muestra (el backend igual lo bloquea)
    const can = useAccess();

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [rows, setRows] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    // al volver de crear o editar una orden llega su id para abrirla de una vez en el modal
    const [selectedId, setSelectedId] = useState(location.state?.openOrder ?? null);
    const [tablesOpen, setTablesOpen] = useState(false);

    const handleView = (order) => setSelectedId(order.id);
    const handleEdit = (order) => navigate(`/orderEdit/${order.id}`);

    // Columnas de la tabla con las acciones de ver y editar
    const columns = useMemo(
        () => createOrderColumns({ onView: can("ordenes_visualizar") ? handleView : undefined, onEdit: handleEdit }),
        [can]
    );

    // ordenes reales que llegan de la base, y se refrescan solas cada 30 segundos
    const load = () => getOrders().then(setRows).catch((error) => showErrorAlert({ title: "No se pudieron cargar las órdenes", text: error.message, confirmButtonText: "Entendido", timer: 4000 }));

    useEffect(() => {
        // se limpia el estado de la navegacion para que al recargar no se vuelva a abrir el modal
        if (location.state?.openOrder) navigate(location.pathname, { replace: true, state: null });
        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => clearInterval(timer);
    }, []);

    // Diccionario por id que se arma una vez cada que llegan las ordenes, asi el modal la busca directo
    const ordersById = useMemo(() => new Map(rows.map((order) => [order.id, order])), [rows]);

    // Mesas: ocupada -> abre el detalle de su orden en el modal; libre -> crear orden con la mesa puesta
    const pickTable = (table, order) => {
        setTablesOpen(false);
        if (order) setSelectedId(order.id);
        else if (can("ordenes_crear")) navigate("/createOrders", { state: { tableNumber: String(table) } });
    };

    // Datos para las tarjetas de resumen
    const totalOrders = rows.length;
    const totalRevenue = rows.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalItems = rows.reduce((sum, o) => sum + (o.quantity || 0), 0);

    return (
        <div className="p-6 md:p-10 min-h-screen bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            <div className="w-full space-y-6">
                <Navbar
                    variant="foto"
                    navigation
                    image={fotoFondo}
                    icon={ClipboardList}
                    title="Lista de órdenes"
                    subtitle="Consulta y gestiona las órdenes registradas en la cafetería."
                    onBack={() => navigate("/home")}
                    className="rounded-m3-lg shadow-m3-2"
                    actions={
                        <>
                            <Button size="sm" variant="crema" onClick={() => setTablesOpen(true)}>
                                <Utensils size={16} />
                                Mesas
                            </Button>

                            {can("ordenes_reporte") && (
                                <Button size="sm" variant="crema" onClick={() => setIsReportModalOpen(true)}>
                                    Reportar orden
                                </Button>
                            )}

                            {can("ordenes_crear") && (
                                <Button size="sm" variant="crema" onClick={() => navigate("/createOrders")}>
                                    Agregar orden
                                </Button>
                            )}
                        </>
                    }
                />


                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-m3-lg bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-m3-2">
                        <p className="text-sm font-medium text-bg-w">Total de órdenes</p>
                        <p className="text-2xl font-bold text-bg-w">{totalOrders}</p>
                    </div>
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-m3-lg bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-m3-2">
                        <p className="text-sm font-medium text-bg-w">Ingresos totales</p>
                        <p className="text-2xl font-bold text-bg-w">${totalRevenue.toLocaleString("es-CO")}</p>
                    </div>
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-m3-lg bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-m3-2">
                        <p className="text-sm font-medium text-bg-w">Productos vendidos</p>
                        <p className="text-2xl font-bold text-bg-w">{totalItems}</p>
                    </div>
                </div>

                <DataTable variant="cafe" data={rows} columns={columns} filters={orderFilters(rows)} dateFilter={orderDateFilter} initialSort={orderInitialSort} />
            </div>
            <OrderDetailModal
                order={ordersById.get(selectedId)}
                onClose={() => setSelectedId(null)}
                onEdit={can("ordenes_actualizar") ? handleEdit : undefined}
                onChanged={load}
            />

            <TablePickerModal
                open={tablesOpen}
                onClose={() => setTablesOpen(false)}
                onPick={pickTable}
                canOpenFree={can("ordenes_crear")}
            />

            <ReportConfigModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Generar reporte de órdenes"
                data={rows}
                fetchReport={getOrdersReport}
                fields={orderReportFields}
                scopes={orderReportScopes}
                filters={orderReportFilters(rows)}
                dateRange={orderReportDateRange}
                fileNamePrefix="orders-report"
                reportTitle="Reporte de Órdenes"
                sheetName="Ordenes"
            />
        </div>
    )
}