import { UserDetails } from "../../features/users";

// Layout de la ruta para ver el detalle de un usuario
export default function SeeUsers() {
    return (
        <div className="min-h-screen w-full bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
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