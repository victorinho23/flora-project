//  Componente Select

export default function Select({

    label,
    error,
    htmlFor,
    name, 
    onChange,
    value,
    variant = "p",
    options = [],

}){
   const variants = {
        // Estos valores deben ser con variables
        p: `
            text-text-primary
           
        `,
        s: `
            text-text-ligth-coffe
        `,
        
    }

    return(
        <div>
            {/** Label solo se muestra si truhty es un uno logico */}
            {label && (
            <label 
                htmlFor={htmlFor}
                className={`
                    block 
                    text-caption 
                    text-secondary
                    ${variants[variant]}
                    `}>
                {label}
            </label>
        )}

        {/** Select */}

        <select 
            name={name}
            value={value}
            onChange={onChange}
            id="htmlFor"
            className="
                w-80
                h-12
                rounded-md
                px4
                bg-background-coffe
                bg-

                border
                hover:border-2
                hover:border-focus-border
                text-text-primary
            "
        >

        <option className="text-primary" value="">Seleccione una opcion</option>  

        {options.map ((opt)=> (
            <option className="text-primary" key = {opt.value} value= {opt.value}>
                {opt.label}
            </option>

        ))}

        </select>
        {error && (
                <p className="text-caption text-red-800 place-self-start mt-1">{error}</p>
            )}


        </div>
    )
}
