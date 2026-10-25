// src/shared/components/ImageInput.jsx
// Input controlado exclusivo para imagenes: preview, reorder y limpieza de memoria

import {useRef, useState, useEffect, useMemo}  from "react"
import {Infinity as InfinityLoader} from "ldrs/react"
import "ldrs/react/Infinity.css"
import { showErrorAlert } from "@/shared/services/alertService"

const dropZoneVariants = {
    latte: "border-bd-t800 bg-bg-t50 text-br-t950 font-semibold max-w-[calc(100vw-5rem)] max-h-[calc(100vw-5rem)] hover:bg-bg-t100",
};

export default function ImageInput({
    value = [],
    onChange,
    multiple = false,
    variant,
    formats = ["jpg", "jpeg", "png"],
    maxSizeMB = 2,
})  {
    const inputRef = useRef();
    const [isLoading, setIsLoading] = useState(false)
    const [dragIndex, setDragIndex] = useState(null)

    const previews = useMemo(
        () => 
            value.map((file) => URL.createObjectURL(file)),
        [value],
    );

    useEffect(() => {
        return () => {
            previews.forEach((url) => {
                if(url) URL.revokeObjectURL(url);
            });
        };
    }, [previews])

    const handleFiles = async (files) => {
        setIsLoading(true);

        const list = Array.from(files);
        // Revisa formato y tamano antes de aceptar la imagen
        const invalid = list.find((file) => !formats.includes(file.name.split(".").pop().toLowerCase()) || file.size > maxSizeMB * 1024 * 1024);
        if (invalid) {
            setIsLoading(false);
            await showErrorAlert({
                title: "Imagen no válida",
                text: `Solo se permiten archivos ${formats.join(", ")} de máximo ${maxSizeMB} MB.`,
                confirmButtonText: "Entendido",
                timer: 3500,
            });
            return;
        }
        await new Promise((r) => setTimeout(r,500));

        const data = multiple ? [...value, ...list] : [list[0]];
        onChange(data.slice(0, 1));

        setIsLoading(false)
    };

    const remove = (i) => {
        const copy = [...value];
        copy.splice(i,1);
        onChange(copy);
    };

    const reorder = (from, to) => {
        const copy = [...value];
        const [m] = copy.splice(from, 1);
        copy.splice(to,0,m)
        onChange(copy);
    };

    return(
        <div className="w-fit self-center mx-auto flex items-center justify-center gap-2">
            {value.map((file, i) => (
                <div 
                    key={i} 
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop = {() => reorder(dragIndex, i)}
                    className="relative w-24 h-24 border rounded overflow-hidden group flex-shrink-0"
                >
                    <img src={previews[i]} className="w-full h-full object-cover"/>

                    <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100">
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

            <div onClick={() => !isLoading && inputRef.current.click()}
                className={`
                    w-120 h-120 xl:w-[min(30rem,calc(100dvh-19rem))] xl:h-[min(30rem,calc(100dvh-19rem))] flex-shrink-0 border-2 border-dashed rounded
                    flex items-center justify-center cursor-pointer
                    transition-all duration-300
                    ${variant ? dropZoneVariants[variant] : ""}
                `}>
                
                {isLoading ? (
                    <InfinityLoader
                        size="55"
                        stroke="4"
                        strokeLength="0.15"
                        bgOpacity="0.1"
                        speed="1.3"
                        color="black"
                    />
                ) : (
                    <span className="text-sm text-center"> <span>Cargar imagen <br /></span>Formato permitido solo: {formats.join(", ")} · máx. {maxSizeMB} MB</span>
                    
                )}
            </div>

            <input 
                ref={inputRef}
                type="file"
                hidden
                multiple={multiple}
                accept={formats.map((format) => `.${format}`).join(",")}
                onChange={(e) => handleFiles(e.target.files)}
            />

        </div>
    )
}