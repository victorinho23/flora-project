import capuchino from "@/assets/images/capuchino.png";
import latte from "@/assets/images/latte.png";
import macchiato from "@/assets/images/macchiato.png";
import chispas from "@/assets/images/chispas.png";

// Datos de prueba del menu (platillos con categoria, precio, imagen y estado)
export const menu = [
    {
        id: 1,
        category: "Cafés",
        is_active: true,
        name: "Café Americano",
        description: "Café espresso con agua caliente.",
        price: 6000
    },
    {
        id: 2,
        category: "Bebidas",
        is_active: true,
        name: "Espresso",
        description: "Café espresso tradicional de sabor intenso.",
        price: 5000
    },
    {
        id: 3,
        category: "Postres",
        is_active: true,
        name: "Cappuccino",
        image: capuchino,
        description: "Espresso con leche vaporizada y espuma de leche.",
        price: 8500
    },
    {
        id: 4,
        category: "Platos fuertes",
        is_active: true,
        name: "Latte",
        image: latte,
        description: "Espresso con abundante leche vaporizada.",
        price: 9000
    },
    {
        id: 5,
        category: "Entradas",
        is_active: false,
        name: "Mocaccino",
        description: "Espresso con chocolate, leche y crema chantilly.",
        price: 11000
    },
    {
        id: 6,
        category: "Cafés",
        is_active: true,
        name: "Macchiato",
        image: macchiato,
        description: "Espresso con un toque de espuma de leche.",
        price: 8000
    },
    {
        id: 7,
        category: "Bebidas",
        is_active: true,
        name: "Chocolate Caliente",
        description: "Chocolate caliente preparado con leche.",
        price: 8000
    },
    {
        id: 8,
        category: "Postres",
        is_active: true,
        name: "Té Chai",
        description: "Infusión de té negro con especias y leche.",
        price: 9500
    },
    {
        id: 9,
        category: "Platos fuertes",
        is_active: true,
        name: "Té Verde",
        description: "Infusión de té verde natural.",
        price: 7000
    },
    {
        id: 10,
        category: "Entradas",
        is_active: false,
        name: "Limonada Natural",
        description: "Limonada preparada con limón fresco.",
        price: 7000
    },
    {
        id: 11,
        category: "Cafés",
        is_active: true,
        name: "Croissant de Mantequilla",
        description: "Croissant artesanal recién horneado.",
        price: 6500
    },
    {
        id: 12,
        category: "Bebidas",
        is_active: true,
        name: "Croissant de Jamón y Queso",
        description: "Croissant relleno de jamón y queso.",
        price: 12000
    },
    {
        id: 13,
        category: "Postres",
        is_active: true,
        name: "Muffin de Arándanos",
        description: "Muffin esponjoso con arándanos.",
        price: 7000
    },
    {
        id: 14,
        category: "Platos fuertes",
        is_active: true,
        name: "Brownie",
        description: "Brownie de chocolate con nueces.",
        price: 8000
    },
    {
        id: 15,
        category: "Entradas",
        is_active: false,
        name: "Cheesecake de Frutos Rojos",
        description: "Porción de cheesecake con frutos rojos.",
        price: 13000
    },
    {
        id: 16,
        category: "Cafés",
        is_active: true,
        name: "Torta de Zanahoria",
        description: "Porción de torta de zanahoria con queso crema.",
        price: 10000
    },
    {
        id: 17,
        category: "Bebidas",
        is_active: true,
        name: "Galleta con Chips de Chocolate",
        image: chispas,
        description: "Galleta artesanal con trozos de chocolate.",
        price: 5000
    },
    {
        id: 18,
        category: "Postres",
        is_active: true,
        name: "Sándwich de Pollo",
        description: "Pan artesanal con pollo, queso y vegetales.",
        price: 15000
    },
    {
        id: 19,
        category: "Platos fuertes",
        is_active: true,
        name: "Wrap de Pavo",
        description: "Tortilla de trigo con pavo, queso y vegetales.",
        price: 16000
    },
    {
        id: 20,
        category: "Entradas",
        is_active: false,
        name: "Bagel con Queso Crema",
        description: "Bagel tostado acompañado de queso crema.",
        price: 11000
    }
];

