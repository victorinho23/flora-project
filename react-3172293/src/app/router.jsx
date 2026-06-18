import { createBrowserRouter } from "react-router-dom";


import DashboardLayout from "@/shared/layouts/DashboardLayout";
import InventoryLayout from "@/shared/layouts/InventoryLayout";
import { UserRegisterForm } from "@/features/users";
import InventoryRegisterForm from "@/features/inventory/components/InventoryRegisterForm";
import SupplierRegisterForm from "@/features/suppliers/components/SupplierRegisterForm"; 

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
  },
  
  {
    path: "/suppliers",
    element: <InventoryLayout />, 
    children: [
      {
        path: "", 
        element: <SupplierRegisterForm />
      }
    ]
  }
]);

export default router;