// src/features/users/pages/OrderListPage.jsx
// Listado de ordenes con filtros por mesa, estado, mesero y fecha
import { DataTable, Navbar } from "../../../shared";
import OrderDetailModal from "@/features/orders/components/OrderDetailModal"
import { createOrderColumns, orderFilters, orderDateFilter, orderInitialSort } from "../table/OrderColumns"
import { orders } from "../data/orders"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../../shared"
import ReportConfigModal from "../reports/components/ReportConfigModal"
import { orderReportFields, orderReportScopes, orderReportFilters, orderReportDateRange } from "../reports/config/orderReportFields"
import { useMemo, useState } from "react"
import { ClipboardList } from "lucide-react"
import fotoFondo from "@/assets/images/fondo-orders.png";


// Convierte una orden de la tabla al formato que usa el formulario de edicion
const toOrderDetail = (order) => ({
    id: String(order.id),
    tableNumber: String(order.tableNumber),
    waiterName: order.waiter,
    waiterId: "",
    items: [
        {
            dishId: `orden-${order.id}`,
            dishName: order.product,
            price: String(order.quantity ? Math.round(order.total / order.quantity) : order.total),
            image: null,
            quantity: order.quantity,
        },
    ],
    notes: "",
    status: order.status,
    customer: order.customer,
    createdAt: order.createdAt,
});

export default function OrderListPage () {

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [rows] = useState(orders);
    const navigate = useNavigate();

    const [selectedId, setSelectedId] = useState(null);

    const handleView = (order) => setSelectedId(order.id);
    const handleEdit = (order) => navigate(`/orderEdit/${order.id}`, { state: { order: toOrderDetail(order) } });

    // Columnas de la tabla con las acciones de ver y editar
    const columns = useMemo(
        () => createOrderColumns({ onView: handleView, onEdit: handleEdit }),
        []
    );

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
                    onBack={() => navigate("/createOrders")}
                    className="rounded-[1.25rem] shadow-[0_22px_48px_-26px_color-mix(in_srgb,var(--color-bg-s950)_70%,transparent)]"
                    actions={
                        <>
                            <Button size="sm" variant="crema" onClick={() => setIsReportModalOpen(true)}>
                                Reportar orden
                            </Button>

                            <Link to="/createOrders">
                                <Button size="sm" variant="crema">
                                    Agregar orden
                                </Button>
                            </Link>
                        </>
                    }
                />

                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-[1.25rem] bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-[0_18px_36px_-20px_color-mix(in_srgb,var(--color-bg-t950)_75%,transparent)]">
                        <p className="text-sm font-medium text-bg-w">Total de órdenes</p>
                        <p className="text-2xl font-bold text-bg-w">{totalOrders}</p>
                    </div>
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-[1.25rem] bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-[0_18px_36px_-20px_color-mix(in_srgb,var(--color-bg-t950)_75%,transparent)]">
                        <p className="text-sm font-medium text-bg-w">Ingresos totales</p>
                        <p className="text-2xl font-bold text-bg-w">${totalRevenue.toLocaleString("es-CO")}</p>
                    </div>
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-[1.25rem] bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-[0_18px_36px_-20px_color-mix(in_srgb,var(--color-bg-t950)_75%,transparent)]">
                        <p className="text-sm font-medium text-bg-w">Productos vendidos</p>
                        <p className="text-2xl font-bold text-bg-w">{totalItems}</p>
                    </div>
                </div>

                <DataTable variant="cafe" data={rows} columns={columns} filters={orderFilters(rows)} dateFilter={orderDateFilter} initialSort={orderInitialSort} />
            </div>
            <OrderDetailModal
                order={rows.find((o) => o.id === selectedId)}
                onClose={() => setSelectedId(null)}
                onEdit={handleEdit}
            />

            <ReportConfigModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Generar reporte de órdenes"
                data={rows}
                fields={orderReportFields}
                scopes={orderReportScopes}
                filters={orderReportFilters}
                dateRange={orderReportDateRange}
                fileNamePrefix="orders-report"
                reportTitle="Reporte de Órdenes"
                sheetName="Ordenes"
            />
        </div>
    )
}