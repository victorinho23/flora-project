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
            shadow-lg
            rounded-2xl
            overflow-hidden
            hover:shadow-black
            transition-shadow
            duration-700
            
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

                <p className="text-lg font-bold text-br-t100">
                    {/** Esto agrega separadores de miles, lo que mejora la lectura tolocalString() */}
                    ${price.toLocaleString()}
                </p>

            </div>
        </div>
    );
};

export default Card;