import { createBrowserRouter } from "react-router-dom";

// Layouts
import DashboardLayout from "@/shared/layouts/DashboardLayout";
import InventoryLayout from "@/shared/layouts/InventoryLayout";

// Componentes
import { UserRegisterForm } from "@/features/users";
import InventoryRegisterForm from "@/features/inventory/components/InventoryRegisterForm";

const router = createBrowserRouter([
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "users", 
        element: <UserRegisterForm />
      }
    ]
  },
  {
    path: "/inventory",
    element: <InventoryLayout />,
    children: [
      {
        path: "", 
        element: <InventoryRegisterForm />
      }
    ]
  }
]);

export default router;