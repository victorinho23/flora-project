import CreateOrderForm from "@/features/orders/components/CreateOrderForm";
import authBg from "@/assets/images/fondo-orders.png";


export default function OrdersLayout() {
    return (
        <div className="min-h-screen w-full"
        style={{
                    backgroundImage: `url(${authBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
        >
            <CreateOrderForm />
        </div>
    );
}