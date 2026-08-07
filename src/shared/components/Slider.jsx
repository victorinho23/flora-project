import { useState, useEffect } from "react";
import {Card} from "@/shared"

export default function Slider({ products, interval = 3000 }) {
    const [position, setPosition] = useState(0);

    useEffect(() => {
        const time = setInterval(() => {
            setPosition((prev) => (prev + 1) % products.length);
        }, interval);

        return () => clearInterval(time);
        // Aqui lo que se hace es decir que el cambio se de las veces del tamaño de products y se dice que el tiempo sea de 3000 que es el valor que asigne arriba
    }, [products.length, interval]);

    return (
        <div className="overflow-hidden w-full max-w-7xl mx-auto">
            <div
                className="flex duration-700 ease-in-out"
                style={{ transform: `translateX(-${position * 100}%)` }}
            >
                {products.map((product) => (
                    <div key={product.id} className="min-w-full flex justify-center">
                        <Card product={product} variant="coffe" />
                    </div>
                ))}
            </div>

        </div>
    );
}
