
import { Eye, Pencil } from "lucide-react";

// src/shared/components/Tablerowactions.jsx
// Botones de acciones de cada fila de la tabla (ver y editar)
const baseBtn = `
    p-2 rounded-md transition-colors duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-t200
`;

// Solo se muestran los botones que reciben su funcion
export default function TableRowActions({ onView, onEdit }) {
    return (
        <div className="flex items-center gap-1">

            {onView && (
                <button
                    type="button"
                    onClick={onView}
                    title="Ver detalle"
                    aria-label="Ver detalle"
                    className={`${baseBtn} text-bg-w hover:text-br-t200 hover:bg-bg-w/10`}
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
                    className={`${baseBtn} text-bg-w hover:text-br-t200 hover:bg-bg-w/10`}
                >
                    <Pencil size={16} />
                </button>
            )}

        </div>
    );
}