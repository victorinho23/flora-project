// src/shared/components/auth/ProtectedRoute.jsx
// si no hay token no deja entrar y manda al login

import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const token = sessionStorage.getItem("token");

    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    return children;
}
