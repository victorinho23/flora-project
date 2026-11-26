// src/shared/components/ImageInput.jsx
// Input controlado exclusivo para imagenes: la foto se ve adentro de la zona, se puede arrastrar y se limpia la memoria

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

    // tambien se puede soltar la foto arrastrandola encima de la zona
    const [dragOver, setDragOver] = useState(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files?.length && !isLoading) handleFiles(e.dataTransfer.files);
    };

    // la foto elegida se ve adentro de la misma zona (antes salia al lado)
    const hasImage = value.length > 0;

    return(
        <div className="w-fit self-center mx-auto flex items-center justify-center gap-2">
            <div
                role="button"
                tabIndex={0}
                aria-label={hasImage ? "Cambiar la imagen" : "Cargar imagen"}
                onClick={() => !isLoading && inputRef.current.click()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !isLoading && inputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`
                    group relative overflow-hidden
                    w-120 h-120 xl:w-[min(30rem,calc(100dvh-19rem))] xl:h-[min(30rem,calc(100dvh-19rem))] flex-shrink-0 border-2 border-dashed rounded
                    flex items-center justify-center cursor-pointer
                    transition-all duration-300
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus
                    ${variant ? dropZoneVariants[variant] : ""}
                    ${hasImage ? "border-solid" : ""}
                    ${dragOver ? "ring-2 ring-m3-focus" : ""}
                `}>

                {/* foto elegida: llena la zona; al pasar el mouse salen las opciones de cambiar o quitar */}
                {hasImage && !isLoading && (
                    <>
                        <img src={previews[0]} alt="Imagen elegida" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-end justify-center gap-2 p-3 bg-linear-to-t from-bg-s950/70 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                            <span className="h-10 px-4 inline-flex items-center rounded-m3-full bg-bg-w text-br-s950 text-m3-label-large font-semibold">
                                Cambiar
                            </span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); remove(0); }}
                                className="m3-state relative h-10 px-4 rounded-m3-full bg-m3-error text-m3-on-error text-m3-label-large font-semibold"
                            >
                                Quitar
                            </button>
                        </div>
                    </>
                )}

                {isLoading ? (
                    <InfinityLoader
                        size="55"
                        stroke="4"
                        strokeLength="0.15"
                        bgOpacity="0.1"
                        speed="1.3"
                        color="black"
                    />
                ) : !hasImage && (
                    <span className="text-sm text-center px-4"> <span>Cargar imagen <br /></span>Formato permitido solo: {formats.join(", ")} · máx. {maxSizeMB} MB</span>
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