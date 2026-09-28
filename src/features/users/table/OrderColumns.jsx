import Tablerowactions from "@/shared/components/Tablerowactions";

// Etiquetas legibles para cada estado real de la orden (RFADMIN26)
const statusLabels = {
  ACTIVA: "Activa",
  LISTA_PARA_ENTREGA: "Lista para entrega",
  PAGADA: "Pagada",
  CANCELADA: "Cancelada",
};

export const createOrderColumns = ({ onView, onEdit, onDelete } = {}) => [

  // Columna ID
  {
    accessorKey: "id",
    header: "Id",
  },

  // Columna Mesa
  {
    accessorKey: "tableNumber",
    header: "Mesa",
  },

  // Columna Mesero
  {
    accessorKey: "waiter",
    header: "Mesero",
  },

  {
    accessorKey: "customer",
    header: "Nombre",
  },

  {
    accessorKey: "product",
    header: "Producto",
  },

  // Columna Cantidad
  {
    accessorKey: "quantity",
    header: "Cantidad",
  },

  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => `$${(row.original.total ?? 0).toLocaleString("es-CO")}`,
  },

  // Columna Estado (Activa, lista para entrega, pagada, cancelada)
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => statusLabels[row.original.status] ?? row.original.status,
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

export const OrderColumns = createOrderColumns();