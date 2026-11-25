import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, UsersCreateLayout} from "@/shared";
import UserListPage from "../features/users/pages/UserListPage";
import HomePage from "../features/home/components/pages/HomePage";
import SuppliersListPage from "@/features/suppliers/pages/SuppliersListPage";
import MenuListPage from "@/features/products/pages/MenuListPage"
import OrderListPage from "@/features/orders/pages/OrderListPage"
import ViewMenuListPage from "@/features/products/pages/ViewMenuListPage";
import CategoriesPage from "@/features/products/pages/CategoriesPage";
import ViewOrderListPage from "@/features/orders/pages/ViewOrderListPage";
import ViewUserListPage from "../features/users/pages/ViewUserListPage";
import OrdersLayout from "../shared/layouts/OrdersLayout";
import { EditDishLayout, OrderEditLayout, SeeUsers, UserEditLayout } from "../shared";
import PermissionsLayout from "../shared/layouts/PermissionLayout";
import InventoryListPage from "../features/inventory/pages/InventoryListPage";
import { InventoryRegisterForm, InventoryUpdatePage } from "../features/inventory";
import SupplierRegisterForm from "../features/suppliers/components/SupplierRegisterForm";
import { SupplierUpdatePage } from "../features/suppliers";
import ProtectedRoute from "../shared/components/auth/ProtectedRoute";
import TablesSettingsPage from "../features/settings/pages/TablesSettingsPage";


// Rutas de Flora: cada modulo tiene listado, crear, ver y editar
// el boton de volver de cada pagina lleva a su "padre" (editar -> ver -> listado -> inicio)
// permission = permiso que se necesita para entrar a la pagina (el admin los tiene todos)
const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/auth" replace />
    },

    {
        path: "/auth",
        element: <AuthLayout/>,
    },
    {
        path: "/home",
        element: <ProtectedRoute><HomePage/></ProtectedRoute>,
    },
   {
        path: "/userCreate",
        element: <ProtectedRoute permission="usuarios_crear"><UsersCreateLayout/></ProtectedRoute>,
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
    },
    {
        path: "/userEdit",
        element: <ProtectedRoute permission="usuarios_actualizar"><UserEditLayout/></ProtectedRoute>,
    },
    {
        path: "/userList",
        element: <ProtectedRoute permission="usuarios_listar"><UserListPage/></ProtectedRoute>,
    },
     {
        path: "/listMenu",
        element: <ProtectedRoute permission="menu_listar"><MenuListPage/></ProtectedRoute>,
    },
    {
        path: "/categories",
        element: <ProtectedRoute permission="menu_listar"><CategoriesPage/></ProtectedRoute>,
    },
    {
        path: "/settings",
        element: <ProtectedRoute permission="mesas_listar"><TablesSettingsPage/></ProtectedRoute>,
    },
    {
        path: "/orderList",
        element: <ProtectedRoute permission="ordenes_listar"><OrderListPage/></ProtectedRoute>,
    },
    {
        path: "/viewListMenu",
        element: <ProtectedRoute permission="menu_listar"><ViewMenuListPage/></ProtectedRoute>,
    },
    {
        path: "/suppliersCreate",
        element: <ProtectedRoute permission="proveedores_registrar"><SupplierRegisterForm/></ProtectedRoute>,
    },
    {
        path: "/listSuppliers",
        element: <ProtectedRoute permission="proveedores_listar"><SuppliersListPage/></ProtectedRoute>,
    },
    {
        path: "/updateSuppliers",
        element: <ProtectedRoute permission="proveedores_actualizar"><SupplierUpdatePage/></ProtectedRoute>,
    },
    {
        path: "/viewListOrders",
        element: <ProtectedRoute permission="ordenes_listar"><ViewOrderListPage/></ProtectedRoute>,
    },
    {
        path: "/viewlistSuppliers",
        element: <ProtectedRoute permission="proveedores_listar"><SuppliersListPage/></ProtectedRoute>,
    },
    {
        path: "/viewListUsers",
        element: <ProtectedRoute permission="usuarios_listar"><ViewUserListPage/></ProtectedRoute>,
    },
    {
        path: "/dishEdit/:id",
        element: <ProtectedRoute permission="menu_actualizar"><EditDishLayout/></ProtectedRoute>,
    },
    {
        path: "/createOrders",
        element: <ProtectedRoute permission="ordenes_crear"><OrdersLayout/></ProtectedRoute>,
    },
       {
        path: "/orderEdit/:id",
        element: <ProtectedRoute permission="ordenes_actualizar"><OrderEditLayout/></ProtectedRoute>,
    },
        {
        path: "/permissions",
        element: <ProtectedRoute permission="permisos_gestionar"><PermissionsLayout/></ProtectedRoute>,
    },
    

    {
        path: "/createInventory",
        element: <ProtectedRoute permission="inventario_crear"><InventoryRegisterForm/></ProtectedRoute>,
    },
    {
        path: "/editSupplier",
        element: <ProtectedRoute permission="proveedores_actualizar"><SupplierRegisterForm/></ProtectedRoute>,
    },
    {
        path: "/editInventory",
        element: <ProtectedRoute permission="inventario_actualizar"><InventoryRegisterForm/></ProtectedRoute>,
    },
    {
        path: "/listInventory",
        element: <ProtectedRoute permission="inventario_listar"><InventoryListPage/></ProtectedRoute>,
    },
    {
        path: "/updateInventory",
        element: <ProtectedRoute permission="inventario_actualizar"><InventoryUpdatePage/></ProtectedRoute>,
    },
    

    


]);

export default router;



