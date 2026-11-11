// src/features/users/pages/ViewUserListPage.jsx
// Consulta de usuarios con filtros y reportes
import { DataTable, Navbar } from "../../../shared";
import UserDetailModal from "../components/UserDetailModal"
import { createUserColumns, userFilters, userInitialSort } from "../table/UsersColumns"
import { getUsers, updateUserStatus } from "../services/userServices"
import { useEffect, useMemo, useState } from "react"
import { Users as UsersIcon } from "lucide-react"
import fotoFondo from "@/assets/images/fondo-users.png";
import { showErrorAlert } from "@/shared/services/alertService";


export default function ViewUserListPage () {

    const [selectedId, setSelectedId] = useState(null);
    const [rows, setRows] = useState([]);

    // Columnas de la tabla con la accion de ver y el cambio de estado
    const columns = useMemo(
        () => createUserColumns({ onView: (user) => setSelectedId(user.id), onStatusChange: async (user, value, reason) => {
            await updateUserStatus(user.id, value, reason);
            setRows((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: value } : u)));
        } }),
        []
    );

    // usuarios reales que llegan de la base
    useEffect(() => {
        getUsers().then(setRows).catch((error) => showErrorAlert({ title: "No se pudieron cargar los usuarios", text: error.message, confirmButtonText: "Entendido", timer: 4000 }));
    }, []);

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
                    subtitle="Consulta las cuentas del equipo registradas."
                    className="rounded-[1.25rem] shadow-[0_22px_48px_-26px_color-mix(in_srgb,var(--color-bg-s950)_70%,transparent)]"
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
            />
        </div>
    )
}