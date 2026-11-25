// src/shared/components/iconButton.jsx
import React from "react";
import clsx from "clsx";


/*
 IconButton
 Área táctil (hit area): tamaño del botón
 -Áreaa visible: tamaño del ícono (controlado por wrapper interno)
*/

// React.forwardRef"puente para que el padre controle el DOM interno"

export const IconButton = React.forwardRef(function IconButton(
    {
        children,
        onClick,
        disabled = false,
        className = "",
        variant = "primary",

        //Tamaños
        hitSize = 48, // px (área táctil)
        iconSize = 24, // px (icono visible)

        //Accesibilidad
        ariaLabel,

        // Estados
        isActive = false,

        ...props
    },
    ref
) {
    // boton de icono de Material 3: circular, con capa de estado y area tactil de 48px
    const baseStyles = `
        m3-state
        inline-flex items-center justify-center
        rounded-m3-full
        focus:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus focus-visible:ring-offset-2
        disabled:opacity-40 disabled:pointer-events-none
    `;

    const variants = {
        primary: `
            text-white
        `
    };

    return (
        <button 
            ref={ref}
            type="button"
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={onClick}
            className={clsx(baseStyles, variants[variant], className, {
                "bg-bg-w/15": isActive,
            })}
            style={{
                width: `${hitSize}px`,
                height: `${hitSize}px`,
            }}
            {...props}
        >
            <span
                style={{
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,                    

                }}
                className="flex items-center justify-center"
            >
                {children}
            </span>
        </button>
    );
});

export default IconButton;
