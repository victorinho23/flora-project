// src/features/inventory/components/InventoryRowActions.jsx

// Iconos usados en los botones de acciones
import {Pencil} from "lucide-react";

// Hook de React Router para navegar programaticamente entre rutas
import {useNavigate} from "react-router-dom";

// Componente de boton compartido (design system)
import { Button } from "@/shared";

// Componente que renderiza las acciones de cada fila de inventario

export default function InventoryRowActions(){

    // Hook que permite redirigir a otra ruta desde codigo
    const navigate = useNavigate();

    // Accion para editar el registro
    // Redirige a la pagina de edicion usando el id del registro
    const handleEdit = () => {
        navigate("/updateInventory");
    };

    return (
        //  Contenedor de los botones de acciones
        <div className="flex gap-2">

            {/** Botón editar */}
            <Button variant="crema" size="sm" onClick={handleEdit}>
                <Pencil size={16}/> {/** Icono de editar */}
            </Button>

        </div>
    )

}
