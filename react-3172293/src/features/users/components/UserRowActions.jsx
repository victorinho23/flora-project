// src/feautures/users/components/UserRowActions.jsx

// Iconos usados en los botones de acciones
import {Pencil, Trash2} from "lucide-react";

// Hook de React Router para navegar programaticamente  entre rutas
import {useNavigate} from "react-router-dom";

// Componente que renderiza las accion es de cada fila de usuario
// Recibe como prop el objeto user

export default function UserRowActions({user}){

    // const handleEdit = () => {
        // console.log("Editar usuario", user.id)
    //   };

    // Hook que permite redirigir a otra ruta desde codigo
    const navigate = useNavigate();

    // Accion para editar el usuario
    // Redirige a la pagina de deicion usando el id del usuario
    const handleEdit = () => {
        navigate(`/user/${user.id}/edit`);
    };

    // Accion para eliminar el usuario
    // Actualmente solo imprime en consoloa el id
    // En una aplicacion real aqui se llamaria a la API
    const handleDelete = () => {
        console.log("Eliminar usuario", user.id)
    };

    return (
        //  Contenedor de los botones de acciones
        <div className="flex gap-2">

            {/** Botón editar */}
            <button
                onClick={handleEdit} // Ejecuta la navegacion a la pagina ediciom
                className="p-1 rounded hover:bg-gray-100"
            >

                <Pencil size={16}/> {/** Icono de editar */}
            </button>

             {/** Botón eliminar */}
            <button
                onClick={handleDelete} // Ejecuta la navegacion a la pagina ediciom
                className="p-1 rounded hover:bg-gray-100"
            >

                <Trash2 size={16}/> {/** Icono de eliminar */}
            </button>

        </div>
    )






}