// src/features/inventory/pages/InventoryDetailPage.jsx

// Hooks de React Router: leer el parametro de la URL y navegar
import { useParams, useNavigate } from "react-router-dom";

// Componentes reutilizables del sistema de diseño
import { Button } from "@/shared";

// Icono para el boton de volver
import { ArrowLeft } from "lucide-react";

// Fuente de datos de inventario (mock o fuente centralizada)
import { inventory } from "../data/inventory";

// Componente que muestra el detalle de un unico registro de inventario
// Corresponde a la tarea "Visualizar inventario/Front"
export default function InventoryDetailPage() {

    // Obtiene el id del registro desde la URL (/inventory/:id)
    const { id } = useParams();

    // Hook para volver al listado
    const navigate = useNavigate();

    // Busca el registro correspondiente en la fuente de datos
    // Nota: los ids en la data son numericos, el parametro de ruta es string
    const item = inventory.find((record) => String(record.id) === id);

    // Definicion de los campos a mostrar (label + valor)
    // Centralizado aqui para que sea facil agregar/quitar campos
    const fields = item
        ? [
              { label: "Establecimiento", value: item.establecimiento },
              { label: "Fecha", value: item.fecha },
              { label: "Departamento", value: item.departamento },
              { label: "Empleado", value: item.empleado },
              { label: "Producto", value: item.nombre },
              { label: "Cantidad", value: item.cantidad },
          ]
        : [];

    return (
        <div className="p-6 max-w-2xl mx-auto">

            {/* Boton para volver al listado */}
            <Button variant="secondary" size="sm" onClick={() => navigate("/inventory/list")}>
                <ArrowLeft size={16} />
                Volver al listado
            </Button>

            <h1 className="text-xl font-semibold mt-4 mb-4 text-[var(--color-white)] drop-shadow">
                Detalle de inventario {item ? `#${item.id}` : ""}
            </h1>

            {/* Caso: registro no encontrado */}
            {!item ? (
                <div className="p-6 rounded-xl border bg-[var(--color-white)] shadow-sm">
                    <p className="text-sm text-[var(--color-gray-600)]">
                        No se encontró ningún registro de inventario con el id "{id}".
                    </p>
                </div>
            ) : (
                // Caso: registro encontrado, muestra ficha de detalle
                <div className="p-6 rounded-xl border bg-[var(--color-white)] shadow-sm">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fields.map((field) => (
                            <div key={field.label} className="flex flex-col gap-1">
                                <dt className="text-xs uppercase tracking-wide text-[var(--color-gray-500)]">
                                    {field.label}
                                </dt>
                                <dd className="text-sm font-medium text-[var(--color-gray-900)]">
                                    {field.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}
        </div>
    );
}
