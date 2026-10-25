// src/features/users/components/UserDetails.jsx
// Pagina de detalle de un usuario en modo solo lectura
import { useNavigate } from "react-router-dom";
import { Button, Navbar } from "@/shared";
import authBg from "@/assets/icons/usuario.png";
import userBg from "@/assets/images/Victor.jpeg";
import { showConfirmDeleteAlert, showDeleteSuccessAlert, showDeleteCancelAlert, showUnexpectedErrorAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/fondo-users.png";

export function UserDetails({ user }) {
    const navigate = useNavigate();

    // Lleva a editar la cuenta
    const handleEdit = () => {
        navigate(`/userEdit`);
    };

    // Pide confirmacion antes de quitar el usuario
    const handleDelete = async () => {
        const result = await showConfirmDeleteAlert({
            title: "¿Eliminar usuario?",
            text: `Se eliminara el usuario ${user.userName}. Esta accion no se puede deshacer.`,
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
            console.log("Usuario eliminado:", user.id);

            await showDeleteSuccessAlert({
                title: "Usuario eliminado",
                text: `El usuario ${user.userName} fue eliminado correctamente`,
                timer: 3000,
            });
            navigate(-1);
        } catch (error) {
            await showUnexpectedErrorAlert({
                text: error.message,
                timer: 3000,
            });
        }
    };

    return (
        <div className="relative min-h-screen grid grid-cols-1 xl:grid-cols-[auto_auto] xl:justify-center content-start gap-x-16 gap-y-6 p-5 sm:p-8">

            <Navbar
                variant="banda"
                image={fotoFondo}
                avatar={authBg}
                title="Detalles de usuario"
                onBack={() => navigate("/userCreate")}
                backSide="right"
                className="rounded-2xl shadow-lg xl:col-span-2"
            />

            <div className="flex flex-col sm:flex-row gap-6 xl:col-start-1">
                <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full md:w-80">
                    <p className="text-sm font-medium text-br-s800 mb-1">Nombre</p>
                    <div className="text-base font-semibold text-br-s950 break-words">{user.userName || "—"}</div>
                </div>
                <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full md:w-80">
                    <p className="text-sm font-medium text-br-s800 mb-1">Tipo de documento</p>
                    <div className="text-base font-semibold text-br-s950 break-words">{user.userDocumentTypeLabel || "—"}</div>
                </div>
            </div>

            <div className="grid gap-4 xl:col-start-1">
                <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full md:w-80">
                    <p className="text-sm font-medium text-br-s800 mb-1">Numero de documento</p>
                    <div className="text-base font-semibold text-br-s950 break-words">{user.userDocumentNumber || "—"}</div>
                </div>
                <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full md:w-80">
                    <p className="text-sm font-medium text-br-s800 mb-1">Tipo de usuario</p>
                    <div className="text-base font-semibold text-br-s950 break-words">{user.userTypeLabel || "—"}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:col-start-1">

                <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full md:w-80">
                    <p className="text-sm font-medium text-br-s800 mb-1">Correo electronico</p>
                    <div className="text-base font-semibold text-br-s950 break-words">{user.userEmail || "—"}</div>
                </div>
                <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full md:w-80">
                    <p className="text-sm font-medium text-br-s800 mb-1">Direccion</p>
                    <div className="text-base font-semibold text-br-s950 break-words">{user.userAddress || "—"}</div>
                </div>

                <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full md:w-80">
                    <p className="text-sm font-medium text-br-s800 mb-1">Correo empresarial</p>
                    <div className="text-base font-semibold text-br-s950 break-words">{user.userBusinessEmail || "—"}</div>
                </div>
                <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full md:w-80">
                    <p className="text-sm font-medium text-br-s800 mb-1">Fecha inicio contrato</p>
                    <div className="text-base font-semibold text-br-s950 break-words">{user.userContractStartDate || "—"}</div>
                </div>

                <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full md:w-80">
                    <p className="text-sm font-medium text-br-s800 mb-1">Telefono</p>
                    <div className="text-base font-semibold text-br-s950 break-words">{user.userPhone || "—"}</div>
                </div>
                <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 w-full md:w-80">
                    <p className="text-sm font-medium text-br-s800 mb-1">Fecha fin contrato</p>
                    <div className="text-base font-semibold text-br-s950 break-words">{user.userContractEndDate || "—"}</div>
                </div>

                <div className="md:col-span-2 flex justify-center sm:justify-start">
                    <div
                        className={`
                            flex items-center gap-2
                            px-5 py-3
                            rounded-lg
                            font-semibold
                            text-white
                            ${user.isActive ? "bg-green-900" : "bg-red-900"}
                        `}
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                        {user.isActive ? "Estado Activo" : "Estado Inactivo"}
                    </div>
                </div>

            </div>

            <div className="flex flex-col items-center gap-4 xl:col-start-2 xl:row-start-2 xl:row-span-3">

                <div className="w-full max-w-120 aspect-square flex items-center justify-center rounded-3xl overflow-hidden ring-4 ring-bd-t300 shadow-[0_24px_50px_-24px_color-mix(in_srgb,var(--color-bg-t950)_80%,transparent)]">
                    {user.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt={user.userName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img className="w-full h-full object-cover" src={userBg} alt="sin foto" />
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-120">
                    <Button
                        variant="primary"
                        size="lgg"
                        type="button"
                        onClick={handleEdit}
                    >
                        Modificar
                    </Button>

                    <Button
                        variant="danger"
                        size="lgg"
                        type="button"
                        onClick={handleDelete}
                    >
                        Eliminar
                    </Button>
                </div>

            </div>

        </div>
    )
}