import { UserDetails } from "../../features/users";
import authBg from "@/assets/images/fondo-users.png";

export default function SeeUsers() {
    return (
        <div className=""
        style={{
            backgroundImage: `url(${authBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
        }}>
            <UserDetails
            user={{
                id: 1,
                userName: "Victor Cortes",
                userDocumentTypeLabel: "Cédula",
                userDocumentNumber: "1140064132",
                userTypeLabel: "Administrador",
                userEmail: "vcortezcastrillon7a@gmail.com",
                userBusinessEmail: "victor@flora.com",
                userAddress: "M3 c9b miraflores la graciela",
                userPhone: "3216304524",
                userContractStartDate: "2026-01-15",
                userContractEndDate: "2026-12-31",
                isActive: true,
                imageUrl: null,
            }}
            
        />
        </div>
        
        
    );
}