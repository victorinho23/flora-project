import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout} from "@/shared";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/auth" replace />
    },
    {
        path: "/auth",
        element: <AuthLayout/>,
        children: [
            {
                index: true,

            },

        ],
    },
    {
        path: "/dashboard",
        element: <DashboardLayout/>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},
            // {path: "/dashboard/userList", element: <h1>Hello3</h1>},

        ],
    },

]);

export default router;



