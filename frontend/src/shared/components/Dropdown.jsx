import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    cloneElement
} from "react"
import { Link } from "react-router-dom"

const variants = {};

const DropdownContext = createContext(null)

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
                shadow-m3-2
                rounded-m3-xs
                overflow-hidden
                ${variant ? variants[variant] : ""}
                ${className}
                `}
        >
            {children}
        </div>
    )
}

// Item
// si llega "to" se pinta como enlace (para navegar), si no como boton (para acciones)
// asi no queda un enlace metido dentro de un boton
// "active" marca la opcion de la pagina en la que estas

export function DropdownItem({
    children,
    onClick,
    to,
    active = false,
    className = ""
}) {
    const {setOpen} = useContext(DropdownContext)

    const handleClick = (e) => {
        onClick?.(e)
        setOpen(false)
    }

    const styles = `
        m3-state block w-full text-left px-3 py-2.5 rounded-m3-xs text-m3-label-large
        focus:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus
        ${active ? "bg-m3-secondary-container text-m3-on-secondary-container font-semibold" : ""}
        ${className}
    `

    if (to) {
        return (
            <Link
                role="menuitem"
                to={to}
                onClick={handleClick}
                aria-current={active ? "page" : undefined}
                className={styles}
            >
                {children}
            </Link>
        )
    }

    return (
        <button
            type="button"
            role="menuitem"
            onClick = {handleClick}
            className={styles}
        >
            {children}
        </button>
    )
}
