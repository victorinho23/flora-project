//  Componente Select
export default function Select({
    label,
    error,
    htmlFor,
    name, 
    onChange,
    value,
    variant = "p",
    options = [],

}){
   const variants = {
        // ===== Ya existentes, sin tocar =====
        p: { label: `text-text-primary`, control: ``, optionText: `text-primary`, optionBg: `` },
        s: { label: `text-text-ligth-coffe`, control: ``, optionText: `text-primary`, optionBg: `` },

        // ===== CLARAS (4-13) =====
        fourth: { label: `text-text-inverse`, control: `bg-bg-p50 border border-bd-g300 text-text-inverse`, optionText: `text-text-inverse`, optionBg: `bg-bg-p50` },
        fifth: { label: `text-text-inverse`, control: `bg-bg-w border border-bd-g400 text-text-inverse`, optionText: `text-text-inverse`, optionBg: `bg-bg-w` },
        sixth: { label: `text-text-inverse`, control: `bg-transparent border-2 border-br-p700 text-text-inverse`, optionText: `text-text-inverse`, optionBg: `bg-bg-w` },
        seventh: { label: `text-text-inverse`, control: `bg-br-p200 border border-br-p400 text-text-inverse`, optionText: `text-text-inverse`, optionBg: `bg-br-p200` },
        eighth: { label: `text-text-inverse`, control: `bg-bg-w border-2 border-br-t500 text-text-inverse`, optionText: `text-text-inverse`, optionBg: `bg-bg-w` },
        ninth: { label: `text-text-inverse`, control: `bg-bg-w/40 backdrop-blur-md border border-bd-g200 text-text-inverse`, optionText: `text-text-inverse`, optionBg: `bg-bg-w` },
        tenth: { label: `text-text-inverse`, control: `bg-bg-w border border-bd-g100 shadow-md text-text-inverse`, optionText: `text-text-inverse`, optionBg: `bg-bg-w` },
        eleventh: { label: `text-text-inverse`, control: `bg-br-p300 border border-br-p500 text-text-inverse`, optionText: `text-text-inverse`, optionBg: `bg-br-p300` },
        twelfth: { label: `text-text-inverse`, control: `bg-transparent border-b-2 border-bd-g300 text-text-inverse rounded-none`, optionText: `text-text-inverse`, optionBg: `bg-bg-w` },
        thirteenth: { label: `text-text-inverse`, control: `bg-bg-w border-2 border-br-t600 text-text-inverse`, optionText: `text-text-inverse`, optionBg: `bg-bg-w` },

        // ===== OSCURAS (14-23) =====
        fourteenth: { label: `text-text-primary`, control: `bg-bg-s900 border border-bd-g700 text-text-primary`, optionText: `text-text-primary`, optionBg: `bg-bg-s900` },
        fifteenth: { label: `text-text-primary`, control: `bg-transparent border border-bd-w/30 text-text-primary`, optionText: `text-text-primary`, optionBg: `bg-bg-g950` },
        sixteenth: { label: `text-text-primary`, control: `bg-bg-g950 border-2 border-br-t500 text-text-primary`, optionText: `text-text-primary`, optionBg: `bg-bg-g950` },
        seventeenth: { label: `text-text-primary`, control: `bg-bg-w/10 backdrop-blur-md border border-bd-w/20 text-text-primary`, optionText: `text-text-primary`, optionBg: `bg-bg-g950` },
        eighteenth: { label: `text-br-t400`, control: `bg-transparent border-2 border-br-t600 text-br-t400`, optionText: `text-br-t400`, optionBg: `bg-bg-g950` },
        nineteenth: { label: `text-text-inverse`, control: `bg-bg-p100 border border-bd-p300 text-text-inverse`, optionText: `text-text-inverse`, optionBg: `bg-bg-p100` },
        twentieth: { label: `text-text-primary`, control: `bg-bg-g900 border border-bd-g700 text-text-primary`, optionText: `text-text-primary`, optionBg: `bg-bg-g900` },
        twentyFirst: { label: `text-text-primary`, control: `bg-gradient-to-br from-bg-g950 to-bg-s800 border border-bd-s600 text-text-primary`, optionText: `text-text-primary`, optionBg: `bg-bg-g950` },
        twentySecond: { label: `text-text-primary`, control: `bg-bg-g900 text-text-primary`, optionText: `text-text-primary`, optionBg: `bg-bg-g900` },
        twentyThird: { label: `text-text-primary`, control: `bg-bg-g950 border border-br-t500/50 text-text-primary`, optionText: `text-text-primary`, optionBg: `bg-bg-g950` },

        // ===== NUEVA: café con texto blanco y borde glow =====
        cafe: {
            label: `text-bg-w`,
            control: `bg-bg-s800 border border-bg-w/40 text-bg-w shadow-[0_0_10px_rgba(255,255,255,0.15)] focus:border-bg-w/70 focus:shadow-[0_0_16px_rgba(255,255,255,0.3)]`,
            optionText: `text-bg-w`,
            optionBg: `bg-bg-s800`
        },
    }

    const v = variants[variant] ?? variants.p;

    return(
        <div>
            {/** Label solo se muestra si truhty es un uno logico */}
            {label && (
            <label 
                htmlFor={htmlFor}
                className={`
                    block 
                    text-caption 
                    text-secondary
                    ${v.label}
                    `}>
                {label}
            </label>
        )}

        {/** Select */}

        <select 
            name={name}
            value={value}
            onChange={onChange}
            id="htmlFor"
            className={`
                w-80
                h-12
                rounded-md
                px-4
                border
                hover:border-2
                hover:border-focus-border
                transition-all duration-300
                ${v.control || "bg-background-coffe text-text-primary"}
            `}
        >

        <option className={`${v.optionText} ${v.optionBg}`} value="">Seleccione una opcion</option>  

        {options.map ((opt)=> (
            <option className={`${v.optionText} ${v.optionBg}`} key = {opt.value} value= {opt.value}>
                {opt.label}
            </option>

        ))}

        </select>
        {error && (
                <p className="text-caption text-red-800 place-self-start mt-1">{error}</p>
            )}


        </div>
    )
}