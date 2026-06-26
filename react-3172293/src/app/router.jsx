import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout} from "@/shared";
import UserListPage from "../features/users/pages/UserListPage";


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
            {path: "userList", element: <UserListPage/>},
            

        ],
    },

]);

export default router;



