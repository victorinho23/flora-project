// Componente button

export default function Button ({
    variant = "primary",
    size = "md",
    type = "button",
    children,
    ...props

}){

    const variants = {
        // Para fondos claros:
        primary: `bg-bg-s800 text-bg-w hover:bg-bg-s950 active:scale-95 shadow-md transition-all duration-200`,
        fifth: `bg-br-t600 text-bg-w hover:bg-br-t700 active:scale-95 shadow-md shadow-br-t600/30 transition-all duration-200`,

        // Para fondos oscuros
        secondary: `bg-br-p900 text-bg-p50 hover:bg-br-p950 active:scale-95 shadow-md transition-all duration-200`,
        tertiary: "bg-transparent text-text-primary hover:bg-brand-button-hover border border-0.5  rounded-[5px]  shadow-[0_0_3px_white] ",
        cuar: `bg-br-p200 text-bg-s900 hover:bg-br-p300
        active:scale-95 transition-all duration-200`,
        sex: ` bg-transparent border border-bg-w/30 text-bg-w hover:border-br-t400 hover:shadow-[0_0_15px_var(--color-br-t400)]/50 hover:bg-bg-w/5 active:scale-95 transition-all duration-300`,
        
        // Funciona para ambos fondos
        sev: `bg-transparent border-2 border-br-t500 text-br-t400 hover:bg-br-t500 hover:text-bg-w hover:scale-105 active:scale-95 transition-all duration-300`
    };

    const sizes = {
        sm: `
            h-8
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
            w-115
            px-4
            before:absolute before:content-['']
            before:-inset-y-[0px] before:-inset-x-[0px]
        
        
            `,
        lgg: `
            h-14 
            px-4
            before:absolute before:content-['']
            before:-inset-y-[0px] before:-inset-x-[0px]
        
        
            `,
    }

    return(
        <button
            type= {type}
            className={`
                relative
                flex 
                items-center 
                gap-3
                justify-center
                rounded-md
                transitions-colors
                ${variants[variant]}    
                ${sizes[size]}    
                `}
                {...props}
        >
            {children}

        </button>

    )
}
