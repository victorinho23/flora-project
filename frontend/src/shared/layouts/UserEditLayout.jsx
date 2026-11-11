// src/shared/layouts/UserEditLayout.jsx
// Carga el usuario que se eligio en la tabla y abre el formulario de edicion
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { UserEditForm } from "../../features/users";
import { getUserById } from "@/features/users/services/userServices";
import { getSessionUser } from "@/features/auth/services/logoutService";


export default function UserEditLayout() {

    // Usuario que llega desde la tabla al tocar editar
    const selected = useLocation().state?.user;

    // Si se entra directo por la URL se carga el usuario de la sesion desde el backend
    const [loaded, setLoaded] = useState(null);

    useEffect(() => {
        if (selected) return;
        const sessionId = getSessionUser()?.id;
        if (sessionId) getUserById(sessionId).then(setLoaded).catch(console.error);
    }, [selected]);

    const source = selected ?? loaded;

    // Convierte el usuario de la tabla al formato del formulario
    const user = source
        ? {
              id: source.id,
              userName: source.username,
              userDocumentTypes: source.document_type,
              userDocumentNumber: source.document_number,
              userType: source.usertype,
              userEmail: source.useremail,
              userBusinessEmail: source.business_email,
              userAddress: source.address,
              userPhone: source.userphone,
              userPhoneSecondary: source.userphone2,
              userContractStartDate: source.start_date,
              userContractEndDate: source.end_date,
              isActive: source.is_active,
              imageUrl: source.image,
          }
        : null;

    if (!user) {
        return <p className="p-10 text-center text-br-s950 font-semibold">Cargando usuario...</p>;
    }

    return (
        <div className="min-h-screen w-full bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            <UserEditForm key={user.id} user={user} />
        </div>
    );
}       