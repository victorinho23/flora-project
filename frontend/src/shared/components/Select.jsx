//  Componente Select
// Sigue Material 3 (campo outlined): borde de 1px que se marca a 2px al enfocar,
// flecha propia que gira al abrir, texto de ayuda en gris y error en rojo debajo
import { ChevronDown } from "lucide-react";

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
    placeholder = "Seleccione una opción",
    size = "lg",
    disabled = false,
    helper,

}){
   const variants = {
        latte: {
            label: `text-br-s900 text-sm! font-semibold`,
            control: `bg-bg-w border-bd-s400 text-br-s950 shadow-m3-1 hover:border-bd-s950 focus:border-bd-t900 focus:ring-1 focus:ring-inset focus:ring-bd-t900`,
            empty: `text-br-s500!`,
            icon: `text-br-s800 group-focus-within:text-br-t900`,
            helper: `text-br-s800`,
            optionText: `text-br-s950`,
            optionBg: `bg-bg-w`,
        },
        cafe: {
            label: `text-br-p100 text-sm! font-semibold`,
            control: `bg-bg-s900 border-bd-p400 text-bg-w hover:border-bd-w focus:border-bd-t300 focus:ring-1 focus:ring-inset focus:ring-bd-t300`,
            empty: `text-br-p300!`,
            icon: `text-br-p100 group-focus-within:text-br-t300`,
            helper: `text-br-p100`,
            optionText: `text-bg-w`,
            optionBg: `bg-bg-s900`,
        },
    }

    // Tamaños: lg para formularios (56, como el campo de Material 3) y md para filtros y tablas (minimo 48)
    const sizes = {
        lg: `h-14 pl-4 pr-11 text-m3-body-large`,
        md: `h-12 pl-3 pr-9 text-m3-body-medium`,
    }

    const width = fullWidth ? "w-full" : size === "md" ? "w-full sm:w-auto" : "w-80"

    const v = variants[variant] ?? variants.latte;
    const isEmpty = value === "" || value === undefined || value === null;

    return(
        <div className={size === "md" ? "" : width}>
            {/** Label solo se muestra si truhty es un uno logico */}
            {label && (
            <label 
                htmlFor={htmlFor}
                className={`
                    block 
                    text-caption 
                    mb-1
                    ${v.label} ${error ? "text-m3-error!" : ""}
                    `}>
                {label}
            </label>
        )}

        {/** Select: la flecha del navegador se quita y se pone la de Material */}
        <div className={`group relative ${size === "md" ? width : "w-full"}`}>
            <select 
                name={name}
                value={value}
                onChange={onChange}
                id={htmlFor}
                disabled={disabled}
                aria-invalid={Boolean(error)}
                aria-describedby={error || helper ? `${htmlFor}-support` : undefined}
                className={`
                    w-full
                    appearance-none
                    cursor-pointer
                    ${sizes[size] ?? sizes.lg}
                    rounded-m3-xs
                    border
                    transition-[border-color,box-shadow] duration-200 ease-m3-standard
                    focus:outline-none
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${v.control}
                    ${isEmpty && placeholder !== false ? v.empty : ""}
                    ${error ? "border-m3-error! ring-1 ring-inset ring-m3-error" : ""}
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

            {/* flecha: gira cuando el select esta enfocado */}
            <ChevronDown
                size={size === "md" ? 18 : 20}
                aria-hidden="true"
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${size === "md" ? "right-2.5" : "right-3.5"} transition-transform duration-200 group-focus-within:rotate-180 ${error ? "text-m3-error" : v.icon}`}
            />
        </div>

        {/* texto de apoyo: el error en rojo o una ayuda en gris */}
        {error ? (
            <p id={`${htmlFor}-support`} className="text-sm place-self-start inline-block mt-1 px-2 py-0.5 rounded bg-m3-error-container text-m3-on-error-container font-medium">{error}</p>
        ) : helper ? (
            <p id={`${htmlFor}-support`} className={`mt-1 px-4 text-m3-body-small ${v.helper}`}>{helper}</p>
        ) : null}


        </div>
    )
}
