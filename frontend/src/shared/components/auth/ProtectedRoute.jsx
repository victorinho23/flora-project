// src/shared/components/auth/ProtectedRoute.jsx
// si no hay token manda al login; si falta el permiso de la pagina muestra el aviso
// cada vez que se entra a una pagina se vuelven a pedir los permisos al backend,
// asi si el admin quito uno, la persona ya no puede entrar aunque tenga la sesion abierta

import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { refreshAccess, useAccess } from "@/features/auth/services/accessService";
import Button from "../Button";

export default function ProtectedRoute({ children, permission }) {
    const token = sessionStorage.getItem("token");
    const can = useAccess();
    const navigate = useNavigate();

    useEffect(() => {
        refreshAccess();
    }, [permission]);

    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    if (!can(permission)) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6 bg-bg-p500 bg-linear-160 from-bg-p400 via-bg-p600 to-bg-s200">
                <section role="alert" className="w-full max-w-md text-center rounded-m3-xl border border-bd-s100 bg-bg-w shadow-m3-3 p-8 flex flex-col items-center gap-4">
                    <span className="w-16 h-16 flex items-center justify-center rounded-m3-full bg-m3-error-container text-m3-on-error-container">
                        <ShieldAlert size={32} />
                    </span>
                    <h1 className="text-m3-headline-small font-bold text-br-s950">No tienes permiso para esta página</h1>
                    <p className="text-m3-body-large text-br-s800">
                        Pídele al administrador que te asigne el permiso. Si ya te lo dio, se activa solo en unos segundos.
                    </p>
                    <Button variant="espresso" size="sm" type="button" onClick={() => navigate("/home", { replace: true })}>
                        Volver al inicio
                    </Button>
                </section>
            </main>
        );
    }

    return children;
}
