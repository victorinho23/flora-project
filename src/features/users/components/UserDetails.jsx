import { useNavigate } from "react-router-dom";
import { Button } from "@/shared";
import authBg from "@/assets/icons/usuario.png";
import userBg from "@/assets/images/Victor.jpeg";

const InfoField = ({ label, value }) => (
    <div className="w-80 bg-bg-s800/70 border border-bd-w/15 rounded-lg px-4 py-3 backdrop-blur-sm">
        <p className="text-caption text-bg-w/60 mb-1">{label}</p>
        <p className="text-body text-bg-w font-medium">{value || "—"}</p>
    </div>
);

export function UserDetails({ user }) {
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate(`/userEdit`);
    };

    const handleDelete = () => {
        const confirmed = window.confirm("¿Seguro que deseas eliminar este usuario?");
        if (!confirmed) return;

        
        console.log("Usuario eliminado:", user.id);
        navigate(-1);
    };

    return (
        <div className="grid items-center justify-center relative min-h-screen">

            <div className="flex absolute top-5 left-5">
                <img className="w-32 h-32" src={authBg} alt="usuario" />
                <h1 className="mx-auto my-12 ml-10 mt-22 text-title text-text-primary font-bold flex align-center underline">
                    Detalles de usuario
                </h1>
            </div>

            <div className="flex gap-6 mt-45 absolute top-0 left-46">
                <InfoField label="Nombre" value={user.userName} />
                <InfoField label="Tipo de documento" value={user.userDocumentTypeLabel} />
            </div>

            <div className="grid gap-4 absolute top-65 left-46">
                <InfoField label="Numero de documento" value={user.userDocumentNumber} />
                <InfoField label="Tipo de usuario" value={user.userTypeLabel} />
            </div>

            <div className="grid grid-cols-2 absolute top-135 left-45 gap-6">

                <InfoField label="Correo electronico" value={user.userEmail} />
                <InfoField label="Direccion" value={user.userAddress} />

                <InfoField label="Correo empresarial" value={user.userBusinessEmail} />
                <InfoField label="Fecha inicio contrato" value={user.userContractStartDate} />

                <InfoField label="Telefono" value={user.userPhone} />
                <InfoField label="Fecha fin contrato" value={user.userContractEndDate} />

                <div className="col-span-2 flex justify-start">
                    <div
                        className={`
                            flex items-center gap-2
                            px-5 py-3
                            rounded-lg
                            font-semibold
                            text-white
                            ${user.isActive ? "bg-green-600" : "bg-red-600"}
                        `}
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                        {user.isActive ? "Estado Activo" : "Estado Inactivo"}
                    </div>
                </div>

            </div>

            <div className="flex flex-col items-center gap-4 absolute top-80 left-300">

                <div className="w-120 h-120 flex items-center justify-center ">
                    {user.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt={user.userName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img className="w-120 h-120 mb-50" src={userBg} alt="sin foto" />
                    )}
                </div>

                <div className="flex items-center gap-3 w-120">
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