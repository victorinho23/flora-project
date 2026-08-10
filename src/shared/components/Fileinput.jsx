// src/shared/components/FileInput.jsx
// Input controlado: soporta imagenes + PDF, previw condicional, reorder y limpieza de memoria

import {useRef, useState, useEffect, useMemo}  from "react"
import {Infinity as InfinityLoader} from "ldrs/react"
import "ldrs/react/Infinity.css"

const dropZoneVariants = {
    fourth: "border-bd-g300 bg-bg-p50 text-text-inverse",
    fifth: "border-bd-g400 bg-bg-w text-text-inverse",
    sixth: "border-br-p700 bg-transparent text-text-inverse",
    seventh: "border-br-p400 bg-br-p200 text-text-inverse",
    eighth: "border-br-t500 bg-bg-w text-text-inverse hover:shadow-[0_0_10px_var(--color-br-t400)]/40",
    ninth: "border-bd-g200 bg-bg-w/40 backdrop-blur-md text-text-inverse",
    tenth: "border-bd-g100 bg-bg-w shadow-md text-text-inverse",
    eleventh: "border-br-p500 bg-br-p300 text-text-inverse",
    twelfth: "border-bd-g300 bg-transparent text-text-inverse",
    thirteenth: "border-br-t600 bg-bg-w text-text-inverse",
    fourteenth: "border-bd-g700 bg-bg-s900 text-text-primary",
    fifteenth: "border-bd-w/30 bg-transparent text-text-primary hover:shadow-[0_0_12px_var(--color-br-t400)]/50",
    sixteenth: "border-br-t500 bg-bg-g950 text-text-primary hover:shadow-[0_0_15px_var(--color-br-t500)]/60",
    seventeenth: "border-bd-w/20 bg-bg-w/10 backdrop-blur-md text-text-primary",
    eighteenth: "border-br-t600 bg-transparent text-br-t400",
    nineteenth: "border-bd-p300 bg-bg-p100 text-text-inverse",
    twentieth: "border-bd-g700 bg-bg-g900 text-text-primary",
    twentyFirst: "border-bd-s600 bg-gradient-to-br from-bg-g950 to-bg-s800 text-text-primary",
    twentySecond: "border-transparent bg-bg-g900 text-text-primary shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5)]",
    twentyThird: "border-br-t500/50 bg-bg-g950 text-text-primary",
};

export default function FileInput({
    value = [], // estado exterbo (files)
    onChange,
    multiple = false,
    accept = "image/*,application/pdf",
    variant,
})  {
    const inputRef = useRef(); //input oculto
    const [isLoading, setIsLoading] = useState(false) // loader
    const [dragIndex, setDragIndex] = useState(null) // indice drag

    const isImage = (file) => file.type.startsWith("image/"); // discriminador MIME

    // Genera e Solo para imagenes (evita crear URLs innecesarias)
    const previews = useMemo(
        () => 
            value.map((file) => (isImage(file) ? URL.createObjectURL(file): null)),
        [value],
    );

    // Limpieza de Object url (prevencion memory leak
    useEffect(() => {
        return () => {
            previews.forEach((url) => {
                if(url) URL.revokeObjectURL(url);
            });
        };
    }, [previews])

    // Normaliza Filelist, simula async y limita a 12
    const handleFiles = async (files) => {
        setIsLoading(true);

        const list = Array.from(files);
        await new Promise((r) => setTimeout(r,500));

        const data = multiple ? [...value, ...list] : [list[0]];
        onChange(data.slice(0, 12));

        setIsLoading(false)
    };

    // Eliminacion inmutable

    const remove = (i) => {
        const copy = [...value];
        copy.splice(i,1);
        onChange(copy);
    };

    // Reordenamiento por drag y drop

    const reorder = (from, to) => {
        const copy = [...value];
        const [m] = copy.splice(from, 1);
        copy.splice(to,0,m)
        onChange(copy);
    };

    return(
        <div className="flex items-center gap-2">
            {value.map((file, i) => (
                <div 
                    key={i} 
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop = {() => reorder(dragIndex, i)}
                    className="relative w-24 h-24 border rounded overflow-hidden group"
                >

                    {/** Render condicional: imagen vs archivo generico */}
                    {isImage(file) ? (
                        <img src={previews[i]} className="w-full h-full object-cover"/>
                    ) : (
                        <div
                            className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-[10px] px-1"
                        >
                            <span className="font-semibold">PDF</span>
                            <span className="truncate w-full text-center">{file.name}</span>
                        </div>
                    )}

                    {/** Acciones hover: reorder visual + eliminar */}
                    <div className="absolute top-1 rigth-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100">
                        <button className="w-7 h-7 bg-white rounded-full text-black text-xs">
                            ↕
                        </button>
                        <button
                            onClick={() => remove(i)}
                            className="w-7 h-7 bg-white rounded-full text-black text-xs"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}

            {/** Trigger de input oculto + loader */}
            <div onClick={() => !isLoading && inputRef.current.click()}
                className={`
                    w-120 h-120 border-2 border-dashed rounded flex items-center justify-center cursor-pointer
                    transition-all duration-300
                    ${variant ? dropZoneVariants[variant] : ""}
                `}>
                
                {isLoading ? (
                    <InfinityLoader
                        size="55"
                        stroke = "4"
                        strokeLength="0.15"
                        bgOpacity = "0.1"
                        speed = "1.3"
                        color = "black"
                    />
                ) : (
                    <span className="text-bg-white text-sm"> Seleccionar </span>
                )}
            </div>

            {/** Input descoplado de UI*/}

            <input 
                ref={inputRef}
                type="file"
                hidden
                multiple={multiple}
                accept={accept}
                onChange={(e) => handleFiles(e.target.files)}
            />

        </div>
    )

}