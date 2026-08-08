// Hook para manejo de estado local en componentes funcionales
import { useState } from "react";

// Configuracion de campos disponibles para el reporte
import { inventoryReportFields } from "../config/inventoryReportFields";

// Caso de uso que orquesta la generacion del reporte
import { generateInventoryReport } from "../services/generateInventoryReport";

// Componentes UI reutilizables (design system)
import { Button, Input, Select, Checkbox } from "@/shared";

// Componente modal para configuracion de reportes de inventario
// Mismo patron que ReportConfigModal (modulo de usuarios)
export default function InventoryReportModal({ isOpen, onClose }) {

    // Estado del formato de salida
    const [format, setFormat] = useState("pdf");

    // Estado del alcance del reporte
    const [scope, setScope] = useState("all");

    // Estado del filtro (establecimiento o producto, segun el alcance)
    const [filterValue, setFilterValue] = useState("");

    // Estado de campos seleccionados (inicializacion lazy)
    const [selectedFields, setSelectedFields] = useState(() =>
        inventoryReportFields.filter((f) => f.default) // Solo campos marcados por defecto
    );

    // Control de render: si el modal no esta abierto, no se monta en el DOM
    if (!isOpen) return null;

    // Handler para activar/desactivar campos del reporte
    const handleFieldToggle = (field) => {

        // Verifica si el campo ya esta seleccionado
        const exists = selectedFields.find((f) => f.key === field.key);

        if (exists) {
            // Elimina el campo si ya existe
            setSelectedFields(selectedFields.filter((f) => f.key !== field.key));
        } else {
            // Agrega el campo si no existe
            setSelectedFields([...selectedFields, field]);
        }
    };

    // Handler principal para generar el reporte
    const handleGenerateReport = () => {
        // Invoca el caso de uso con la configuracion actual
        generateInventoryReport({
            format,
            selectedFields,
            scope,
            filterValue,
        });

        // Cierra el modal despues de generar el reporte
        onClose();
    };

    return (
        // Overlay del modal
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-black)]/40">

            {/** Contenedor del modal */}
            <div className="w-full max-w-lg rounded-xl bg-background-beige p-6 shadow-lg">

                {/** Titulo */}
                <h2 className="mb-6 text-xl font-semibold text-text-coffe">
                    Generar reporte de inventario
                </h2>

                {/** Seleccion de formato */}
                <div className="mb-4">
                    <Select
                        variant="s"
                        label="Formato del reporte"
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        options={[
                            { label: "PDF", value: "pdf" },
                            { label: "Excel", value: "excel" },
                        ]}
                    />
                </div>

                {/** Seleccion de campos */}
                <div className="mb-4">
                    <p className="mb-2 font-medium text-text-coffe">Campos del reporte</p>

                    {/** Grid de checkboxes */}
                    <div className="grid grid-cols-2 gap-2">
                        {inventoryReportFields.map((field) => {

                            // Determina si el campo esta seleccionado
                            const checked = selectedFields.some((f) => f.key === field.key);

                            return (
                                <Checkbox
                                    variant="tertiary"
                                    key={field.key}   // Key unica para renderizado
                                    id={field.key}    // Id accesible
                                    name={field.key}  // Nombre del campo
                                    label={field.label} // Texto visible
                                    checked={checked}   // Estado controlado
                                    onChange={() => handleFieldToggle(field)} // Toggle
                                />
                            );
                        })}
                    </div>
                </div>

                {/** Seleccion de alcance */}
                <div className="mb-4">
                    <Select
                        variant="s"
                        label="Alcance del reporte"
                        value={scope}
                        onChange={(e) => {
                            setScope(e.target.value);
                            setFilterValue(""); // Limpia el filtro al cambiar de alcance
                        }}
                        options={[
                            { label: "Todo el inventario", value: "all" },
                            { label: "Filtrar por establecimiento", value: "establecimiento" },
                            { label: "Filtrar por producto", value: "producto" },
                        ]}
                    />
                </div>

                {/** Campo condicional para filtro de establecimiento */}
                {scope === "establecimiento" && (
                    <div className="mb-4">
                        <Input
                            label="Establecimiento"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            placeholder="Ej. Sucursal Centro"
                        />
                    </div>
                )}

                {/** Campo condicional para filtro de producto */}
                {scope === "producto" && (
                    <div className="mb-4">
                        <Input
                            label="Producto"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            placeholder="Ej. Arroz"
                        />
                    </div>
                )}

                {/** Acciones del modal */}
                <div className="flex justify-end gap-2 mt-6">

                    {/** Boton cancelar */}
                    <Button variant="primary" onClick={onClose}>
                        Cancelar
                    </Button>

                    {/** Boton generar reporte */}
                    <Button variant="primary" onClick={handleGenerateReport}>
                        Generar reporte
                    </Button>
                </div>
            </div>
        </div>
    );
}
