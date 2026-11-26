// Hooks de React para manejar estado y efetos
import {useState} from "react";

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

    // Si el padre cambia "checked", el estado interno se pone igual en el mismo render
    // (asi lo recomienda React en vez de un useEffect, que pintaba dos veces)
    const [lastChecked, setLastChecked] = useState(checked);
    if (checked !== lastChecked) {
        setLastChecked(checked);
        setIsActive(checked);
    }

    // Funcion que maneja el cambio del switch
    const handleToggle = () => {

        // Si el switch esta deshabilitado no permite interaccion
        if (disabled) return;

        // Calcula el nuevo estado (invierte el valor actual)
        const newValue = !isActive;

        // Si existe un callback onChange, se ejecuta
        // enviando el nuevo valor al componente padre

        // Actualize el esatdo interno 
        setIsActive(newValue);

        if(onChange){
            Promise.resolve(onChange(newValue)).then((accepted) => {
                if (accepted === false) setIsActive(!newValue);
            });
        }
    };

    // Clases de tamaño del contendor del switch
    const sizes = {
        // md = medida de Material 3 (32 x 52)
        sm: "h-6 w-10",
        md: "h-8 w-13",
        lg: "h-9 w-15",
    };

    // Clases de tamaño del "knob" (el circulo que se mueve)
    const knobSizes = {
        sm: "h-5 w-5",
        md: "h-6 w-6",
        lg: "h-7 w-7",
    };

    // cuanto se corre el knob para quedar al otro lado (largo del switch - knob - margenes)
    const moves = {
        sm: "translate-x-3",
        md: "translate-x-5",
        lg: "translate-x-6",
    };

    return(

        // Boton que funciona como switch 
        <button
            type="button"
            onClick={handleToggle} // Evento que cambia el estado
            disabled = {disabled} // Permite deshabilitar el boton
            className={`
                // Posicionamiento base del switch (m3-target = se toca en 48 aunque se vea mas pequeño)
                m3-target relative inline-flex items-center
                
                // Forma redondeada del contendor
                rounded-full transition-colors

                // Tamaño dinamico segun el prop "size"
                ${sizes[size]}

                // Color dependiedo del estado
                ${isActive ? "bg-m3-success" : "bg-bg-p600"}

                // Estilo cuando esta deshabilitado 
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
        >

        {/** "Knob" del switch (el circulo que se mueve de izquierda a derecha) */}

        <span className={`
            absolute left-1 flex items-center justify-center

            // Forma del knob

            rounded-full bg-white shadow

            // Animacion de movimiento
            transition-transform

            // Tamaño dinamico del knob
            ${knobSizes[size]}

            // posicion dependiendo del estado
            ${isActive ? moves[size] : "translate-x-0"}
            `}
        >

            {/** Icono que cambia dependienmdo del estado activo inactivo */}
            {isActive ? (
                <Check size ={12} className= "text-m3-success" /> 
            ) :
                (
                    <X size={12} className="text-gray-700" />
                )
            }
        </span>


        </button>
    );
}

