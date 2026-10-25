//  Componente Select
export default function Select({
    label,
    error,
    htmlFor,
    name, 
    onChange,
    value,
    variant = "latte",
    options = [],
    fullWidth = false,
    placeholder = "Seleccione una opcion",
    size = "lg",

}){
   const variants = {
        latte: { label: `text-br-s900 text-sm! font-semibold`, control: `bg-bg-w border border-bd-s400 text-br-s950 shadow-sm focus:border-bd-t900 focus:ring-2 focus:ring-fc-t200 focus:outline-none`, optionText: `text-br-s950`, optionBg: `bg-bg-w` },
        cafe: { label: `text-br-p100 text-sm! font-semibold`, control: `bg-bg-s900 border border-bd-p400 text-bg-w focus:border-bd-t300 focus:ring-2 focus:ring-fc-t200 focus:outline-none`, optionText: `text-bg-w`, optionBg: `bg-bg-s900` },
    }

    // Tamaños: lg para formularios y md para filtros y tablas
    const sizes = {
        lg: `h-12 px-4`,
        md: `h-10 px-3`,
    }

    const width = fullWidth ? "w-full" : size === "md" ? "w-full sm:w-auto" : "w-80"

    const v = variants[variant] ?? variants.latte;

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
                    ${v.label}
                    `}>
                {label}
            </label>
        )}

        {/** Select */}

        <select 
            name={name}
            value={value}
            onChange={onChange}
            id={htmlFor}
            className={`
                ${width}
                ${sizes[size] ?? sizes.lg}
                rounded-md
                border
                hover:border-2
                hover:border-focus-border
                transition-all duration-300
                ${v.control || "bg-background-coffe text-text-primary"}
            `}
        >

        {placeholder !== false && (
            <option className={`${v.optionText} ${v.optionBg}`} value="">{placeholder}</option>
        )}

        {options.map ((opt)=> (
            <option className={`${v.optionText} ${v.optionBg}`} key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
                {opt.label}
            </option>

        ))}

        </select>
        {error && (
                <p className="text-sm place-self-start inline-block mt-1 px-2 py-0.5 rounded bg-red-50 text-red-900 font-medium">{error}</p>
            )}


        </div>
    )
}