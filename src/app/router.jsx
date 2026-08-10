import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, UsersCreateLayout} from "@/shared";
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
        path: "/userCreate",
        element: <UsersCreateLayout/>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},
            {path: "userList", element: <UserListPage/>},
            // {path: "userModify", element: <UserModify/>},

        ],
    },
    {
        path: "/viewUser",
        element: <SeeUsers/>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},
            // {path: "viewUsers", element: <SeeUsers/>},
            // {path: "userModify", element: <UserModify/>},

        ],
    },
    {
        path: "/userEdit",
        element: <UserEditLayout/>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/createDishes",
        element: <CreateDishesLayout/>,
        children: [

            {index: true,},
            {path: "/createDishes/viewDish", element: <DishDetailsLayout/>},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
    {
        path: "/viewDish",
        element: <DishDetailsLayout/>,
        children: [

            {index: true,},
            // {path: "/createDishes/viewDish", element: <DishDetailsLayout/>},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
    {
        path: "/dishEdit/:id",
        element: <EditDishLayout/>,
        children: [

            {index: true,},
            // {path: "/createDishes/viewDish", element: <DishDetailsLayout/>},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
    {
        path: "/createOrders",
        element: <OrdersLayout/>,
        children: [

            {index: true,},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
    {
        path: "/orderView/:id",
        element: <OrderDetailsLayout/>,
        children: [

            {index: true,},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
       {
        path: "orderEdit/:id",
        element: <OrderEditLayout/>,
        children: [

            {index: true,},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
        {
        path: "/permissions",
        element: <PermissionsLayout/>,
        children: [

            {index: true,},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
    

    // {
    //     path: "/createInventory",
    //     element: <UsersCreateLayout/>,
    //     children: [

    //         {index: true,},
    //         // {path: "/dashboard/auth", element: <h1>Hello2</h1>},

    //     ],
    // },

    


]);

export default router;



