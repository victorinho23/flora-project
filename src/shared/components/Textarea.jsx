export default function Textarea({
    label,
    error,
    htmlFor,
    variant = "cafe",
    rows = 4,
    ...props

}){
    const variants = {
        // ===== Ya existentes en Input.jsx =====
        primary: `
            border border-brand
            bg-yellow-950
        `,
        secondary: `
            border border-brand
            bg-background
        `,
        tertiary: `
            border border-purple-950
        `,
        fourth: `
            bg-transparent
            border border-white
            text-white
            placeholder-text-primary 
        `,

        // ===== CLARAS (5-13) =====
        fifth: `bg-bg-w border border-bd-g400 text-text-inverse focus:border-fc-p700`,
        sixth: `bg-transparent border-2 border-br-p700 text-text-inverse focus:bg-bg-p50`,
        seventh: `bg-br-p200 border border-br-p400 text-text-inverse`,
        eighth: `bg-bg-w border-2 border-br-t500 text-text-inverse focus:shadow-[0_0_10px_var(--color-br-t400)]/40`,
        ninth: `bg-bg-w/40 backdrop-blur-md border border-bd-g200 text-text-inverse`,
        tenth: `bg-bg-w border border-bd-g100 shadow-md text-text-inverse focus:shadow-lg`,
        eleventh: `bg-br-p300 border border-br-p500 text-text-inverse`,
        twelfth: `bg-transparent border-b-2 border-bd-g300 text-text-inverse rounded-none focus:border-fc-p700`,
        thirteenth: `bg-bg-w border-2 border-br-t600 text-text-inverse focus:border-br-t700`,

        // ===== OSCURAS (14-23) =====
        fourteenth: `bg-bg-s900 border border-bd-g700 text-text-primary focus:ring-2 focus:ring-fc-p600`,
        fifteenth: `bg-transparent border border-bd-w/30 text-text-primary focus:border-br-t400 focus:shadow-[0_0_12px_var(--color-br-t400)]/50`,
        sixteenth: `bg-bg-g950 border-2 border-br-t500 text-text-primary focus:shadow-[0_0_15px_var(--color-br-t500)]/60`,
        seventeenth: `bg-bg-w/10 backdrop-blur-md border border-bd-w/20 text-text-primary`,
        eighteenth: `bg-transparent border-2 border-br-t600 text-br-t400`,
        nineteenth: `bg-bg-p100 border border-bd-p300 text-text-inverse`,
        twentieth: `bg-bg-g900 border border-bd-g700 text-text-primary`,
        twentyFirst: `bg-gradient-to-br from-bg-g950 to-bg-s800 border border-bd-s600 text-text-primary`,
        twentySecond: `bg-bg-g900 text-text-primary shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_rgba(255,255,255,0.05)]`,
        twentyThird: `bg-bg-g950 border border-br-t500/50 text-text-primary`,

        // ===== café con texto blanco y borde glow =====
        cafe: `bg-bg-s800 border border-bg-w/40 text-bg-w placeholder-bg-w/50 shadow-[0_0_10px_rgba(255,255,255,0.15)] focus:border-bg-w/70 focus:shadow-[0_0_16px_rgba(255,255,255,0.3)] h-60`,
    }

    return(
        <div className="w-full">

            <label
                htmlFor={htmlFor}
                className={`
                    block
                    text-caption
                    text-secondary
                    mb-1
                    ${error ? "text-red-500" : ""}
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
                    ${error ? "border border-red-800" : ""}
                `}
                {...props}
            />

            {error && (
                <p className="text-caption text-red-800 place-self-start mt-1">{error}</p>
            )}

        </div>
    )
}