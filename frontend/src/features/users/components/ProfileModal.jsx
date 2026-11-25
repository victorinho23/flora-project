// src/features/users/components/ProfileModal.jsx
// Mi perfil: los datos de la cuenta de la sesion en una ventana (ya no es una pagina aparte)
// se abre desde el menu de la barra o desde el buscador
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import DetailModal from "@/shared/components/DetailModal";
import { UserDetails } from "./UserDetails";
import { getUserById, toUserView } from "../services/userServices";
import { getSessionUser } from "@/features/auth/services/logoutService";

export default function ProfileModal({ open, onClose }) {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    // se piden los datos cada vez que se abre, asi se ven los cambios recien guardados
    useEffect(() => {
        const id = getSessionUser()?.id;
        if (!open || !id) return;
        let alive = true;
        getUserById(id)
            .then((data) => alive && setUser(toUserView(data)))
            .catch((err) => alive && setError(err.message));
        return () => { alive = false; };
    }, [open]);

    return (
        <DetailModal
            open={open}
            onClose={onClose}
            icon={UserRound}
            title="Mi perfil"
            subtitle={user?.userEmail}
            size="max-w-6xl"
            bodyClassName="grid-cols-1"
            footer={false}
        >
            {user ? (
                <UserDetails key={user.id} user={user} from="/profile" />
            ) : (
                <p className="p-6 text-center text-br-s950 font-semibold">{error || "Cargando tu perfil..."}</p>
            )}
        </DetailModal>
    );
}
