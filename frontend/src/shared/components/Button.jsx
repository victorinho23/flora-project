// Componente button
// Sigue Material 3: forma de pildora, capa de estado y sombras de elevacion de los tokens

export default function Button ({
    variant = "primary",
    size = "md",
    type = "button",
    children,
    ...props

}){

    // Variantes con los roles de Material 3: el color sale de la paleta de Flora
    // y el hover/foco/presionado lo pone la capa de estado (m3-state), no un brillo ni un salto
    const variants = {
        // Para fondos claros:
        // espresso = boton relleno principal (filled)
        espresso: `bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950 text-bg-w font-semibold shadow-m3-1 hover:shadow-m3-2`,
        // caramelo = boton tonal para una accion importante pero no la principal
        caramelo: `bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 text-bg-w font-semibold shadow-m3-1 hover:shadow-m3-2`,
        // enlace = boton de texto
        enlace: `bg-transparent text-br-t950 text-sm font-semibold underline-offset-4 hover:underline`,
        // crema = boton secundario: igual que los filtros de las tablas (fondo cafe, borde claro y esquinas poco redondeadas)
        // asi se lee bien tanto en fondos claros (formularios) como en los encabezados oscuros
        crema: `bg-bg-s900 text-bg-w font-semibold border border-bd-p400 rounded-m3-xs! hover:border-bd-w disabled:opacity-60!`,
        // contorno = boton con borde (outlined de Material 3) para la accion secundaria en fondos claros
        // (Cancelar, Volver, Cerrar): asi no compite con el boton relleno de la accion principal
        contorno: `bg-transparent text-br-t950 font-semibold border border-m3-outline hover:border-bd-t900`,
        primary: `bg-bg-s800 text-bg-w shadow-m3-1 hover:shadow-m3-2`,
        sex: ` bg-transparent border border-bg-w/60 text-bg-w hover:border-br-t300`,
        statusActive: `bg-m3-success text-white shadow-m3-1 hover:shadow-m3-2`,
        statusInactive: `bg-m3-error text-m3-on-error shadow-m3-1 hover:shadow-m3-2`,
        danger: `bg-m3-error text-m3-on-error shadow-m3-1 hover:shadow-m3-2`,
    };

    const sizes = {
        sm: `
            h-8
            whitespace-nowrap
            px-4
            before:absolute before:content-['']
            before:-inset-y-[8px] before:-inset-x-[0px]

            `,
        md: `
            h-10
            px-4
            before:absolute before:content-['']
            before:-inset-y-[4px] before:-inset-x-[0px]
        
            `,
        mdl: `
            h-10
            px-4
            w-50
            before:absolute before:content-['']
            before:-inset-y-[4px] before:-inset-x-[0px]
        
            `,
        lg: `
            h-12 
            px-4
            before:absolute before:content-['']
            before:-inset-y-[0px] before:-inset-x-[0px]
            before:pointer-events-none
            `,
        w: `
            h-14 
            w-full max-w-120
            px-4
            before:absolute before:content-['']
            before:-inset-y-[0px] before:-inset-x-[0px]
        
        
            `,
        lgg: `
            h-14 
            w-60
            px-4
            before:absolute before:content-['']
            before:-inset-y-[0px] before:-inset-x-[0px]
            `,
        lggg: `
            h-14 
            w-full max-w-93
            px-4
            before:absolute before:content-['']
            before:-inset-y-[0px] before:-inset-x-[0px]
            `,
    }

    return(
        <button
            type= {type}
            className={`
                m3-state
                flex 
                items-center 
                gap-3
                justify-center
                rounded-m3-full
                text-m3-label-large
                transition-[box-shadow,border-color,background-color] duration-200 ease-m3-standard
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus focus-visible:ring-offset-2
                disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                ${variants[variant]}    
                ${sizes[size]}    
                `}
                {...props}
        >
            {children}

        </button>

    )
}
