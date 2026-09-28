import { DataTable } from "../../../shared"
import { createOrderColumns } from "../table/OrderColumns"
import { orders } from "../data/orders"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../../shared"
import authBg from "@/assets/images/white.jpg"
import ReportConfigModal from "../reports/components/ReportConfigModal"
import { orderReportFields } from "../reports/config/orderReportFields"
import { useMemo, useState } from "react"
import { ClipboardList, ArrowLeft } from "lucide-react"
import { showConfirmDeleteAlert, showDeleteSuccessAlert, showDeleteCancelAlert, showUnexpectedErrorAlert } from "@/shared/services/alertService"

const METAL = "bg-[linear-gradient(180deg,var(--color-br-t50)_0%,var(--color-br-t300)_45%,var(--color-br-t500)_55%,var(--color-br-t400)_100%)] bg-clip-text text-transparent";
const PANEL = "border-2 border-bd-t500 bg-bg-g950/95 backdrop-blur-xl shadow-[0_0_15px_var(--color-tertiary-400),0_0_35px_color-mix(in_srgb,var(--color-tertiary-400)_40%,transparent),0_20px_40px_-12px_rgb(0_0_0/0.6)]";

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
    createdAt: "",
});

export default function OrderListPage () {

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [rows, setRows] = useState(orders);
    const navigate = useNavigate();

    const handleView = (order) => navigate(`/orderView/${order.id}`, { state: { order: toOrderDetail(order) } });
    const handleEdit = (order) => navigate(`/orderEdit/${order.id}`, { state: { order: toOrderDetail(order) } });
    const handleDelete = async (item) => {
        const result = await showConfirmDeleteAlert({
            title: "¿Eliminar orden?",
            text: `Se eliminara la orden #${item.id}. Esta accion no se puede deshacer.`,
        });

        if (!result.isConfirmed) {
            await showDeleteCancelAlert({
                title: "Cancelado",
                text: "La orden no fue eliminada",
                timer: 3000,
            });
            return;
        }

        try {
            setRows((prev) => prev.filter((row) => row.id !== item.id));

            await showDeleteSuccessAlert({
                title: "Orden eliminada",
                text: `La orden #${item.id} fue eliminada correctamente`,
                timer: 3000,
            });
        } catch (error) {
            await showUnexpectedErrorAlert({
                text: error.message,
                timer: 3000,
            });
        }
    };

    const columns = useMemo(
        () => createOrderColumns({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }),
        []
    );

    const totalOrders = rows.length;
    const totalRevenue = rows.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalItems = rows.reduce((sum, o) => sum + (o.quantity || 0), 0);

    return(
        <div
            className="p-6 md:p-10 bg-fixed min-h-screen"
            style={{
                backgroundImage: `url(${authBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="w-full space-y-6">

                <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl p-5 ${PANEL}`}>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/createOrders")}
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
                            <ClipboardList size={26} color="url(#metalCaramelo)" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-bold ${METAL}`}>
                                Lista de órdenes
                            </h1>
                            <p className="text-sm text-bg-g300">Consulta y gestiona las órdenes registradas en la cafetería.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button size="sm" variant="remolino" onClick={() => setIsReportModalOpen(true)}>
                            Reportar orden
                        </Button>

                        <Link to="/createOrders">
                            <Button size="sm" variant="remolino">
                                Agregar orden
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                    <div className={`rounded-lg text-center px-6 py-3 ${PANEL}`}>
                        <p className="text-xs text-bg-g300">Total de órdenes</p>
                        <p className={`text-lg font-semibold ${METAL}`}>
                            {totalOrders}
                        </p>
                    </div>
                    <div className={`rounded-lg text-center px-6 py-3 ${PANEL}`}>
                        <p className="text-xs text-bg-g300">Ingresos totales</p>
                        <p className={`text-lg font-semibold ${METAL}`}>
                            ${totalRevenue.toLocaleString("es-CO")}
                        </p>
                    </div>
                    <div className={`rounded-lg text-center px-6 py-3 ${PANEL}`}>
                        <p className="text-xs text-bg-g300">Productos vendidos</p>
                        <p className={`text-lg font-semibold ${METAL}`}>
                            {totalItems}
                        </p>
                    </div>
                </div>

                <DataTable variant="fifteenth" data={rows} columns={columns} />

            </div>

            <ReportConfigModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Generar reporte de órdenes"
                data={rows}
                fields={orderReportFields}
                fileNamePrefix="orders-report"
                reportTitle="Reporte de Órdenes"
                sheetName="Ordenes"
            />
        </div>
    )
}