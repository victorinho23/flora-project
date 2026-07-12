export default function Checkbox({
    id,
    name,
    label,
    checked = false,
    onChange,
    variant="secondary",
    disabled = false,
    className = "",
}) {
    const variants = {
        // Estos valores deben ser con variables
        primary: `
            text-text-primary
        `,
        secondary : `text-text-secondary`,
        tertiary : `text-text-coffe`,

    }

    return(
        <label 
            htmlFor={id}
            className = {`
                flex
                items-center 
                gap-2
                text-sm
                cursor-pointer
                ${variants[variant]}
                ${disabled ? "opacity-50 cursor-not allowed" : ""}
                ${className}
                `}
        >

            {/**Input del checkBox */}

            <input
                id={id}
                name={name}
                type="checkbox"
                checked = {checked}
                disabled={disabled}
                onChange={onChange}
                className="w-5 h-5"
            />

            {/** Texto del checkbox */}
            <span>{label}</span>

        </label>

    );
}



