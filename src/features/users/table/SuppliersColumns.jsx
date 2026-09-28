// Componente reutilizable que muestra un switch para activar o desactivar estados
import { Switch } from "@/shared";

import Tablerowactions from "@/shared/components/Tablerowactions";

export const createSupplierColumns = ({ onView, onEdit, onDelete } = {}) => [

  // Columna ID
  {
    accessorKey: "id",
    header: "Id",
  },

  // Columna Nombre
  {
    accessorKey: "providername",
    header: "Nombre",
  },

  // Columna Email
  {
    accessorKey: "provideremail",
    header: "Email",
  },

  // Columna Telefono
  {
    accessorKey: "providerphone",
    header: "Telefono",
  },

  // Columna Estado (activo / inactivo)
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ row }) => {
      const supplier = row.original;

      const handleChange = (value) => {
        console.log("Actualizar estado del proveedor:", supplier.id, value);
      };

      return <Switch checked={supplier.is_active} onChange={handleChange} />;
    },
  },

  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <Tablerowactions
        onView={onView && (() => onView(row.original))}
        onEdit={onEdit && (() => onEdit(row.original))}
        onDelete={onDelete && (() => onDelete(row.original))}
      />
    ),
  },
].filter((column) => column.id !== "actions" || onView || onEdit || onDelete);

export const SuppliersColumns = createSupplierColumns();