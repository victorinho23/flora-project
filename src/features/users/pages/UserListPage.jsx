// src/features/users/pages/UserListPage.jsx
// Listado de usuarios con filtros por rol y estado, cambio de estado y reportes
import { DataTable, Navbar } from "../../../shared";
import UserDetailModal from "../components/UserDetailModal"
import { createUserColumns, userFilters, userInitialSort } from "../table/UsersColumns"
import { users } from "../data/users"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../../shared"
import ReportConfigModal from "../reports/components/ReportConfigModal"
import { userReportFields, userReportScopes } from "../reports/config/userReportFields"
import { useMemo, useState } from "react"
import { Users as UsersIcon } from "lucide-react"
import fotoFondo from "@/assets/images/fondo-users.png";


export default function UserListPage () {

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    // Copia de los usuarios para reflejar al instante los cambios de estado
    const [rows, setRows] = useState(users);
    const navigate = useNavigate();

    const [selectedId, setSelectedId] = useState(null);

    const handleView = (user) => setSelectedId(user.id);
    const handleEdit = (user) => navigate("/userEdit", { state: { user } });

    // Columnas de la tabla con las acciones de ver, editar y cambiar estado
    const columns = useMemo(
        () => createUserColumns({ onView: handleView, onEdit: handleEdit, onStatusChange: (user, value) => setRows((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: value } : u))) }),
        []
    );

    const totalUsers = rows.length;

    return (
        <div className="p-6 md:p-10 min-h-screen bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            <div className="w-full space-y-6">
                <Navbar
                    variant="foto"
                    navigation
                    image={fotoFondo}
                    icon={UsersIcon}
                    title="Listado de usuarios"
                    subtitle="Administra las cuentas del equipo y sus permisos."
                    onBack={() => navigate("/userCreate")}
                    className="rounded-[1.25rem] shadow-[0_22px_48px_-26px_color-mix(in_srgb,var(--color-bg-s950)_70%,transparent)]"
                    actions={
                        <>
                            <Button size="sm" variant="crema" onClick={() => setIsReportModalOpen(true)}>
                                Reportar usuario
                            </Button>

                            <Link to="/userCreate">
                                <Button size="sm" variant="crema">
                                    Crear usuario
                                </Button>
                            </Link>
                        </>
                    }
                />

                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-[1.25rem] bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-[0_18px_36px_-20px_color-mix(in_srgb,var(--color-bg-t950)_75%,transparent)]">
                        <p className="text-sm font-medium text-bg-w">Total de usuarios</p>
                        <p className="text-2xl font-bold text-bg-w">{totalUsers}</p>
                    </div>
                </div>

                <DataTable variant="cafe" data={rows} columns={columns} filters={userFilters} initialSort={userInitialSort} />
            </div>
            <UserDetailModal
                user={rows.find((u) => u.id === selectedId)}
                onClose={() => setSelectedId(null)}
                onEdit={handleEdit}
            />

            <ReportConfigModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Generar reporte de usuarios"
                data={rows}
                fields={userReportFields}
                fileNamePrefix="users-report"
                reportTitle="Reporte de Usuarios"
                sheetName="Usuarios"
                scopes={userReportScopes}
            />
        </div>
    )
}