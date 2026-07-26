import laptop from "@/assets/images/card-laptop.png";
import monitor from "@/assets/images/card-monitor.png";
import mouse from "@/assets/images/card-mouse.png";
import teclado from "@/assets/images/card-teclado.png";

export const products = [
    {
        id:1,
        title: "Laptop Profesional",
        price: 3500000,
        description: "Laptop de alto rendimiento para desarrollo y diseño.",
        image: laptop,
        category: "perifericos"
    },

     {
        id:2,
        title: "Monitor 27 Pulgadas",
        price: 1200000,
        description: "Monitor IPS ideal para progrmacion y edicion.",
        image: monitor,
        category: "perifericos"
    },

     {
        id:3,
        title: "Mouse",
        price: 80000,
        description: "Mouse ergonómico, la mejor calidad y precio.",
        image: mouse,
        category: "perifericos"
    },

     {
        id:4,
        title: "Teclado Gamer",
        price: 50000,
        description: "Teclado mecánico con iluminacion RGB.",
        image: teclado,
        category: "perifericos"
    }
]