// Componente que contiene los botones de acciones (editar y eliminar) para cada registro
import InventoryRowActions from "../components/InventoryRowActions";


// Definición de las columnas de la tabla de inventario
// Este arreglo suele usarse en librerías de tablas como TanStack Table
export const InventoryColumns = [

  // Columna ID
  {
    accessorKey: "id",
    header: "Id",
  },

  // Columna Marca
  {
    accessorKey: "marca",
    header: "Marca",
  },

  // Columna Nombre del producto
  {
    accessorKey: "nombre",
    header: "Nombre del producto",
  },

  // Columna Codigo de barras
  {
    accessorKey: "codigoBarras",
    header: "Codigo de barras",
  },

  // Columna Imagen
  {
    accessorKey: "imagen",
    header: "Imagen",
    cell: ({ row }) =>
      row.original.imagen ? (
        <img
          src={row.original.imagen}
          alt={row.original.nombre}
          className="w-10 h-10 object-cover rounded"
        />
      ) : (
        <span className="text-xs text-gray-400">Sin imagen</span>
      ),
  },

  // Columna Cantidad
  {
    accessorKey: "cantidad",
    header: "Cantidad",
  },

  // Columna Cantidad total
  {
    accessorKey: "cantidadTotal",
    header: "Cantidad total",
  },

  // Columna Valor unitario
  {
    accessorKey: "valorUnitario",
    header: "Valor unitario",
    cell: ({ row }) =>
      (row.original.valorUnitario ?? 0).toLocaleString("es-CO"),
  },

  // Columna Valor total
  {
    accessorKey: "valorTotal",
    header: "Valor total",
    cell: ({ row }) =>
      (row.original.valorTotal ?? 0).toLocaleString("es-CO"),
  },

  // Columna Estado
  {
    accessorKey: "estado",
    header: "Estado",
  },

  // Columna Fecha de vencimiento
  {
    accessorKey: "fechaVencimiento",
    header: "Fecha de vencimiento",
  },

  // Columna Descripcion
  {
    accessorKey: "descripcion",
    header: "Descripcion",
  },

  // Columna de acciones (editar / eliminar)
  {
    id: "actions",
    cell: ({ row }) => <InventoryRowActions item={row.original} />,
  },
];
