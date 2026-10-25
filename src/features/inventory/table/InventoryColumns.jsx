import Tablerowactions from "@/shared/components/Tablerowactions";
import { Select } from "@/shared";
import { showConfirmAlert, showSuccesAlert } from "@/shared/services/alertService";

export const createInventoryColumns = ({ onView, onEdit, onStatusChange } = {}) => [

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
        <span className="text-sm text-br-p100">Sin imagen</span>
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
    cell: ({ row }) => {
      const item = row.original;
      if (!onStatusChange) return item.status;

      // Cambia el estado del producto pidiendo confirmacion antes
      const handleChange = async (e) => {
        const next = e.target.value;
        const result = await showConfirmAlert({
          title: `¿Cambiar el estado de ${item.name}?`,
          text: `Pasará de "${item.status}" a "${next}".${next !== "Disponible" ? " Un producto que no está disponible no podrá venderse." : ""}`,
          confirmButtonText: "Cambiar estado",
        });
        if (!result.isConfirmed) return;
        onStatusChange(item, next);
        await showSuccesAlert({
          title: "Estado actualizado",
          text: `Estado del producto cambiado de "${item.status}" al estado "${next}".`,
          timer: 2500,
        });
      };

      return (
        <Select
          variant="cafe"
          size="md"
          placeholder={false}
          htmlFor={`inventory-status-${item.id}`}
          value={item.status}
          onChange={handleChange}
          options={inventoryStatuses.map((status) => ({ value: status, label: status }))}
        />
      );
    },
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
      <Tablerowactions
        onView={onView && (() => onView(row.original))}
        onEdit={onEdit && (() => onEdit(row.original))}
      />
    ),
  },
].filter((column) => column.id !== "actions" || onView || onEdit);

export const InventoryColumns = createInventoryColumns();

// Estados posibles de un producto ligado al lote
export const inventoryStatuses = ["Disponible", "Vencido", "Avería", "Agotado"];

// Filtros de la tabla de inventario: estado y marca
export const inventoryFilters = (items) => [
  {
    column: "status",
    label: "Todos los estados",
    options: inventoryStatuses.map((status) => ({ value: status, label: status })),
  },
  {
    column: "brand",
    label: "Todas las marcas",
    options: [...new Set(items.map((item) => item.brand))].sort().map((brand) => ({ value: brand, label: brand })),
  },
];

// Orden por defecto: alfabetico por nombre
export const inventoryInitialSort = [{ id: "name", desc: false }];
