// Hooks de React para manejar estado y efetos
import {useState, useEffect} from "react";

// Iconos usados dentro del switch
import { Check, X } from "lucide-react"

// Componente reutilizable para representar un switch de estado (activo/inactivo)

export default function Switch ({
    checked = false, // Valor inicial del switch (controlado desde el padre)
    onChange,  // Callback que se ejecutas cuando cambia el estado
    disabled = false, // Permite deshabilitar la interaccion
    size = "md", // Tamaño del switch (sm, md, lg)
}) {

    //Estado interno del componente
    // Se inicializa  con el valor recibido desde desde la prop "checked"
    const [isActive, setIsActive] = useState(checked);

    // El efecto que sincroniza el estado interno
    // Con el valor recibido desde el componente padre

    useEffect(() => {
        setIsActive(checked);
    },[checked]) // Se ejecuta cada vez que cambia "checked"

    // Funcion que maneja el cambio del switch
    const handleToggle = () => {

        // Si el switch esta deshabilitado no permite interaccion
        if (disabled) return;

        // Calcula el nuevo estado (invierte el valor actual)
        const newValue = !isActive;

        // Actualize el esatdo interno 
        setIsActive(newValue);

        // Si existe un callback onChange, se ejecuta
        // enviando el nuevo valor al componente padre

        if(onChange){
            onChange(newValue)
        }
    };

    // Clases de tamaño del contendor del switch
    const sizes = {
        sm: "h-5 w-9",
        md: "h-6 w-11",
        lg: "h-7 w-14",
    };

    // Clases de tamaño del "knob" (el circulo que se mueve)
    const knobSizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
    };

    return(

        // Boton que funciona como switch 
        <button
            onClick={handleToggle} // Evento que cambia el estado
            disabled = {disabled} // Permite deshabilitar el boton
            className={`
                // Posicionamiento base del switch
                relative inline-flex items-center
                
                // Forma redondeada del contendor
                rounded-full transition-colors

                // Tamaño dinamico segun el prop "size"
                ${sizes[size]}

                // Color dependiedo del estado
                ${isActive ? "bg-green-500" : "bg-gary-300"}

                // Estilo cuando esta deshabilitado 
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
        >

        {/** "Knob" del switch (el circulo que se mueve de izquierda a derecha) */}

        <span className={`
            absolute left-0.5 flex items-center justify-center

            // Forma del knob

            rounded-full bg-white shadow

            // Animacion de movimiento
            transition-transform

            // Tamaño dinamico del knob
            ${knobSizes[size]}

            // posicion dependiendo del estado
            ${isActive ? "translate-x-full" : "translate-x-0"}
            `}
        >

            {/** Icono que cambia dependienmdo del estado activo inactivo */}
            {isActive ? (
                <Check size ={12} className= "text-green-600" /> 
            ) :
                (
                    <X size={12} className="text-gray-500" />
                )
            }
        </span>


        </button>
    );
}

