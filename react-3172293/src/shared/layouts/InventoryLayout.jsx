import { Outlet } from "react-router-dom";
import cafeBg from "@/assets/images/cafe.png"; 

export default function InventoryLayout() {
    return (
        <div 
            className="min-h-screen w-full flex items-center justify-center"
            style={{
                backgroundImage: `url(${cafeBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <main className="w-full">
                <Outlet />
            </main>
        </div>
    );
}
