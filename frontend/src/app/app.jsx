// src/app/app.jsx
// Punto de arranque: monta el router y vigila la inactividad para cerrar la sesion
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "@/app/router";
import { showErrorAlert } from "@/shared/services/alertService";

// Minutos sin actividad antes de cerrar la sesion
const IDLE_MINUTES = 10;

export default function App(){
  useEffect(() => {
    let timer;

    // Si ya estamos en el login no hace nada, si no manda al login y avisa por que se cerro
    const logout = async () => {
      if (router.state.location.pathname === "/auth") return;
      await router.navigate("/auth");
      await showErrorAlert({
        title: "Sesión cerrada",
        text: `Tu sesión se cerró por ${IDLE_MINUTES} minutos de inactividad. Vuelve a iniciar sesión.`,
        confirmButtonText: "Entendido",
        timer: 8000,
      });
    };

    // Cada vez que el usuario hace algo se reinicia el contador
    const restart = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, IDLE_MINUTES * 60000);
    };

    // Eventos que cuentan como actividad del usuario
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, restart, { passive: true }));
    restart();

    // Limpieza: quita el contador y los eventos cuando se desmonta
    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, restart));
    };
  }, []);

  return <RouterProvider router={router}/>
}
