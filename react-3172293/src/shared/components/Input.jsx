export default function Input({
    label,
    error,
    htmlFor,
    type = "text",
    variant="secondary",
    size="lg",
    ...props

}){
    const variants = {
        // Estos valores deben ser con variables
        primary: `
            border border-brand
            bg-yellow-950
        `,
        secondary: `
            border border-brand
            bg-background
        `,
        tertiary: `
            border border-purple-950
        
        `,

        fourth: `
            bg-transparent
            border border-white
            text-white
            placeholder-text-primary 
        `,
        
    }

    const sizes = {
        sm: `
            h-8
            
        `,
        md: `
            h-10
        
        `,
        lg: `
           h-12
           
        
        `,
    }



   

    return(
        <div className="w-80">

            {/* Label*/}

        <label 
            // El html for cuando es largo se hace con kebab-case
            htmlFor={htmlFor}
            className={`
                block
                text-caption
                text-secondary
                ${
                  size === "sm"
                  ? "-mb-1"
                  : size === "md"
                  ? "mb-0"
                  : "mb-1"
                }
                  ${error ? "border-red-800" : "text-caption"}

                
            `}
            

            >
            {label} 
        </label>

        {/* Contenedor input */}

        <div 
            className="
            relative
            h-10
            grid
            items-center
            "
        >

        {/* Area Interactiva invisible de 48px */}
        
        <div 
            className="
            absolute inset-0
        "   
            onMouseDown={(e) =>{
                e.preventDefault();
                e.currentTarget.nextSibling.focus();
            }}
        />
           
        {/* Input visual */}

        <input 
        id={htmlFor}
        type={type}
        error={error}
        className={`
            relative
            w-full
            rounded-md
            border
            text-body
            
            focus:outline-none
            px-4
            focus:ring-2
            focus:ring-ring
            focus:ring-brand
            ${variants[variant]}
            ${sizes[size]}
            ${error ? "border border-red-800": "border border-border"}

        `}
        {...props}

        />

         <div className="">
                {/** Feedback */}
                {error && (
                    <p className="text-caption text-red-800 place-self-start   " >{error}</p>
                )}
            </div>
            

        </div>

        

        </div>












    
    )

}