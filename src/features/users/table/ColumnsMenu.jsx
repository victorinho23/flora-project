import { showConfirmAlert, showSuccesAlert, showErrorAlert } from "@/shared/services/alertService";
import { orders } from "../data/orders";
// Componente reutilizable que muestra un switch para activar o desactivar estados
import { Switch } from "@/shared";

import Tablerowactions from "@/shared/components/Tablerowactions";

export const createMenuColumns = ({ onView, onEdit, onStatusChange } = {}) => [

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

  {
    accessorKey: "image",
    header: "Imagen",
    enableGlobalFilter: false,
    cell: ({ row }) =>
      row.original.image ? (
        <img
          src={row.original.image}
          alt={row.original.name}
          className="w-12 h-12 object-cover rounded-lg"
        />
      ) : (
        <span className="text-sm text-br-p100">Sin imagen</span>
      ),
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

      const handleChange = async (value) => {
        // No se puede inhabilitar un platillo que esta en una orden en proceso
        const inUse = orders.some((order) => order.product === dish.name && (order.status === "ACTIVA" || order.status === "LISTA_PARA_ENTREGA"));
        if (!value && inUse) {
          await showErrorAlert({
            title: "No se puede inhabilitar",
            text: `${dish.name} está en una orden en proceso. Inhabilítalo cuando la orden se pague o se cancele.`,
            confirmButtonText: "Entendido",
            timer: 4000,
          });
          return false;
        }
        const result = await showConfirmAlert({
          title: `¿Deseas ${value ? "habilitar" : "inhabilitar"} el platillo ${dish.name}?`,
          text: "El cambio no elimina ninguna información.",
          confirmButtonText: value ? "Habilitar" : "Inhabilitar",
        });
        if (!result.isConfirmed) return false;
        onStatusChange?.(dish, value);
        await showSuccesAlert({
          title: "Estado actualizado",
          text: `El platillo ha sido ${value ? "habilitado" : "inhabilitado"} correctamente.`,
          timer: 2500,
        });
        return true;
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
      />
    ),
  },
].filter((column) => column.id !== "actions" || onView || onEdit);

export const ColumnsMenu = createMenuColumns();
// Filtros de la tabla del menu: categoria y estado
export const menuFilters = (dishes) => [
  {
    column: "category",
    label: "Todas las categorías",
    options: [...new Set(dishes.map((dish) => dish.category))].sort().map((category) => ({ value: category, label: category })),
  },
  {
    column: "is_active",
    label: "Todos los estados",
    options: [
      { value: "true", label: "Habilitados" },
      { value: "false", label: "Inhabilitados" },
    ],
  },
];

// Orden por defecto: alfabetico por nombre
export const menuInitialSort = [{ id: "name", desc: false }];
