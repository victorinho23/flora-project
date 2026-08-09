import { UserEditForm } from "../../features/users";
import authBg from "@/assets/images/fondo-users.png";


export default function UserEditLayout() {
   
    const user = {
        id: 1,
        userName: "Victor Cortes",
        userDocumentTypeLabel: "Cédula",
        userDocumentTypes: "cedula", // el value real que espera el <Select>
        userDocumentNumber: "1140064132",
        userTypeLabel: "Administrador",
        userType: "admin", // el value real que espera el <Select>
        userEmail: "vcortezcastrillon7a@gmail.com",
        userBusinessEmail: "victor@flora.com",
        userAddress: "M3 c9b miraflores la graciela",
        userPhone: "3216304524",
        userContractStartDate: "2026-01-15",
        userContractEndDate: "2026-12-31",
        isActive: true,
        imageUrl: null,
    };

    return (
        <div
            className="min-h-screen w-full"
            style={{
                backgroundImage: `url(${authBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <UserEditForm user={user} />
        </div>
    );
}       