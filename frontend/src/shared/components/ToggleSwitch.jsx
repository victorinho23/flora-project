// src/shared/components/ToggleSwitch.jsx
// Interruptor sencillo con texto, se usa en gestion de permisos
// disabled = se ve pero no se puede cambiar (ej. un permiso que la persona no tiene)
export default function ToggleSwitch({ checked, onChange, label, disabled = false }) {
    return (
        <label className={`min-h-12 flex items-center gap-3 select-none ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`
                    m3-target relative w-13 h-8 rounded-full flex-shrink-0
                    transition-colors duration-300 disabled:cursor-not-allowed
                    ${checked ? "bg-bg-t900" : "bg-m3-surface-highest border-2 border-m3-outline"}
                `}
            >
                {/* Material 3: apagado = riel con borde y bolita pequeña del color del borde (se ve en claro y en oscuro);
                    prendido = riel lleno y bolita blanca grande */}
                <span
                    className={`
                        absolute top-1/2 -translate-y-1/2 rounded-full
                        transition-all duration-300
                        ${checked ? "left-1 w-6 h-6 translate-x-5 bg-bg-w shadow-m3-1" : "left-1.5 w-4 h-4 bg-m3-outline"}
                    `}
                />
            </button>
            <span className="text-br-s950 font-semibold text-base">
                {label}
            </span>
        </label>
    );
}
