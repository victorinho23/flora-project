import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { UserDetails } from "../../features/users";
import { getUserById } from "@/features/users/services/userServices";
import { getSessionUser } from "@/features/auth/services/logoutService";
import documentTypes from "@/data/select/documentTypes.json";
import typesUser from "@/data/select/typesUser.json";

// Busca el texto legible de un id en una lista (tipo de documento, tipo de usuario)
const labelOf = (list, id) => list.find((item) => item.id === id)?.label ?? id;

// Layout de la ruta para ver el detalle de un usuario
// muestra el usuario que se acaba de crear o editar, si no hay uno muestra el de la sesion
export default function SeeUsers() {
    const id = useLocation().state?.id ?? getSessionUser()?.id;
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        getUserById(id)
            .then((data) =>
                setUser({
                    id: data.id,
                    userName: data.username,
                    userDocumentTypeLabel: labelOf(documentTypes, data.document_type),
                    userDocumentNumber: data.document_number,
                    userTypeLabel: labelOf(typesUser, data.usertype),
                    userEmail: data.useremail,
                    userBusinessEmail: data.business_email,
                    userAddress: data.address,
                    userPhone: data.userphone,
                    userContractStartDate: data.start_date,
                    userContractEndDate: data.end_date,
                    isActive: data.is_active,
                    imageUrl: data.image,
                    // el usuario tal cual llega del backend, para mandarlo a editar
                    raw: data,
                })
            )
            .catch((err) => setError(err.message));
    }, [id]);

    return (
        <div className="min-h-screen w-full bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            {user ? (
                <UserDetails user={user} />
            ) : (
                <p className="p-10 text-center text-br-s950 font-semibold">{error || "Cargando usuario..."}</p>
            )}
        </div>
    );
}
