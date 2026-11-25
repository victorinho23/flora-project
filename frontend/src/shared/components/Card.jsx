import imagenPorDefecto from "@/assets/images/menu.png";

const variants = {
    coffe: "bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950 text-bg-w",
};

const Card = ({ product, variant = "coffe" }) => {

    const { title, image, price, description } = product;

    return (
        <div className={`
            w-full
            max-w-80
            min-h-90
            backdrop-blur-[2px]
            shadow-m3-2
            rounded-m3-lg
            overflow-hidden
            hover:shadow-m3-4
            transition-shadow
            duration-300
            ease-m3-standard
            
            ${variants[variant]}
        `}>

            <img 
                src={image} 
                alt={title} 
                // si la foto no carga se muestra la imagen general del menu en vez del icono roto
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = imagenPorDefecto; }}
                className="w-full h-48 object-cover" 
            />

            <div className="p-5 space-y-3">

                <h3 className="text-m3-title-large font-semibold">
                    {title}
                </h3>

                <p className="text-m3-body-medium text-br-p100 line-clamp-3"> 
                    {description}
                </p>

                <p className="text-lg font-bold text-br-t100">
                    {/** Esto agrega separadores de miles, lo que mejora la lectura tolocalString() */}
                    ${price.toLocaleString("es-CO")}
                </p>

            </div>
        </div>
    );
};

export default Card;