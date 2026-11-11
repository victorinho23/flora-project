import { showConfirmAlert, showSuccesAlert, showErrorAlert } from "@/shared/services/alertService";
// Componente reutilizable que muestra un switch para activar o desactivar estados
import { Switch } from "@/shared";

import Tablerowactions from "@/shared/components/Tablerowactions";

export const createSupplierColumns = ({ onView, onEdit, onStatusChange } = {}) => [

  // Columna ID
  {
    accessorKey: "id",
    header: "Id",
  },

  // Columna Nombre
  {
    accessorKey: "companyName",
    header: "Nombre",
  },

  {
    id: "document",
    accessorFn: (supplier) => `${supplier.documentType} ${supplier.nit}`,
    header: "Documento",
  },

  // Columna Telefono
  {
    accessorKey: "phone",
    header: "Contacto",
  },

  {
    accessorKey: "products",
    header: "Productos",
    enableSorting: false,
    cell: ({ row }) => row.original.productList?.length
      ? row.original.productList.map((product) => product.name).sort((a, b) => a.localeCompare(b)).join(", ")
      : "Sin productos",
  },

  // Columna Estado (activo / inactivo)
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      const supplier = row.original;

      const handleChange = async (value) => {
        const result = await showConfirmAlert({
          title: `¿Deseas ${value ? "habilitar" : "inhabilitar"} el proveedor ${supplier.companyName}?`,
          text: "El cambio no elimina ninguna información.",
          confirmButtonText: value ? "Habilitar" : "Inhabilitar",
        });
        if (!result.isConfirmed) return false;
        // se guarda en el backend, si falla se avisa y el switch vuelve a como estaba
        try {
          await onStatusChange?.(supplier, value, result.value);
        } catch (error) {
          await showErrorAlert({
            title: "No se pudo actualizar",
            text: error.message,
            confirmButtonText: "Entendido",
            timer: 4000,
          });
          return false;
        }
        await showSuccesAlert({
          title: "Estado actualizado",
          text: `${supplier.companyName} ha sido ${value ? "habilitado" : "inhabilitado"} correctamente.`,
          timer: 2500,
        });
        return true;
      };

      return <Switch checked={supplier.isActive} onChange={handleChange} />;
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
// Filtros de la tabla de proveedores: productos y estado
// recibe los productos del inventario que llegan del backend
export const supplierFilters = (inventory) => [
  {
    column: "products",
    label: "Todos los productos",
    options: inventory.map((item) => ({ value: item.id, label: item.name })),
  },
  {
    column: "isActive",
    label: "Todos los estados",
    options: [
      { value: "true", label: "Habilitados" },
      { value: "false", label: "Inhabilitados" },
    ],
  },
];

// Orden por defecto: alfabetico por nombre
export const supplierInitialSort = [{ id: "companyName", desc: false }];
