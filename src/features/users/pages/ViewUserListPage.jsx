import { DataTable } from "../../../shared"
import { createUserColumns } from "../table/UsersColumns"
import { users } from "../data/users"
import { useNavigate } from "react-router-dom"
import authBg from "@/assets/images/white.jpg"
import ReportConfigModal from "../reports/components/ReportConfigModal"
import { userReportFields } from "../reports/config/userReportFields"
import { useMemo, useState } from "react"
import { Users as UsersIcon } from "lucide-react"

const METAL = "bg-[linear-gradient(180deg,var(--color-br-t50)_0%,var(--color-br-t300)_45%,var(--color-br-t500)_55%,var(--color-br-t400)_100%)] bg-clip-text text-transparent";
const PANEL = "border-2 border-bd-t500 bg-bg-g950/95 backdrop-blur-xl shadow-[0_0_15px_var(--color-tertiary-400),0_0_35px_color-mix(in_srgb,var(--color-tertiary-400)_40%,transparent),0_20px_40px_-12px_rgb(0_0_0/0.6)]";

export default function ViewUserListPage () {

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const navigate = useNavigate();

    const columns = useMemo(
        () => createUserColumns({ onView: (user) => navigate("/viewUser", { state: { user } }) }),
        [navigate]
    );

    const totalUsers = users.length;

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
                            <p className="text-sm text-bg-g300">Consulta las cuentas del equipo registradas.</p>
                        </div>
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

                <DataTable variant="fifteenth" data={users} columns={columns} />

            </div>

            <ReportConfigModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Generar reporte de usuarios"
                data={users}
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