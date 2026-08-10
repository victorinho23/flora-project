// src/features/suppliers/components/SupplierRowActions.jsx

// Iconos usados en los botones de acciones
import { Pencil, Trash2 } from "lucide-react";

// Hook de React Router para navegar programaticamente entre rutas
import { useNavigate } from "react-router-dom";

// Componente de boton compartido (design system)
import { Button } from "@/shared";

// Componente que renderiza las acciones de cada fila de proveedor
// Recibe como prop el objeto supplier

export default function SupplierRowActions({ supplier }) {

    // Hook que permite redirigir a otra ruta desde codigo
    const navigate = useNavigate();

    // Accion para editar el proveedor
    // Redirige a la pagina de edicion usando el id del proveedor
    const handleEdit = () => {
        navigate(`/suppliers/${supplier.id}/edit`);
    };

    // Accion para eliminar el proveedor
    // Actualmente solo imprime en consola el id
    // En una aplicacion real aqui se llamaria a la API
    const handleDelete = () => {
        console.log("Eliminar proveedor", supplier.id)
    };

    return (
        //  Contenedor de los botones de acciones
        <div className="flex gap-2">

            {/** Botón editar */}
            <Button variant="secondary" size="sm" onClick={handleEdit}>
                <Pencil size={16} /> {/** Icono de editar */}
            </Button>

            {/** Botón eliminar */}
            <Button variant="secondary" size="sm" onClick={handleDelete}>
                <Trash2 size={16} /> {/** Icono de eliminar */}
            </Button>

        </div>
    )
}
