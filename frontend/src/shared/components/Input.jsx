// src/shared/components/Input.jsx
// Campo de texto reutilizable con label, variantes y mensaje de error
export default function Input({
    label,
    error,
    htmlFor,
    type = "text",
    variant="latte",
    size="lg",
    fullWidth = false,
    width,
    ...props

}){
    const variants = {
        latte: `bg-bg-w border border-bd-s400 text-br-s950 placeholder:text-br-s500 shadow-sm focus:border-bd-t900 focus:ring-2 focus:ring-fc-t200`,
        cafe: `bg-bg-s900 border border-bd-p400 text-bg-w placeholder:text-br-p300 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:invert focus:border-bd-t300 focus:ring-2 focus:ring-fc-t200`,
        caramelo: `bg-bg-t50 border border-bd-t900 text-br-t900 font-bold shadow-sm focus:border-bd-t900 focus:ring-2 focus:ring-fc-t200`,
    }

    const labelColors = {
        latte: `text-br-s900 text-sm! font-semibold`,
        cafe: `text-br-p100 text-sm! font-semibold`,
        caramelo: `text-br-s900 text-sm! font-semibold`,
    }

    const sizes = {
        sm: `h-8`,
        md: `h-10`,
        lg: `h-12`,
    }

    return(
        <div className={width ?? (fullWidth ? "w-full" : "w-80")}>
            <label 
                htmlFor={htmlFor}
                className={`
                    block text-caption
                    ${labelColors[variant] ?? "text-secondary"}
                    ${size === "sm" ? "-mb-1" : size === "md" ? "mb-0" : "mb-1"}
                    ${error ? "border-red-800" : ""}
                `}
            >
            {label} 
            </label>

            <div className="relative grid items-center">
                <div 
                    className="absolute inset-0"   
                    onMouseDown={(e) =>{
                        e.preventDefault();
                        e.currentTarget.nextSibling.focus();
                    }}
                />
               
                <input 
                    id={htmlFor}
                    type={type}
                    error={error}
                    className={`
                        relative w-full rounded-md border text-body
                        transition-all duration-300
                        focus:outline-none ${size === "sm" ? "px-2" : "px-4"} focus:ring-2 focus:ring-ring focus:ring-brand
                        ${variants[variant]}
                        ${sizes[size]}
                        ${error ? "border-2 border-red-800!" : "border"}
                    `}
                    {...props}
                />

                <div>
                    {error && (
                        <p className="text-sm place-self-start inline-block mt-1 px-2 py-0.5 rounded bg-red-50 text-red-900 font-medium">{error}</p>
                    )}
                </div>
            </div>
        </div>
    )
}