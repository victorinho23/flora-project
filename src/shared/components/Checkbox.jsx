export default function Checkbox({
    id,
    name,
    label,
    checked = false,
    onChange,
    disabled = false,
    className = "",
}) {

    return(
        <label 
            htmlFor={id}
            className = {`
                flex
                items-center 
                gap-2
                text-sm
                cursor-pointer
                text-text-primary
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



