import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, UsersCreateLayout} from "@/shared";
import UserListPage from "../features/users/pages/UserListPage";
import HomePage from "../features/home/components/pages/HomePage";
import SeeUsers from "../shared/layouts/SeeUsers";
import { CreateDishesLayout, DishDetailsLayout, UserEditLayout } from "../shared";
import EditDishLayout from "../shared/layouts/EditDishLayout";



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
        path: "/createInventory",
        element: <UsersCreateLayout/>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},

        ],
    },

    


]);

export default router;



