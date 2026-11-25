//  Funcion utilitaria para constuir el dataset de un reporte (tabla)
// Patron: transformacion de datos (input -> output listo para exportar)

export function buildReportDataset({
    data,                // Registros que ya llegan filtrados desde el backend
    selectedFields,      // Campos seleccionados para el reporte [{key, label}]
}) {

    // Construccion de encabeados del reporte
    // Se toma el label de cada campo seleccionado
    const headers = selectedFields.map((field) => field.label)

    // Construccion de filas del reporte
    // Cada registro se transforma en un array de valores segun los campos seleccionados

    const rows = data.map((item) => selectedFields.map((field) => {
        const value = item[field.key] // Acceso dinamico a la propiedad
        if (field.format) return field.format(value, item);

        // Normalizacin: evita undefined o null en el reporte
        return value ?? "";
    }));

    // Estructura final desaclopada de UI
    // Lista para exportar a Excel, PDF o renderizar kla tabla

    return{
        headers,  // Array de Strings (columnas)
        rows      // Array de arrays (filas)
    };
}