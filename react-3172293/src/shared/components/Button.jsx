// Componente button

export default function Button ({
    variant = "primary",
    size = "md",
    type = "button",
    children,
    ...props

}){

    const variants = {
        primary : "bg-brand text-text-inverse hover:bg-brand-hover",    secondary : "bg-brand-soft text-text-primary hover:bg-brand-soft-hover" ,
        tertiary: "bg-transparent text-text-primary hover:bg-brand-button-hover "
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
        lg: `
            h-12 
            px-4
            before:absolute before:content-['']
            before:-inset-y-[0px] before:-inset-x-[0px]
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
