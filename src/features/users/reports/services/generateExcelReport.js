// Libreria para la manipulacion y generacion de archivos Excel

import * as XLSX from "xlsx"

// Funcio utilitaritaria para generar un archivo Excel a partir de datos tabulares
// Patrón: exportacion de datos (dataset -> archivo descargable)

export function generateExcelReport({
    headers,  // Array de encabezados de (columas)
    rows,     // Array de filas (array de arrays)
    fileName = "reporte.xlsx", // Nombre del archivo de salida
    sheetName = "Datos",
    meta = {},
}) {

    // Estrcutura final de la hoja:
    // Primera fila = headers
    // Siguientes filas = datos
    const worksheetData = [
        [meta.company ?? "Flora"],
        [meta.title ?? sheetName],
        ["Generado por", meta.user ?? ""],
        ["Fecha y hora", meta.generatedAt ?? ""],
        [],
        headers, 
        ...rows
    ];

    // Convierte un array de arrays (AOA = Array d¿of arrays) en una hoja de Excel
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Crea un nuevo libro de excel (workbook)
    const workbook = XLSX.utils.book_new();

    // Agrega la hoja el libro con el nombre correspondiente al modulo
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Genera y descarga el archivo Excel en el cliente
    XLSX.writeFile(workbook, fileName);
}