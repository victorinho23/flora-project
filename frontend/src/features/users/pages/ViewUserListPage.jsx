// src/features/users/pages/ViewUserListPage.jsx
// Consulta de usuarios con filtros y reportes
import { DataTable, Navbar, DetailModal } from "../../../shared";
import { UserDetails } from "../components/UserDetails"
import { createUserColumns, userFilters, userInitialSort } from "../table/UsersColumns"
import { toUserView, getUsers, updateUserStatus } from "../services/userServices"
import { useEffect, useMemo, useState } from "react"
import { Users as UsersIcon, UserRound } from "lucide-react"
import fotoFondo from "@/assets/images/fondo-users.png";
import { showErrorAlert } from "@/shared/services/alertService";
import { useAccess } from "@/features/auth/services/accessService";


export default function ViewUserListPage () {
    // permisos del usuario: lo que no puede hacer no se muestra (el backend igual lo bloquea)
    const can = useAccess();

    const [selectedId, setSelectedId] = useState(null);
    // usuario elegido para la ventana de ver (busqueda por id)
    const selectedUser = rows.find((u) => u.id === selectedId);
    const [rows, setRows] = useState([]);

    // Columnas de la tabla con la accion de ver y el cambio de estado
    const columns = useMemo(
        () => createUserColumns({ onView: can("usuarios_visualizar") ? (user) => setSelectedId(user.id) : undefined, onStatusChange: !can("usuarios_habilitar") ? undefined : async (user, value, reason) => {
            await updateUserStatus(user.id, value, reason);
            setRows((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: value } : u)));
        } }),
        [can]
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
                    className="rounded-m3-lg shadow-m3-2"
                />

                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-m3-lg bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-m3-2">
                        <p className="text-sm font-medium text-bg-w">Total de usuarios</p>
                        <p className="text-2xl font-bold text-bg-w">{totalUsers}</p>
                    </div>
                </div>

                <DataTable variant="cafe" data={rows} columns={columns} filters={userFilters} initialSort={userInitialSort} />
            </div>
            {/* ver usuario: el mismo diseño de la pagina de detalle, dentro de una ventana */}
            <DetailModal
                open={Boolean(selectedUser)}
                onClose={() => setSelectedId(null)}
                icon={UserRound}
                title="Ver usuario"
                subtitle={selectedUser?.username}
                size="max-w-6xl"
                bodyClassName="grid-cols-1"
                footer={false}
            >
                {selectedUser && (
                    <UserDetails
                        key={selectedUser.id}
                        user={toUserView(selectedUser)}
                        inModal
                        onStatusChange={(value) => setRows((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, is_active: value } : u)))}
                    />
                )}
            </DetailModal>
        </div>
    )
}