// src/features/inventory/pages/InventoryListPage.jsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Bell, ArrowLeft } from "lucide-react";

import { DataTable, Button } from "../../../shared";
import { createInventoryColumns } from "../table/InventoryColumns";
import { inventory } from "../data/inventory";
import InventoryReportModal from "../reports/components/InventoryReportModal";

import authBg from "@/assets/images/white.jpg";
import { showConfirmDeleteAlert, showDeleteSuccessAlert, showDeleteCancelAlert, showUnexpectedErrorAlert } from "@/shared/services/alertService";

const METAL = "bg-[linear-gradient(180deg,var(--color-br-t50)_0%,var(--color-br-t300)_45%,var(--color-br-t500)_55%,var(--color-br-t400)_100%)] bg-clip-text text-transparent";
const PANEL = "border-2 border-bd-t500 bg-bg-g950/95 backdrop-blur-xl shadow-[0_0_15px_var(--color-tertiary-400),0_0_35px_color-mix(in_srgb,var(--color-tertiary-400)_40%,transparent),0_20px_40px_-12px_rgb(0_0_0/0.6)]";

export default function InventoryListPage () {

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [rows, setRows] = useState(inventory);
    const navigate = useNavigate();

    const handleView = (item) => navigate("/detailsInventory", { state: { id: item.id } });
    const handleEdit = (item) => navigate("/updateInventory", { state: { search: item.name } });

    const handleDelete = async (item) => {
        const result = await showConfirmDeleteAlert({
            title: "¿Eliminar producto?",
            text: `Se eliminara el producto ${item.name}. Esta accion no se puede deshacer.`,
        });

        if (!result.isConfirmed) {
            await showDeleteCancelAlert({
                title: "Cancelado",
                text: "El producto no fue eliminado",
                timer: 3000,
            });
            return;
        }

        try {
            setRows((prev) => prev.filter((row) => row.id !== item.id));

            await showDeleteSuccessAlert({
                title: "Producto eliminado",
                text: `El producto ${item.name} fue eliminado correctamente`,
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
        () => createInventoryColumns({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }),
        []
    );

    const totalItems = rows.length;

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
                            onClick={() => navigate("/createInventory")}
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
                            <Package size={26} color="url(#metalCaramelo)" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-bold ${METAL}`}>
                                Inventario
                            </h1>
                            <p className="text-sm text-bg-g300">Administra las existencias de todas las sucursales.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button size="sm" variant="remolino" aria-label="Notificaciones">
                            <Bell size={18} />
                        </Button>

                        <Button size="sm" variant="remolino" onClick={() => setIsReportModalOpen(true)}>
                            Generar reporte
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                    <div className={`rounded-lg text-center px-6 py-3 ${PANEL}`}>
                        <p className="text-xs text-bg-g300">Total de productos</p>
                        <p className={`text-lg font-semibold ${METAL}`}>
                            {totalItems}
                        </p>
                    </div>
                </div>

                <DataTable variant="fifteenth" data={rows} columns={columns} />

            </div>

            <InventoryReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
            />
        </div>
    )
}