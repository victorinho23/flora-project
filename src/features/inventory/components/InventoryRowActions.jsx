// src/features/inventory/components/InventoryRowActions.jsx

// Iconos usados en los botones de acciones
import {Pencil, Trash2} from "lucide-react";

// Hook de React Router para navegar programaticamente entre rutas
import {useNavigate} from "react-router-dom";

// Componente que renderiza las acciones de cada fila de inventario
// Recibe como prop el objeto item (un registro de inventario)

export default function InventoryRowActions({item}){

    // Hook que permite redirigir a otra ruta desde codigo
    const navigate = useNavigate();

    // Accion para editar el registro
    // Redirige a la pagina de edicion usando el id del registro
    const handleEdit = () => {
        navigate(`/inventory/${item.id}/edit`);
    };

    // Accion para eliminar el registro
    // Actualmente solo imprime en consola el id
    // En una aplicacion real aqui se llamaria a la API
    const handleDelete = () => {
        console.log("Eliminar registro de inventario", item.id)
    };

    return (
        //  Contenedor de los botones de acciones
        <div className="flex gap-2">

            {/** Botón editar */}
            <button
                onClick={handleEdit}
                className="p-1 rounded hover:bg-gray-100"
            >

                <Pencil size={16}/> {/** Icono de editar */}
            </button>

             {/** Botón eliminar */}
            <button
                onClick={handleDelete}
                className="p-1 rounded hover:bg-gray-100"
            >

                <Trash2 size={16}/> {/** Icono de eliminar */}
            </button>

        </div>
    )

}
