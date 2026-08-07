import { useState, useEffect } from "react";
import { Card } from "@/shared";

function getItemsPerView() {
    const width = window.innerWidth;
    if (width >= 1024) return 4; // desktop (lg)
    if (width >= 640) return 2;  // tablet (sm)
    return 1;                     // celular
}

export default function Slider({ products, interval = 3000 }) {
    const [position, setPosition] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

    useEffect(() => {
        function handleResize() {
            setItemsPerView(getItemsPerView());
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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