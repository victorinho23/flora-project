import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout, UsersCreateLayout} from "@/shared";
import UserListPage from "../features/users/pages/UserListPage";
import HomePage from "../features/home/components/pages/HomePage";
import SuppliersListPage from "../features/users/pages/SuppliersListPage";
import MenuListPage from "../features/users/pages/MenuListPage"
import OrderListPage from "../features/users/pages/OrderListPage"
import ViewMenuListPage from "../features/users/pages/ViewMenuListPage";
import ViewOrderListPage from "../features/users/pages/ViewOrderListPage";
import ViewSuppliersListPage from "../features/users/pages/ViewSuppliersListPage";
import ViewUserListPage from "../features/users/pages/ViewUserListPage";


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
            // {path: "userList", element: <UserListPage/>},
            

        ],
    },
    {
        path: "/userCreate",
        element: <UsersCreateLayout/>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},
            // {path: "userList", element: <UserListPage/>},

        ],
    },
        {
        path: "/userList",
        element: <UserListPage/>,
        
        children: [
            {
                index: true,

            },

        ],
    },
    {
        path: "/createInventory",
        element: <UsersCreateLayout/>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},
            {path: "userList", element: <UserListPage/>},

        ],
    },
    {
        path: "/home",
        element: <HomePage/>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},
            // {path: "userList", element: <UserListPage/>},
            // {path: "userCreate", element: <UserRegisterForm/>},

        ],
    },
    {
        path: "/viewusers",
        element: <ViewUserListPage/>,
        
        children: [
            {
                index: true,

            },

        ],
    },
    {
        path: "/suppliers",
        element: <SuppliersListPage/>,
        
        children: [
            {
                index: true,

            },

        ],
    },
    {
        path: "/menu",
        element: <MenuListPage/>,
        
        children: [
            {
                index: true,

            },

        ],
    },
    {
        path: "/order",
        element: <OrderListPage/>,
        
        children: [
            {
                index: true,

            },

        ],
    },
    {
        path: "/viewmenu",
        element: <ViewMenuListPage/>,
        
        children: [
            {
                index: true,

            },

        ],
    },
    {
        path: "/viewSuppliers",
        element: <ViewSuppliersListPage/>,
        
        children: [
            {
                index: true,

            },

        ],
    },
    {
        path: "/viewOrder",
        element: <ViewOrderListPage/>,
        
        children: [
            {
                index: true,

            },

        ],
    },

]);

export default router;



