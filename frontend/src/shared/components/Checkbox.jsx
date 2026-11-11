export default function Checkbox({
    id,
    name,
    label,
    checked = false,
    onChange,
    variant="latte",
    disabled = false,
    className = "",
}) {
    const variants = {
        // Estos valores deben ser con variables
        latte : `text-br-s900 text-base font-medium [&_input]:accent-[var(--color-bg-t900)]`,
        chipLatte : `rounded-full border border-bd-s300 bg-bg-w px-4 py-2 font-semibold text-br-s900 transition-colors hover:bg-bg-t50 has-[:checked]:bg-bg-t900 has-[:checked]:border-bd-t900 has-[:checked]:text-bg-w has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-fc-t200 [&_input]:sr-only [&_span]:before:content-['✓'] [&_span]:before:mr-1.5 [&_span]:before:font-bold [&_span]:before:hidden has-[:checked]:[&_span]:before:inline`,
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