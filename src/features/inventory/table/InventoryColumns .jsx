import TableRowActions from "@/shared/components/TableRowActions";

export const createInventoryColumns = ({ onView, onEdit } = {}) => [

  // Columna ID
  {
    accessorKey: "id",
    header: "Id",
  },

  // Columna Marca
  {
    accessorKey: "brand",
    header: "Marca",
  },

  // Columna Nombre del producto
  {
    accessorKey: "name",
    header: "Nombre del producto",
  },

  // Columna Codigo de barras
  {
    accessorKey: "barcode",
    header: "Codigo de barras",
  },

  // Columna Imagen
  {
    accessorKey: "image",
    header: "Imagen",
    cell: ({ row }) =>
      row.original.image ? (
        <img
          src={row.original.image}
          alt={row.original.name}
          className="w-10 h-10 object-cover rounded"
        />
      ) : (
        <span className="text-xs text-br-g400">Sin imagen</span>
      ),
  },

  // Columna Cantidad
  {
    accessorKey: "quantity",
    header: "Cantidad",
  },

  // Columna Cantidad total
  {
    accessorKey: "totalQuantity",
    header: "Cantidad total",
  },

  // Columna Valor unitario
  {
    accessorKey: "unitValue",
    header: "Valor unitario",
    cell: ({ row }) =>
      (row.original.unitValue ?? 0).toLocaleString("es-CO"),
  },

  // Columna Valor total
  {
    accessorKey: "totalValue",
    header: "Valor total",
    cell: ({ row }) =>
      (row.original.totalValue ?? 0).toLocaleString("es-CO"),
  },

  // Columna Estado
  {
    accessorKey: "status",
    header: "Estado",
  },

  // Columna Fecha de vencimiento
  {
    accessorKey: "expirationDate",
    header: "Fecha de vencimiento",
  },

  // Columna Descripcion
  {
    accessorKey: "description",
    header: "Descripcion",
  },

  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <TableRowActions
        onView={onView && (() => onView(row.original))}
        onEdit={onEdit && (() => onEdit(row.original))}
      />
    ),
  },
].filter((column) => column.id !== "actions" || onView || onEdit);

export const InventoryColumns = createInventoryColumns();