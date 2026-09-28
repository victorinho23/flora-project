import { DataTable } from "../../../shared"
import { createUserColumns } from "../table/UsersColumns"
import { users } from "../data/users"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../../shared"
import authBg from "@/assets/images/white.jpg"
import ReportConfigModal from "../reports/components/ReportConfigModal"
import { userReportFields } from "../reports/config/userReportFields"
import { useMemo, useState } from "react"
import { Users as UsersIcon, ArrowLeft } from "lucide-react"
import { showConfirmDeleteAlert, showDeleteSuccessAlert, showDeleteCancelAlert, showUnexpectedErrorAlert } from "@/shared/services/alertService"

const METAL = "bg-[linear-gradient(180deg,var(--color-br-t50)_0%,var(--color-br-t300)_45%,var(--color-br-t500)_55%,var(--color-br-t400)_100%)] bg-clip-text text-transparent";
const PANEL = "border-2 border-bd-t500 bg-bg-g950/95 backdrop-blur-xl shadow-[0_0_15px_var(--color-tertiary-400),0_0_35px_color-mix(in_srgb,var(--color-tertiary-400)_40%,transparent),0_20px_40px_-12px_rgb(0_0_0/0.6)]";

export default function UserListPage () {

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [rows, setRows] = useState(users);
    const navigate = useNavigate();

    const handleView = (user) => navigate("/viewUser", { state: { user } });
    const handleEdit = (user) => navigate("/userEdit", { state: { user } });
    const handleDelete = async (item) => {
        const result = await showConfirmDeleteAlert({
            title: "¿Eliminar usuario?",
            text: `Se eliminara el usuario ${item.username}. Esta accion no se puede deshacer.`,
        });

        if (!result.isConfirmed) {
            await showDeleteCancelAlert({
                title: "Cancelado",
                text: "El usuario no fue eliminado",
                timer: 3000,
            });
            return;
        }

        try {
            setRows((prev) => prev.filter((row) => row.id !== item.id));

            await showDeleteSuccessAlert({
                title: "Usuario eliminado",
                text: `El usuario ${item.username} fue eliminado correctamente`,
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
        () => createUserColumns({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }),
        []
    );

    const totalUsers = rows.length;

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
                            onClick={() => navigate("/userCreate")}
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
                            <UsersIcon size={26} color="url(#metalCaramelo)" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-bold ${METAL}`}>
                                Listado de usuarios
                            </h1>
                            <p className="text-sm text-bg-g300">Administra las cuentas del equipo y sus permisos.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button size="sm" variant="remolino" onClick={() => setIsReportModalOpen(true)}>
                            Reportar usuario
                        </Button>

                        <Link to="/userCreate">
                            <Button size="sm" variant="remolino">
                                Crear usuario
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                    <div className={`rounded-lg text-center px-6 py-3 ${PANEL}`}>
                        <p className="text-xs text-bg-g300">Total de usuarios</p>
                        <p className={`text-lg font-semibold ${METAL}`}>
                            {totalUsers}
                        </p>
                    </div>
                </div>

                <DataTable variant="fifteenth" data={rows} columns={columns} />

            </div>

            <ReportConfigModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Generar reporte de usuarios"
                data={rows}
                fields={userReportFields}
                fileNamePrefix="users-report"
                reportTitle="Reporte de Usuarios"
                sheetName="Usuarios"
                filterField="document_number"
                filterLabel="Filtrar por documento"
            />
        </div>
    )
}