import { DataTable } from "../../../shared"
import { createSupplierColumns } from "../table/SuppliersColumns"
import { suppliers } from "../data/suppliers"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../../shared"
import authBg from "@/assets/images/white.jpg"
import ReportConfigModal from "../reports/components/ReportConfigModal"
import SupplierDetailModal from "../components/SupplierDetailModal"
import { supplierReportFields } from "../reports/config/supplierReportFields"
import { useMemo, useState } from "react"
import { Truck, ArrowLeft } from "lucide-react"
import { showConfirmDeleteAlert, showDeleteSuccessAlert, showDeleteCancelAlert, showUnexpectedErrorAlert } from "@/shared/services/alertService"

const METAL = "bg-[linear-gradient(180deg,var(--color-br-t50)_0%,var(--color-br-t300)_45%,var(--color-br-t500)_55%,var(--color-br-t400)_100%)] bg-clip-text text-transparent";
const PANEL = "border-2 border-bd-t500 bg-bg-g950/95 backdrop-blur-xl shadow-[0_0_15px_var(--color-tertiary-400),0_0_35px_color-mix(in_srgb,var(--color-tertiary-400)_40%,transparent),0_20px_40px_-12px_rgb(0_0_0/0.6)]";

export default function SuppliersListPage () {

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [rows, setRows] = useState(suppliers);
    const navigate = useNavigate();

    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const handleView = (supplier) => setSelectedSupplier(supplier);
    const handleEdit = (supplier) => navigate("/updateSuppliers", { state: { supplier } });
    const handleDelete = async (item) => {
        const result = await showConfirmDeleteAlert({
            title: "¿Eliminar proveedor?",
            text: `Se eliminara el proveedor ${item.providername}. Esta accion no se puede deshacer.`,
        });

        if (!result.isConfirmed) {
            await showDeleteCancelAlert({
                title: "Cancelado",
                text: "El proveedor no fue eliminado",
                timer: 3000,
            });
            return;
        }

        try {
            setRows((prev) => prev.filter((row) => row.id !== item.id));

            await showDeleteSuccessAlert({
                title: "Proveedor eliminado",
                text: `El proveedor ${item.providername} fue eliminado correctamente`,
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
        () => createSupplierColumns({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }),
        []
    );

    const totalSuppliers = rows.length;

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
                            onClick={() => navigate("/suppliersCreate")}
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
                            <Truck size={26} color="url(#metalCaramelo)" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-bold ${METAL}`}>
                                Listado de proveedores
                            </h1>
                            <p className="text-sm text-bg-g300">Administra los proveedores registrados y sus datos de contacto.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button size="sm" variant="remolino" onClick={() => setIsReportModalOpen(true)}>
                            Reportar proveedor
                        </Button>

                        <Link to="/suppliersCreate">
                            <Button size="sm" variant="remolino">
                                Agregar proveedor
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                    <div className={`rounded-lg text-center px-6 py-3 ${PANEL}`}>
                        <p className="text-xs text-bg-g300">Total de proveedores</p>
                        <p className={`text-lg font-semibold ${METAL}`}>
                            {totalSuppliers}
                        </p>
                    </div>
                </div>

                <DataTable variant="fifteenth" data={rows} columns={columns} />

            </div>

            <SupplierDetailModal
                supplier={selectedSupplier}
                onClose={() => setSelectedSupplier(null)}
                onEdit={handleEdit}
            />

            <ReportConfigModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Generar reporte de proveedores"
                data={rows}
                fields={supplierReportFields}
                fileNamePrefix="suppliers-report"
                reportTitle="Reporte de Proveedores"
                sheetName="Proveedores"
            />
        </div>
    )
}