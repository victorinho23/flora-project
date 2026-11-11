// src/shared/components/Textarea.jsx
// Campo de texto largo reutilizable con label, variantes y mensaje de error
export default function Textarea({
    label,
    error,
    htmlFor,
    variant = "latte",
    rows = 4,
    ...props

}){
    const variants = {
        latte: `bg-bg-w border border-bd-s400 text-br-s950 placeholder:text-br-s500 shadow-sm focus:border-bd-t900 focus:ring-2 focus:ring-fc-t200 h-60`,
    }

    const labelColors = {
        latte: `text-br-s900 text-sm! font-semibold`,
    }

    return(
        <div className="w-full">

            <label
                htmlFor={htmlFor}
                className={`
                    block
                    text-caption
                    mb-1
                    ${labelColors[variant]}
                `}
            >
                {label}
            </label>

            <textarea
                id={htmlFor}
                rows={rows}
                className={`
                    w-full
                    rounded-md
                    border
                    text-body
                    resize-none
                    transition-all duration-300
                    focus:outline-none
                    px-4
                    py-3
                    focus:ring-2
                    focus:ring-ring
                    focus:ring-brand
                    ${variants[variant]}
                    ${error ? "border-2 border-red-800!" : ""}
                `}
                {...props}
            />

            {error && (
                <p className="text-sm place-self-start inline-block mt-1 px-2 py-0.5 rounded bg-red-50 text-red-900 font-medium">{error}</p>
            )}

        </div>
    )
}