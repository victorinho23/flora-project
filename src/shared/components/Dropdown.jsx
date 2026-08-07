import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    cloneElement
} from "react"

const variants = {
        primary : "bg-brand text-text-inverse hover:bg-brand-hover",    secondary : "bg-brand-soft text-text-primary hover:bg-brand-soft-hover" ,
        tertiary: "bg-transparent text-text-primary hover:bg-brand-button-hover ",

        // ===== CLARAS (4-13) =====
        fourth: "bg-bg-p50 border border-bd-g300 text-text-inverse",
        fifth: "bg-bg-w border border-bd-g400 text-text-inverse",
        sixth: "bg-transparent border-2 border-br-p700 text-text-inverse",
        seventh: "bg-br-p200 border border-br-p400 text-text-inverse",
        eighth: "bg-bg-w border-2 border-br-t500 text-text-inverse shadow-[0_0_10px_var(--color-br-t400)]/30",
        ninth: "bg-bg-w/40 backdrop-blur-md border border-bd-g200 text-text-inverse",
        tenth: "bg-bg-w border border-bd-g100 shadow-lg text-text-inverse",
        eleventh: "bg-br-p300 border border-br-p500 text-text-inverse",
        twelfth: "bg-bg-w border border-bd-g300 text-text-inverse",
        thirteenth: "bg-bg-w border-2 border-br-t600 text-text-inverse",

        // ===== OSCURAS (14-23) =====
        fourteenth: "bg-bg-s900 border border-bd-g700 text-text-primary",
        fifteenth: "bg-bg-g950/90 border border-bd-w/20 text-text-primary",
        sixteenth: "bg-bg-g950 border-2 border-br-t500 text-text-primary shadow-[0_0_15px_var(--color-br-t500)]/50",
        seventeenth: "bg-bg-w/10 backdrop-blur-md border border-bd-w/20 text-text-primary",
        eighteenth: "bg-bg-g950 border-2 border-br-t600 text-br-t400",
        nineteenth: "bg-bg-p100 border border-bd-p300 text-text-inverse",
        twentieth: "bg-bg-g900 border border-bd-g700 text-text-primary",
        twentyFirst: "bg-gradient-to-br from-bg-g950 to-bg-s800 border border-bd-s600 text-text-primary",
        twentySecond: "bg-bg-g900 text-text-primary shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5)]",
        twentyThird: "bg-bg-g950 border border-br-t500/50 text-text-primary",
    };

export const DropdownContext = createContext(null)

export function Dropdown({
    children,
    open: controlledOpen,
    onOpenChange,
    className = ""

}) {


    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : uncontrolledOpen


    const setOpen = (value) => {
        if (isControlled){
            onOpenChange?.(value)
        }else{
            setUncontrolledOpen(value)
        }
    }

    const containerRef = useRef(null)

    //Click outside

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)){
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)

    },[])

    // Escape key

    useEffect(() => {
        const handleEscape = (e) =>{
            if (e.key === "Escape") setOpen(false)
        }

        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)

    }, [])

    return (
        <DropdownContext.Provider value = {{open, setOpen}}>
            <div ref ={containerRef} className={`relative inline-block ${className}`}>
                {children}
            </div>
        </DropdownContext.Provider>
    )
}

export function DropdownTrigger({children}){
    const {open, setOpen} = useContext(DropdownContext)

    if(!children) return null

    return cloneElement(children, {
        onClick: (e) => {
            children.props.onClick?.(e)
            setOpen(!open)
        },

        "aria-expanded": open,
        "aria-haspopup": "menu"
    })
}

export function DropdownContent({children, variant, className = ""}) {
    const {open} = useContext(DropdownContext)

    if (!open) return null

    return (
        <div 
            role="menu"
            className={`
                absolute
                mt-1
                min-w-48
                border
                text-text-invert
                p-1
                dark:bg-neutral-950/80
                backdrop-blur-[1px]
                shadow-lg
                rounded-2xl
                overflow-hidden
                hover:shadow-black
                transition-shadow duration-700
                ${variant ? variants[variant] : ""}
                ${className}
                `}
        >
            {children}
        </div>
    )
}

// Item

export function DropdownItem({
    children,
    onClick,
    className = ""
}) {
    const {setOpen} = useContext(DropdownContext)

    const handleClick = (e) => {
        onClick?.(e)
        setOpen(false)
    }

    return (
        <button
            role="menuitem"
            onClick = {handleClick}
            className={`
                w-full text-left px-3 py-2 rounded-lg hover:bg-gray-500 focus:bg-gray-100 transition-colors ${className}
            `}
        >
            {children}
        </button>
    )
}