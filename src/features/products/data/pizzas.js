import margarita from "@/assets/images/margarita.png";
import pepperoni from "@/assets/images/pepperoni.png";
import cuatro from "@/assets/images/cuatro.png";
import verduras from "@/assets/images/vegetariana.png";

export const pizzas = [
    {
        id:1,
        title: "Pizza Margarita",
        price: 25000,
        description: "Clásica con tomate, mozzarella y albahaca fresca.",
        image: margarita,
        category: "Comida"
    },

     {
        id:2,
        title: "Pizza Pepperoni",
        price: 28000,
        description:"queso fundido y rodajas de pepperoni...",
        image:  pepperoni,
        category: "Comida"
    },

     {
        id:3,
        title: "Pizza cuatro quesos",
        price: 30000,
        description: "mezcla cremosa de mozzarella, gorgonzola, parmesano y provolone.",
        image: cuatro,
        category: "Comida"
    },

     {
        id:4,
        title: "Pizza vegetariana",
        price: 27000,
        description: "verduras frescas, aceitunas y orégano..",
        image: verduras,
        category: "Comidas"
    }
]