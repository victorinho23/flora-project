// Componente reutilizable que muestra un switch para activar o desactivar estados
import { Switch } from "@/shared";

// Componente que contiene los botones de acciones (editar y eliminar) para cada proveedor
import SupplierRowActions from "../components/SupplierRowActions";


// Definición de las columnas de la tabla de proveedores
// Este arreglo suele usarse en librerías de tablas como TanStack Table
export const SupplierColumns = [

  // Columna ID
  {
    accessorKey: "id",
    header: "Id",
  },

  // Columna Empresa
  {
    accessorKey: "companyName",
    header: "Empresa",
  },

  // Columna NIT
  {
    accessorKey: "nit",
    header: "NIT",
  },

  // Columna Contacto
  {
    accessorKey: "contactName",
    header: "Contacto",
  },

  // Columna Telefono
  {
    accessorKey: "phone",
    header: "Telefono",
  },

  // Columna Email
  {
    accessorKey: "email",
    header: "Email",
  },

  // Columna Categoria
  {
    accessorKey: "category",
    header: "Categoria",
  },

  // Columna Estado (activo / inactivo)
  {
    accessorKey: "isActive",
    header: "Estado",

    // Render personalizado de la celda
    cell: ({ row }) => {

      // Se obtiene el objeto completo del proveedor de la fila
      const supplier = row.original;

      // Función que se ejecuta cuando cambia el switch
      const handleChange = (value) => {

        // value representa el nuevo estado del switch (true o false)
        console.log("Actualizar estado proveedor:", supplier.id, value);

        // Aquí normalmente se llamaría una API para actualizar el estado
        // updateSupplierStatus(supplier.id, value)
      };

      return (
        // Componente reutilizable para mostrar el switch
        <Switch
          checked={supplier.isActive}
          onChange={handleChange}
        />
      );
    },
  },

  // Columna de acciones (editar / eliminar)
  {
    id: "actions",
    cell: ({ row }) => <SupplierRowActions supplier={row.original} />,
  },
];
