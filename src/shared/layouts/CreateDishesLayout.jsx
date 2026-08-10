import { CreateDishsForm} from "@/features/products";
import dishesBg from "@/assets/images/fondo-dish.png";

export default function CreateDishesLayout() {
    return (
        <div
            className="min-h-screen w-full"
            style={{
                backgroundImage: `url(${dishesBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <CreateDishsForm />
        </div>
    );
}