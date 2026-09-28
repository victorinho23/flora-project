// Componente reutilizable que muestra un switch para activar o desactivar estados
import { Switch } from "@/shared";

import Tablerowactions from "@/shared/components/Tablerowactions";

export const createMenuColumns = ({ onView, onEdit, onDelete } = {}) => [

  // Columna ID
  {
    accessorKey: "id",
    header: "Id",
  },

  // Columna Nombre
  {
    accessorKey: "name",
    header: "Nombre",
  },

  // Columna Descripcion
  {
    accessorKey: "description",
    header: "Descripción",
  },

  // Columna Categoria
  {
    accessorKey: "category",
    header: "Categoría",
  },

  // Columna Precio
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => `$${(row.original.price ?? 0).toLocaleString("es-CO")}`,
  },

  // Columna Estado (activo / inactivo)
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ row }) => {
      const dish = row.original;

      const handleChange = (value) => {
        console.log("Actualizar estado del platillo:", dish.id, value);
      };

      return <Switch checked={dish.is_active} onChange={handleChange} />;
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

export const ColumnsMenu = createMenuColumns();