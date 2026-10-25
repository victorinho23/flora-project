import Tablerowactions from "@/shared/components/Tablerowactions";

import { orderStatusLabels as statusLabels } from "../reports/config/orderReportFields";

export const createOrderColumns = ({ onView, onEdit } = {}) => [

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
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }),
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
      />
    ),
  },
].filter((column) => column.id !== "actions" || onView || onEdit);

export const OrderColumns = createOrderColumns();

// Filtros de la tabla de ordenes: mesa, estado y mesero
export const orderFilters = (orders) => [
  {
    column: "tableNumber",
    label: "Todas las mesas",
    options: [...new Set(orders.map((order) => order.tableNumber))].sort((a, b) => a - b).map((table) => ({ value: String(table), label: `Mesa ${table}` })),
  },
  {
    column: "status",
    label: "Todos los estados",
    options: Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
  },
  {
    column: "waiter",
    label: "Todos los meseros",
    options: [...new Set(orders.map((order) => order.waiter))].sort().map((waiter) => ({ value: waiter, label: waiter })),
  },
];

// Filtro por rango de fechas de la orden
export const orderDateFilter = { column: "createdAt", label: "Fecha" };

// Orden por defecto: de la mas reciente a la mas antigua
export const orderInitialSort = [{ id: "createdAt", desc: true }];
