
import { Eye, Pencil, Trash2 } from "lucide-react";

const baseBtn = `
    p-2 rounded-md transition-colors duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-br-t300
`;

export default function TableRowActions({ onView, onEdit, onDelete }) {
    return (
        <div className="flex items-center gap-1">

            {onView && (
                <button
                    type="button"
                    onClick={onView}
                    title="Ver detalle"
                    aria-label="Ver detalle"
                    className={`${baseBtn} text-br-t100 hover:text-br-t300 hover:bg-bg-w/10`}
                >
                    <Eye size={17} />
                </button>
            )}

            {onEdit && (
                <button
                    type="button"
                    onClick={onEdit}
                    title="Editar"
                    aria-label="Editar"
                    className={`${baseBtn} text-br-t100 hover:text-br-t300 hover:bg-bg-w/10`}
                >
                    <Pencil size={16} />
                </button>
            )}

            {onDelete && (
                <button
                    type="button"
                    onClick={onDelete}
                    title="Eliminar"
                    aria-label="Eliminar"
                    className={`${baseBtn} text-br-t100 hover:text-red-400 hover:bg-red-500/10`}
                >
                    <Trash2 size={16} />
                </button>
            )}

        </div>
    );
}