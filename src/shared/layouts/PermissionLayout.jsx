import { PermissionsForm } from "../../features/products";
import authBg from "@/assets/images/cafe.png";

export default function PermissionsLayout() {
    return (
        <div
            className="min-h-screen w-full flex justify-center items-center"
            style={{
                backgroundImage: `url(${authBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <PermissionsForm />
        </div>
    );
}