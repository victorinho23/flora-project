//  Funcion utilitaria para constuir el dataset de un reporte (tabla)
// Patron: transformacion de datos (input -> output listo para exportar)
// Generica: sirve para usuarios, ordenes, menu, proveedores, etc.

export function buildReportDataset({
    data,                // Array de registros origen (cualquier modulo)
    selectedFields,      // Campos seleccionados para el reporte [{key, label}]
    scope,               // Alcance del reporte: "all" | "filter"
    filterField,         // Propiedad del registro usada para filtrar (si aplica)
    filterValue,         // Valor a filtrar (si aplica)
}) {

    // Copia inmutable del array original (evita mutaciones)
    let filteredData = [...data];

    // Filtro por alcance: si es por filtro especifico se aplica sobre filterField
    if (scope === "filter" && filterField && filterValue) {
        filteredData = filteredData.filter(
            (item) => String(item[filterField] ?? "") === String(filterValue)
        );
    }

    // Construccion de encabeados del reporte
    // Se toma el label de cada campo seleccionado
    const headers = selectedFields.map((field) => field.label)

    // Construccion de filas del reporte
    // Cada registro se transforma en un array de valores segun los campos seleccionados

    const rows = filteredData.map((item) => selectedFields.map((field) => {
        const value = item[field.key] // Acceso dinamico a la propiedad

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