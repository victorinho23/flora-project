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
import OrdersLayout from "../shared/layouts/OrdersLayout";
import { CreateDishesLayout, DishDetailsLayout, EditDishLayout, OrderDetailsLayout, OrderEditLayout, SeeUsers, UserEditLayout } from "../shared";
import PermissionsLayout from "../shared/layouts/PermissionLayout";
import InventoryListPage from "../features/inventory/pages/InventoryListPage";
import { InventoryDetailPage, InventoryRegisterForm, InventoryUpdatePage } from "../features/inventory";
import SupplierRegisterForm from "../features/suppliers/components/SupplierRegisterForm";
import { SupplierUpdatePage } from "../features/suppliers";


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
        path: "/userList",
        element: <UserListPage/>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
     {
        path: "/listMenu",
        element: <MenuListPage/>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/orderList",
        element: <OrderListPage/>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/viewListMenu",
        element: <ViewMenuListPage/>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/suppliersCreate",
        element: <SupplierRegisterForm/>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/listSuppliers",
        element: <SuppliersListPage/>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/updateSuppliers",
        element: <SupplierUpdatePage/>,
        children: [

            {index: true,},

        ],
    },
    {
        path: "/viewListOrders",
        element: <ViewOrderListPage/>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/viewlistSuppliers",
        element: <ViewSuppliersListPage/>,
        children: [
 
            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},


        ],
    },
    {
        path: "/viewListUsers",
        element: <ViewUserListPage/>,
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
            // {path: "/createDishes/viewDish", element: <DishDetailsLayout/>},
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
    

    {
        path: "/createInventory",
        element: <InventoryRegisterForm/>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},

        ],
    },
    {
        path: "/listInventory",
        element: <InventoryListPage/>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},

        ],
    },
    {
        path: "/detailsInventory",
        element: <InventoryDetailPage/>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},

        ],
    },
    {
        path: "/updateInventory",
        element: <InventoryUpdatePage/>,
        children: [

            {index: true,},
            // {path: "/dashboard/auth", element: <h1>Hello2</h1>},

        ],
    },
    

    


]);

export default router;



