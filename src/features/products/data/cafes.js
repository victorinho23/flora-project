import coffe from "@/assets/images/cafe-miel.png";
import capuchino from "@/assets/images/capuchino.png";
import latte from "@/assets/images/latte.png";
import macchiato from "@/assets/images/macchiato.png";

export const cafes = [
    {
        id:1,
        title: "Café con miel",
        price: 12000,
        description: "Un café mas saludable, remplazamos el azucar por la miel.",
        image: coffe,
        category: "Bebidas"
    },

     {
        id:2,
        title: "Capuchino",
        price: 18000,
        description: "espuma cremosa con toque de cacao y aroma intenso..",
        image:  capuchino,
        category: "Bebidas"
    },

     {
        id:3,
        title: "Latte",
        price: 20000,
        description: " suave mezcla de café y leche con arte en la espuma.",
        image: latte,
        category: "Bebidas"
    },

     {
        id:4,
        title: "Macchiato",
        price: 18000,
        description: "espresso marcado con una nube ligera de leche.",
        image: macchiato,
        category: "Bebidas"
    }
]