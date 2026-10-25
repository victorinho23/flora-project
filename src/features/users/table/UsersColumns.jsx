import { showConfirmAlert, showSuccesAlert } from "@/shared/services/alertService";
// Componente reutilizable que muestra un switch para activar o desactivar estados
import { Switch } from "@/shared";

import Tablerowactions from "@/shared/components/Tablerowactions";

const userTypeLabels = {
  ADMIN: "Administrador",
  MESERO: "Mesero",
  COCINERO: "Cocinero",
};

export const createUserColumns = ({ onView, onEdit, onStatusChange } = {}) => [

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

  {
    accessorKey: "usertype",
    header: "Tipo de usuario",
    filterFn: (row, id, value) => row.getValue(id) === value,
    cell: ({ row }) => userTypeLabels[row.original.usertype] ?? row.original.usertype,
  },

  {
    id: "document",
    accessorFn: (user) => `${user.document_type} ${user.document_number}`,
    header: "Documento",
  },

  // Columna Estado (activo / inactivo)
  {
    accessorKey: "is_active",
    header: "Estado",
    cell: ({ row }) => {
      const user = row.original;

      const handleChange = async (value) => {
        const result = await showConfirmAlert({
          title: `¿Deseas ${value ? "habilitar" : "inhabilitar"} la cuenta de ${user.username}?`,
          text: "El cambio no elimina ninguna información.",
          confirmButtonText: value ? "Habilitar" : "Inhabilitar",
          reasonLabel: !value && user.usertype === "ADMIN" ? "Motivo de inactivación (obligatorio para administradores)" : undefined,
        });
        if (!result.isConfirmed) return false;
        onStatusChange?.(user, value);
        await showSuccesAlert({
          title: "Estado actualizado",
          text: "Cuenta actualizada exitosamente",
          timer: 2500,
        });
        return true;
      };

      return <Switch checked={user.is_active} onChange={handleChange} />;
    },
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

export const UserColumns = createUserColumns();

// Filtros de la tabla de usuarios: rol y estado
export const userFilters = [
  {
    column: "usertype",
    label: "Todos los roles",
    options: Object.entries(userTypeLabels).map(([value, label]) => ({ value, label })),
  },
  {
    column: "is_active",
    label: "Todos los estados",
    options: [
      { value: "true", label: "Activos" },
      { value: "false", label: "Inactivos" },
    ],
  },
];

// Orden por defecto: alfabetico por nombre
export const userInitialSort = [{ id: "username", desc: false }];
