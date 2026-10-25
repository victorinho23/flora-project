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
        espresso: `bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950 text-bg-w font-semibold shadow-md hover:shadow-lg hover:brightness-125 active:scale-95 transition-all duration-200`,
        caramelo: `bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 text-bg-w font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200`,
        enlace: `bg-transparent text-br-t950 text-sm font-semibold underline-offset-4 hover:underline`,
        crema: `bg-bg-w text-br-s950 font-semibold border border-bd-s300 shadow-sm hover:bg-bg-t50 hover:border-bd-s500 active:scale-95 transition-all duration-200`,
        primary: `bg-bg-s800 text-bg-w hover:bg-bg-s950 active:scale-95 shadow-md transition-all duration-200`,
        sex: ` bg-transparent border border-bg-w/60 text-bg-w hover:border-br-t300 hover:shadow-[0_0_15px_var(--color-br-t400)]/50 hover:bg-bg-w/5 active:scale-95 transition-all duration-300`,
        statusActive: `bg-green-800 text-white hover:bg-green-900 active:scale-95 shadow-md transition-all duration-300`,
        statusInactive: `bg-red-800 text-white hover:bg-red-900 active:scale-95 shadow-md transition-all duration-300`,
        danger: `bg-red-800 text-white hover:bg-red-900 active:scale-95 shadow-md transition-all duration-200`,
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
