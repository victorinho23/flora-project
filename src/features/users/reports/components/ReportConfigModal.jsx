// Hook para manejo de estado local en componentes funcionales
import {useState, useEffect} from "react";

// Iconos para el encabezado y el cierre del modal
import { FileText, X } from "lucide-react";

// Caso de uso genérico que orquesta la generacion del reporte
import { generateReport } from "../services/generateReport";

// Componentes UI reutilizables (design system)
import { Button, Input, Select } from "@/shared";
import { Checkbox } from "@/shared";

// ================== MODAL GENÉRICO DE REPORTES ==================
// Antes este modal estaba fijo a usuarios (título, campos y datos de
// usuarios sin importar desde qué página se abriera) -- por eso "Reportar
// orden" terminaba descargando un reporte de usuarios. Ahora cada página
// le pasa su propia configuración:
//
//   title          -> encabezado del modal, ej. "Generar reporte de órdenes"
//   data           -> array de registros del módulo (orders, menu, etc.)
//   fields         -> config de campos [{key, label, default}]
//   fileNamePrefix -> prefijo del archivo descargado, ej. "orders-report"
//   reportTitle    -> título impreso dentro del PDF
//   sheetName      -> nombre de la pestaña del Excel
//   filterField / filterLabel -> (opcional) habilita "Filtrar por..." usando
//                                 esa propiedad del registro
export default function ReportConfigModal ({
    isOpen,
    onClose,
    title = "Generar reporte",
    data = [],
    fields = [],
    fileNamePrefix = "reporte",
    reportTitle = "Reporte",
    sheetName = "Datos",
    filterField,
    filterLabel = "Filtrar",
}){

    // Estado del formato de salida
    const [format, setFormat] = useState("pdf")

    // Estado del alcance del reporte

    const [scope, setScope] = useState("all")

    // Estado para filtro (documento, id, nombre, etc. según el módulo)
    const [filterValue, setFilterValue] = useState("");

    // Estado de campos seleccionados (inicializacion de lazy)
    const [selectedFields, setSelectedFields] = useState(() => fields.filter((f) => f.default) // Solo campos marcados por defecto
    );

    // Si cambia el módulo (fields) mientras el modal existe, se refresca
    // la selección por defecto para no arrastrar campos de otro módulo.
    useEffect(() => {
        setSelectedFields(fields.filter((f) => f.default));
        setScope("all");
        setFilterValue("");
    }, [fields]);
    
    // Control de render: si el modal no esta abierto, no se monta en el DOM
    if (!isOpen) return null;

    // Hndler para activar/ desactivar campos del reporte
    const handleFieldToggle = (field) => {

        // Verifica si el campo ya esta seleccionado
        const exists = selectedFields.find((f) => f.key === field.key);

        if (exists){
            // Elimina el campo si ya existe
            setSelectedFields(
                selectedFields.filter((f) => f.key !== field.key)
            );
        }else {
            // Agrega el campo si no existe
            setSelectedFields([
                ...selectedFields,
                field
            ]);

        }
    };

    // Handler principal para generar el reporte
    const handleGenerateReport = () => {
        // Invoca el caso de uso genérico con los datos de ESTE módulo
        generateReport({
            format,
            data,
            selectedFields,
            scope,
            filterField,
            filterValue,
            fileNamePrefix,
            reportTitle,
            sheetName,
        });

        // Cierra el modal despies de generar el reporte
        onClose();
    };

    return (
        // Overlay del modal
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            
            {/** Contenedor del modal
                FIX: bg-background-beige -> bg-bg-p50. La cadena de
                --color-background-beige tenia un typo entre global.css y
                semantic.css (semanmtic vs semantic) y nunca resolvia a un
                color real -- el panel del modal quedaba TRANSPARENTE, por eso
                el texto de la tabla de atras se veia "montado" encima de los
                labels del modal (Formato del reporte, Alcance del reporte).
                bg-bg-p50 es el token corto, sin ese typo en su cadena, mismo
                color final (primary-50, crema) pero garantizado a funcionar.

                Ahora ademas: borde + sombra fuerte para que el modal se
                despegue claramente de lo que hay detrás, y max-h + scroll
                para que no se corte en pantallas chicas. */}
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-bg-p50 border border-bd-p300 shadow-2xl">

                {/** Encabezado: icono + título + botón de cerrar, con
                    separador para distinguirlo del cuerpo del formulario. */}
                <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-bd-p300">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-bg-p800 text-br-p50">
                            <FileText size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-text-coffe">
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="p-1.5 rounded-md text-br-s600 hover:bg-bg-p200 hover:text-br-s900 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/** Cuerpo del formulario */}
                <div className="px-6 py-5 space-y-5">

                    {/** Seleccion de formato */}
                    <Select 
                        variant="tenth"
                        fullWidth
                        label="Formato del reporte"
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        options={[
                            {label: "PDF", value: "pdf"},
                            {label: "Excel", value: "excel"},
                        ]}
                    />

                    {/** Seleccion de campos */}
                    <div>
                        <p className="mb-2 text-sm font-medium text-text-coffe">Campos del reporte</p>
                        
                        {/** Grid de checkboxes estilo "chip": borde propio y
                            fondo que cambia al marcarse, para que se note
                            claramente cuáles están seleccionados. */}
                        <div className="grid grid-cols-2 gap-2">
                            {fields.map((field) => {

                                // Determina si el campo esta seleccionado
                                const checked = selectedFields.some(
                                    (f) => f.key === field.key
                                );

                                return(
                                    <Checkbox
                                      variant="tertiary"
                                      key={field.key}  // Key unica para renderizado
                                      id={field.key}   // Id accesible
                                      name={field.key} // Nombre del campo
                                      label={field.label} // Texto visible
                                      checked={checked}   // Estado controlado
                                      onChange={() => handleFieldToggle(field)} // Toggle
                                      className={`
                                        px-3 py-2 rounded-lg border transition-colors
                                        ${checked
                                            ? "bg-bg-p200 border-bd-p400"
                                            : "bg-bg-w border-bd-p200 hover:bg-bg-p100"}
                                      `}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/** Seleccion de alcance (el filtro solo se muestra si el
                        módulo define filterField, ej. usuarios por documento) */}
                    <Select
                        variant="tenth"
                        fullWidth
                        label="Alcance del reporte"
                        value={scope}
                        onChange={(e) => setScope(e.target.value)}
                        options={[
                            {label: "Todos los registros", value: "all"},
                            ...(filterField ? [{label: filterLabel, value: "filter"}] : []),
                        ]}
                    />

                    {/** Campo condicional para el filtro */}
                    {scope === "filter" && filterField && (
                        <Input
                            variant="fifth"
                            fullWidth
                            label={filterLabel}
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            placeholder="Ingrese el valor a filtrar"
                        />
                    )}
                </div>

                {/** Acciones del modal, con jerarquía clara entre las dos
                    opciones (antes ambos botones eran "primary" iguales) */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-bd-p300 bg-bg-p100/60 rounded-b-2xl">
                    {/** Boton cancelar: accion secundaria, menos énfasis */}
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>

                    {/** Boton generar reportes: accion principal */}
                    <Button variant="primary" onClick={handleGenerateReport}>
                        Generar reporte
                    </Button>

                </div>
            </div>
        </div>
    
    );
}