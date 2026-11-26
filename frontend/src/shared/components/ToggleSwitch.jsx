// src/shared/components/ToggleSwitch.jsx
// Interruptor sencillo con texto, se usa en gestion de permisos
export default function ToggleSwitch({ checked, onChange, label }) {
    return (
        <label className="min-h-12 flex items-center gap-3 cursor-pointer select-none">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`
                    m3-target relative w-13 h-8 rounded-full flex-shrink-0
                    transition-colors duration-300
                    ${checked ? "bg-bg-t900" : "bg-bg-s300"}
                `}
            >
                <span
                    className={`
                        absolute top-1 left-1
                        w-6 h-6 rounded-full bg-bg-w shadow-m3-1
                        transition-transform duration-300
                        ${checked ? "translate-x-5" : "translate-x-0"}
                    `}
                />
            </button>
            <span className="text-br-s950 font-semibold text-base">
                {label}
            </span>
        </label>
    );
}