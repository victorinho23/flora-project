// Hook para manejo de estado local en componentes funcionales
import {useState, useEffect} from "react";

// Iconos para el encabezado y el cierre del modal
import { FileText, X } from "lucide-react";

import { generateReport } from "../services/generateReport";
import { showErrorAlert, showSuccesAlert } from "@/shared/services/alertService";

// Componentes UI reutilizables (design system)
import { Button, Input, Select } from "@/shared";
import { Checkbox } from "@/shared";

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
    scopes,
    idKey = "id",
    filters = [],
    dateRange,
}){

    // Estado del formato de salida
    const [format, setFormat] = useState("pdf")

    // Estado del alcance del reporte

    const [scope, setScope] = useState("all")

    const [filterValue, setFilterValue] = useState("");

    const [range, setRange] = useState({ from: "", to: "" });

    const [picked, setPicked] = useState([]);

    const [pickSearch, setPickSearch] = useState("");

    const [error, setError] = useState("");

    // Valores de los filtros opcionales que se pueden combinar
    const [extra, setExtra] = useState({});

    // Estado de campos seleccionados (inicializacion de lazy)
    const [selectedFields, setSelectedFields] = useState(() => fields.filter((f) => f.default) // Solo campos marcados por defecto
    );

    useEffect(() => {
        setSelectedFields(fields.filter((f) => f.default));
        setScope("all");
        setFilterValue("");
        setRange({ from: "", to: "" });
        setPicked([]);
        setPickSearch("");
        setError("");
        setExtra({});
    }, [fields]);
    
    // Control de render: si el modal no esta abierto, no se monta en el DOM
    if (!isOpen) return null;

    const scopeOptions = scopes ?? [
        { value: "all", label: "Todos los registros" },
        ...(filterField ? [{ value: "filter", label: filterLabel, filter: (item, value) => String(item[filterField] ?? "") === String(value) }] : []),
    ];

    const activeScope = scopeOptions.find((option) => option.value === scope) ?? scopeOptions[0];

    const changeScope = (value) => {
        setScope(value);
        setFilterValue("");
        setRange({ from: "", to: "" });
        setPicked([]);
        setExtra({});
        setError("");
    };

    const togglePicked = (id) => {
        if (!activeScope.pick?.multiple) {
            setPicked([id]);
            return;
        }
        setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const pickableRecords = activeScope.pick
        ? data.filter((item) => activeScope.pick.label(item).toLowerCase().includes(pickSearch.toLowerCase()))
        : [];

    // Revisa si la fecha del registro esta dentro del rango elegido
    const inDateRange = (item, key) => {
        const time = new Date(item[key]).getTime();
        if (range.from && time < new Date(`${range.from}T00:00:00`).getTime()) return false;
        if (range.to && time > new Date(`${range.to}T23:59:59`).getTime()) return false;
        return true;
    };

    // Aplica los filtros opcionales y el rango de fechas sobre los registros
    const applyExtra = (records) => records
        .filter((item) => filters.every((filter) => !extra[filter.key] || filter.match(item, extra[filter.key])))
        .filter((item) => !dateRange || inDateRange(item, dateRange.key));

    const resolveRecords = () => applyExtra(resolveScope());

    // Registros segun el tipo de reporte elegido (todos, filtrados o seleccionados)
    const resolveScope = () => {
        if (activeScope.pick) return data.filter((item) => picked.includes(item[idKey]));
        if (activeScope.range) return data.filter((item) => inDateRange(item, activeScope.range));
        if (activeScope.param || activeScope.value === "filter") return data.filter((item) => activeScope.filter(item, filterValue));
        if (activeScope.filter) return data.filter((item) => activeScope.filter(item));
        return data;
    };

    const validate = () => {
        if (!selectedFields.length) return "Selecciona al menos un campo para el reporte.";
        if (activeScope.pick && picked.length < (activeScope.pick.min ?? 1)) {
            return (activeScope.pick.min ?? 1) > 1
                ? `Selecciona al menos ${activeScope.pick.min} registros.`
                : "Selecciona el registro que quieres incluir.";
        }
        if ((activeScope.param || activeScope.value === "filter") && !filterValue) return `Indica ${(activeScope.param?.label ?? filterLabel).toLowerCase()}.`;
        if (activeScope.range && !range.from && !range.to) return "Indica al menos una fecha del rango.";
        if (range.from && range.to && range.from > range.to) return "La fecha inicial debe ser anterior a la final.";
        return "";
    };

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
    const handleGenerateReport = async () => {
        const message = validate();
        if (message) {
            setError(message);
            return;
        }
        setError("");
        const generated = generateReport({
            format,
            data: resolveRecords(),
            selectedFields,
            scope: "all",
            fileNamePrefix,
            reportTitle,
            sheetName,
        });
        if (!generated) {
            await showErrorAlert({
                title: "Sin resultados",
                text: "No se encontraron resultados para los parámetros seleccionados.",
                confirmButtonText: "Entendido",
                timer: 3500,
            });
            return;
        }

        // Cierra el modal despies de generar el reporte
        onClose();
        await showSuccesAlert({
            title: "Reporte generado",
            text: "Reporte generado exitosamente",
            timer: 2500,
        });
    };

    return (
        // Overlay del modal
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-bg-w border border-bd-s100 shadow-2xl">

                <div className="flex items-center justify-between gap-4 px-6 py-5 bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-bg-w/10 ring-1 ring-bd-w/25 text-br-t100">
                            <FileText size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-bg-w">
                            {title}
                        </h2>
                    </div>

                    <Button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="p-1.5 rounded-md text-bg-w hover:bg-bg-w/15 transition-colors"
                    >
                        <X size={20} />
                    </Button>
                </div>

                {/** Cuerpo del formulario */}
                <div className="px-6 py-5 space-y-5">

                    {/** Seleccion de formato */}
                    <Select 
                        variant="latte"
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
                        <p className="mb-2 text-sm font-semibold text-br-s900">Campos del reporte</p>
                        
                        <div className="grid grid-cols-2 gap-2">
                            {fields.map((field) => {

                                // Determina si el campo esta seleccionado
                                const checked = selectedFields.some(
                                    (f) => f.key === field.key
                                );

                                return(
                                    <Checkbox
                                      variant="latte"
                                      key={field.key}  // Key unica para renderizado
                                      id={field.key}   // Id accesible
                                      name={field.key} // Nombre del campo
                                      label={field.label} // Texto visible
                                      checked={checked}   // Estado controlado
                                      onChange={() => handleFieldToggle(field)} // Toggle
                                      className={`
                                        px-3 py-2 rounded-lg border transition-colors
                                        ${checked
                                            ? "bg-bg-t50 border-bd-t900"
                                            : "bg-bg-w border-bd-s300 hover:bg-bg-s50"}
                                      `}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <Select
                        variant="latte"
                        fullWidth
                        label="Alcance del reporte"
                        htmlFor="report-scope"
                        value={scope}
                        onChange={(e) => changeScope(e.target.value)}
                        options={scopeOptions.map((option) => ({ label: option.label, value: option.value }))}
                    />

                    {/** Campo condicional para el filtro */}
                    {activeScope.value === "filter" && (
                        <Input
                            variant="latte"
                            fullWidth
                            label={filterLabel}
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            placeholder="Ingrese el valor a filtrar"
                        />
                    )}

                    {activeScope.param && (
                        <Select
                            variant="latte"
                            fullWidth
                            label={activeScope.param.label}
                            htmlFor="report-param"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            options={activeScope.param.options}
                        />
                    )}

                    {activeScope.range && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input variant="latte" fullWidth type="date" label="Desde" htmlFor="report-from" value={range.from} onChange={(e) => setRange((prev) => ({ ...prev, from: e.target.value }))} />
                            <Input variant="latte" fullWidth type="date" label="Hasta" htmlFor="report-to" value={range.to} onChange={(e) => setRange((prev) => ({ ...prev, to: e.target.value }))} />
                        </div>
                    )}

                    {activeScope.pick && (
                        <div className="space-y-2">
                            <Input
                                variant="latte"
                                fullWidth
                                label={activeScope.pick.multiple ? `Selecciona los registros${activeScope.pick.min > 1 ? ` (mínimo ${activeScope.pick.min})` : ""}` : "Selecciona un registro"}
                                htmlFor="report-pick-search"
                                value={pickSearch}
                                onChange={(e) => setPickSearch(e.target.value)}
                                placeholder="Buscar..."
                            />
                            <div className="max-h-48 overflow-y-auto rounded-lg border border-bd-s300 divide-y divide-bd-s100">
                                {pickableRecords.map((item) => (
                                    <Checkbox
                                        key={item[idKey]}
                                        id={`report-pick-${item[idKey]}`}
                                        name="report-pick"
                                        variant="latte"
                                        label={activeScope.pick.label(item)}
                                        checked={picked.includes(item[idKey])}
                                        onChange={() => togglePicked(item[idKey])}
                                        className="px-3 py-2 hover:bg-bg-t50"
                                    />
                                ))}
                                {!pickableRecords.length && <p className="px-3 py-2 text-sm text-br-s800">Sin coincidencias</p>}
                            </div>
                            {activeScope.pick.multiple && <p className="text-sm text-br-s800">{picked.length} seleccionados</p>}
                        </div>
                    )}

                    {/* Filtros opcionales del reporte */}
                    {!activeScope.pick && filters.map((filter) => (
                        <Select
                            key={filter.key}
                            variant="latte"
                            fullWidth
                            label={`${filter.label} (opcional)`}
                            htmlFor={`report-${filter.key}`}
                            value={extra[filter.key] ?? ""}
                            onChange={(e) => setExtra((prev) => ({ ...prev, [filter.key]: e.target.value }))}
                            options={filter.options}
                        />
                    ))}

                    {/* Rango de fechas opcional */}
                    {!activeScope.pick && dateRange && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input variant="latte" fullWidth type="date" label={`${dateRange.label} desde (opcional)`} htmlFor="report-from" value={range.from} onChange={(e) => setRange((prev) => ({ ...prev, from: e.target.value }))} />
                            <Input variant="latte" fullWidth type="date" label="Hasta (opcional)" htmlFor="report-to" value={range.to} onChange={(e) => setRange((prev) => ({ ...prev, to: e.target.value }))} />
                        </div>
                    )}

                    {error && (
                        <p className="text-sm inline-block px-2 py-0.5 rounded bg-red-50 text-red-900 font-medium">{error}</p>
                    )}
                </div>

                <div className="flex flex-wrap justify-center sm:justify-end gap-3 px-6 py-4 border-t border-bd-s100 bg-bg-s50 rounded-b-2xl">
                    <Button variant="crema" onClick={onClose}>
                        Cancelar
                    </Button>

                    <Button variant="espresso" onClick={handleGenerateReport}>
                        Generar reporte
                    </Button>

                </div>
            </div>
        </div>
    
    );
}