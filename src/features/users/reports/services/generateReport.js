// Utilidad para transformar datos en dataset de reporte
import { buildReportDataset } from "../utils/buildReportDataset";

// Servicios de exportacion
import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";

// Caso de uso: orquestador GENERICO de generacion de reportes.
// A diferencia de generateUserReport (fijo a usuarios), este sirve para
// cualquier modulo: ordenes, menu, proveedores, usuarios, etc.
// Patrón: Application Service (coordina utilidades y servicios)
export function generateReport({
    format,             // "excel" | "pdf"
    data,               // Array de registros del modulo (orders, menu, suppliers, users...)
    selectedFields,     // Campos seleccionados por el usuario
    scope,              // Alcance del reporte: "all" | "filter"
    filterField,        // Propiedad usada para filtrar (si scope === "filter")
    filterValue,        // Valor ingresado para filtrar
    fileNamePrefix = "reporte", // Prefijo del nombre de archivo (a juego con el modulo)
    reportTitle = "Reporte",    // Titulo mostrado dentro del PDF
    sheetName = "Datos",        // Nombre de la pestaña del Excel
}) {

    // Construccion del dataset (desacoplado de la UI)
    const { headers, rows } = buildReportDataset({
        data,
        selectedFields,
        scope,
        filterField,
        filterValue,
    });

    // Validacion: evita generar archivos vacios
    if (!rows.length) {
        alert("No hay datos para generar reporte");
        return; // Corte de ejecución
    }

    // Generacion de timestamp para nombre unico de archivo (YYYY-MM-DD)
    const timestamp = new Date().toDateString().slice(0, 10);

    // Seleccion de estrategia de exportacion segun formato
    if (format === "excel") {
        generateExcelReport({
            headers,
            rows,
            fileName: `${fileNamePrefix}-${timestamp}.xlsx`,
            sheetName,
        });
    }

    if (format === "pdf") {
        generatePdfReport({
            headers,
            rows,
            fileName: `${fileNamePrefix}-${timestamp}.pdf`,
            reportTitle,
        });
    }
}
