export default function ToggleSwitch({ checked, onChange, label }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`
                    relative w-11 h-6 rounded-full flex-shrink-0
                    transition-colors duration-300
                    ${checked ? "bg-br-p700" : "bg-bd-w/30"}
                `}
            >
                <span
                    className={`
                        absolute top-0.5 left-0.5
                        w-5 h-5 rounded-full bg-bg-w shadow-md
                        transition-transform duration-300
                        ${checked ? "translate-x-5" : "translate-x-0"}
                    `}
                />
            </button>
            <span className="text-bg-w font-semibold text-sm">
                {label}
            </span>
        </label>
    );
}