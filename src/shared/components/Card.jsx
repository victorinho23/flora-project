const variants = {
    default: "dark:bg-neutral-950/70 text-text-inverse",
    sec: "bg-white/10 border border-white/20 text-white",
    tertiary: "bg-white text-neutral-900 shadow-md",
    coffe: "bg-bg-s400 text-bg-w border border-bd-s700/80",
    
};

const Card = ({ product, variant = "default" }) => {

    const { title, image, price, description } = product;

    return (
        <div className={`
            w-80
            h-90
            backdrop-blur-[2px]
            shadow-lg
            rounded-2xl
            overflow-hidden
            hover:shadow-black
            transition-shadow
            duration-700
            bg-gradient-to-br from-bg-s600 to-br-s300
            
            ${variants[variant]}
        `}>

            <img 
                src={image} 
                alt={title} 
                className="w-full h-48 object-contain" 
            />

            <div className="p-5 space-y-3">

                <h2 className="text-xl font-semibold">
                    {title}
                </h2>

                <p className="text-sm"> 
                    {description}
                </p>

                <p className="text-lg font-bold text-">
                    {/** Esto agrega separadores de miles, lo que mejora la lectura tolocalString() */}
                    ${price.toLocaleString()}
                </p>

            </div>
        </div>
    );
};

export default Card;