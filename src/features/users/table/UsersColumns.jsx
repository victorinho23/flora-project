// Componente reutilizable que muestra un switch para activar o desactivar estados
import { Switch } from "@/shared";

import Tablerowactions from "@/shared/components/Tablerowactions";

export const createUserColumns = ({ onView, onEdit, onDelete } = {}) => [

  // Columna ID
  {
    accessorKey: "id",
    header: "Id",
  },

  // Columna Nombre
  {
    accessorKey: "username",
    header: "Nombre",
  },

  // Columna Email
  {
    accessorKey: "useremail",
    header: "Email",
  },

  // Columna Telefono
  {
    accessorKey: "userphone",
    header: "Telefono",
  },

  // Columna Estado (activo / inactivo)
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ row }) => {
      const user = row.original;

      const handleChange = (value) => {
        console.log("Actualizar estado usuario:", user.id, value);
      };

      return <Switch checked={user.is_active} onChange={handleChange} />;
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

export const UserColumns = createUserColumns();