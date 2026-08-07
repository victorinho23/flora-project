export default function Input({
    label,
    error,
    htmlFor,
    type = "text",
    variant="secondary",
    size="lg",
    ...props

}){
    const variants = {
        primary: `border border-brand bg-yellow-950`,
        secondary: `border border-brand bg-background`,
        tertiary: `border border-purple-950`,
        fourth: `bg-transparent border border-white text-white placeholder-text-primary`,

        // ===== CLARAS que van del (5-13) =====
        fifth: `bg-bg-w border border-bd-g400 text-text-inverse focus:border-fc-p700`,
        sixth: `bg-transparent border-2 border-br-p700 text-text-inverse focus:bg-bg-p50`,
        seventh: `bg-br-p200 border border-br-p400 text-text-inverse`,
        eighth: `bg-bg-w border-2 border-br-t500 text-text-inverse focus:shadow-[0_0_10px_var(--color-br-t400)]/40`,
        ninth: `bg-bg-w/40 backdrop-blur-md border border-bd-g200 text-text-inverse`,
        tenth: `bg-bg-w border border-bd-g100 shadow-md text-text-inverse focus:shadow-lg`,
        eleventh: `bg-br-p300 border border-br-p500 text-text-inverse`,
        twelfth: `bg-transparent border-b-2 border-bd-g300 text-text-inverse rounded-none focus:border-fc-p700`,
        thirteenth: `bg-bg-w border-2 border-br-t600 text-text-inverse focus:border-br-t700`,

        // ===== OSCURAS que van (14-23) =====
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
    }

    const sizes = {
        sm: `h-8`,
        md: `h-10`,
        lg: `h-12`,
    }

    return(
        <div className="w-80">
            <label 
                htmlFor={htmlFor}
                className={`
                    block text-caption text-secondary
                    ${size === "sm" ? "-mb-1" : size === "md" ? "mb-0" : "mb-1"}
                    ${error ? "border-red-800" : "text-caption"}
                `}
            >
            {label} 
            </label>

            <div className="relative h-10 grid items-center">
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
                        focus:outline-none px-4 focus:ring-2 focus:ring-ring focus:ring-brand
                        ${variants[variant]}
                        ${sizes[size]}
                        ${error ? "border border-red-800": "border border-border"}
                    `}
                    {...props}
                />

                <div>
                    {error && (
                        <p className="text-caption text-red-800 place-self-start">{error}</p>
                    )}
                </div>
            </div>
        </div>
    )
}