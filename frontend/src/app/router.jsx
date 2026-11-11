import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, UsersCreateLayout} from "@/shared";
import UserListPage from "../features/users/pages/UserListPage";
import HomePage from "../features/home/components/pages/HomePage";
import SuppliersListPage from "../features/users/pages/SuppliersListPage";
import MenuListPage from "../features/users/pages/MenuListPage"
import OrderListPage from "../features/users/pages/OrderListPage"
import ViewMenuListPage from "../features/users/pages/ViewMenuListPage";
import ViewOrderListPage from "../features/users/pages/ViewOrderListPage";
import ViewUserListPage from "../features/users/pages/ViewUserListPage";
import OrdersLayout from "../shared/layouts/OrdersLayout";
import { CreateDishesLayout, DishDetailsLayout, EditDishLayout, OrderDetailsLayout, OrderEditLayout, SeeUsers, UserEditLayout } from "../shared";
import PermissionsLayout from "../shared/layouts/PermissionLayout";
import InventoryListPage from "../features/inventory/pages/InventoryListPage";
import { InventoryDetailPage, InventoryRegisterForm, InventoryUpdatePage } from "../features/inventory";
import SupplierRegisterForm from "../features/suppliers/components/SupplierRegisterForm";
import { SupplierUpdatePage } from "../features/suppliers";
import ProtectedRoute from "../shared/components/auth/ProtectedRoute";


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
        element: <ProtectedRoute><HomePage/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},
            // {path: "userList", element: <UserListPage/>},
            // {path: "userCreate", element: <UserRegisterForm/>},

        ],
    },
   {
        path: "/userCreate",
        element: <ProtectedRoute><UsersCreateLayout/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},
            {path: "userList", element: <UserListPage/>},
            // {path: "userModify", element: <UserModify/>},

        ],
    },
    {
        path: "/viewUser",
        element: <ProtectedRoute><SeeUsers/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},
            // {path: "viewUsers", element: <SeeUsers/>},
            // {path: "userModify", element: <UserModify/>},

        ],
    },
    {
        path: "/userEdit",
        element: <ProtectedRoute><UserEditLayout/></ProtectedRoute>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/userList",
        element: <ProtectedRoute><UserListPage/></ProtectedRoute>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
     {
        path: "/listMenu",
        element: <ProtectedRoute><MenuListPage/></ProtectedRoute>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/orderList",
        element: <ProtectedRoute><OrderListPage/></ProtectedRoute>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/viewListMenu",
        element: <ProtectedRoute><ViewMenuListPage/></ProtectedRoute>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/suppliersCreate",
        element: <ProtectedRoute><SupplierRegisterForm/></ProtectedRoute>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/listSuppliers",
        element: <ProtectedRoute><SuppliersListPage/></ProtectedRoute>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/updateSuppliers",
        element: <ProtectedRoute><SupplierUpdatePage/></ProtectedRoute>,
        children: [

            {index: true,},

        ],
    },
    {
        path: "/viewListOrders",
        element: <ProtectedRoute><ViewOrderListPage/></ProtectedRoute>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/viewlistSuppliers",
        element: <ProtectedRoute><SuppliersListPage/></ProtectedRoute>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/viewListUsers",
        element: <ProtectedRoute><ViewUserListPage/></ProtectedRoute>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/createDishes",
        element: <ProtectedRoute><CreateDishesLayout/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/createDishes/viewDish", element: <DishDetailsLayout/>},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
    {
        path: "/viewDish",
        element: <ProtectedRoute><DishDetailsLayout/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/createDishes/viewDish", element: <DishDetailsLayout/>},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
    {
        path: "/dishEdit/:id",
        element: <ProtectedRoute><EditDishLayout/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/createDishes/viewDish", element: <DishDetailsLayout/>},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
    {
        path: "/createOrders",
        element: <ProtectedRoute><OrdersLayout/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
    {
        path: "/orderView/:id",
        element: <ProtectedRoute><OrderDetailsLayout/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
       {
        path: "orderEdit/:id",
        element: <ProtectedRoute><OrderEditLayout/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
        {
        path: "/permissions",
        element: <ProtectedRoute><PermissionsLayout/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/createDishes/editDish", element: <DishDetailsLayout/>},


        ],
    },
    

    {
        path: "/createInventory",
        element: <ProtectedRoute><InventoryRegisterForm/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},

        ],
    },
    {
        path: "/editSupplier",
        element: <ProtectedRoute><SupplierRegisterForm/></ProtectedRoute>,
    },
    {
        path: "/editInventory",
        element: <ProtectedRoute><InventoryRegisterForm/></ProtectedRoute>,
    },
    {
        path: "/listInventory",
        element: <ProtectedRoute><InventoryListPage/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},

        ],
    },
    {
        path: "/detailsInventory",
        element: <ProtectedRoute><InventoryDetailPage/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},

        ],
    },
    {
        path: "/updateInventory",
        element: <ProtectedRoute><InventoryUpdatePage/></ProtectedRoute>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},

        ],
    },
    

    


]);

export default router;



