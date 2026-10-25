// src/shared/layouts/UserEditLayout.jsx
// Carga el usuario que se eligio en la tabla y abre el formulario de edicion
import { useLocation } from "react-router-dom";
import { UserEditForm } from "../../features/users";


export default function UserEditLayout() {

    // Usuario que llega desde la tabla al tocar editar
    const selected = useLocation().state?.user;

    // Usuario de prueba si se entra directo por la URL
    const fallbackUser = {
        id: 1,
        userName: "Victor Cortes",
        userDocumentTypeLabel: "Cédula",
        userDocumentTypes: "CC",
        userDocumentNumber: "1140064132",
        userTypeLabel: "Administrador",
        userType: "ADMIN",
        userEmail: "vcortezcastrillon7a@gmail.com",
        userBusinessEmail: "victor@flora.com",
        userAddress: "M3 c9b miraflores la graciela",
        userPhone: "3216304524",
        userContractStartDate: "2026-01-15",
        userContractEndDate: "2026-12-31",
        isActive: true,
        imageUrl: null,
    };

    // Convierte el usuario de la tabla al formato del formulario
    const user = selected
        ? {
              id: selected.id,
              userName: selected.username,
              userDocumentTypes: selected.document_type,
              userDocumentNumber: selected.document_number,
              userType: selected.usertype,
              userEmail: selected.useremail,
              userBusinessEmail: selected.business_email,
              userAddress: selected.address,
              userPhone: selected.userphone,
              userContractStartDate: selected.start_date,
              userContractEndDate: selected.end_date,
              isActive: selected.is_active,
              imageUrl: null,
          }
        : fallbackUser;

    return (
        <div className="min-h-screen w-full bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            <UserEditForm key={user.id} user={user} />
        </div>
    );
}       