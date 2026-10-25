// Utilidad para transformar datos en dataset de reporte
import { buildReportDataset } from "../utils/buildReportDataset";

// Servicios de exportacion
import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";

// Patrón: Application Service (coordina utilidades y servicios)
export function generateReport({
    format,             // "excel" | "pdf"
    data,               // Array de registros del modulo (orders, menu, suppliers, users...)
    selectedFields,     // Campos seleccionados por el usuario
    scope,              // Alcance del reporte: "all" | "filter"
    filterField,        // Propiedad usada para filtrar (si scope === "filter")
    filterValue,        // Valor ingresado para filtrar
    fileNamePrefix = "reporte",
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
        return false; // Corte de ejecución
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const meta = {
        company: "Flora · Cafetería y pizzería",
        title: reportTitle,
        user: "Administrador",
        generatedAt: now.toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" }),
    };

    // Seleccion de estrategia de exportacion segun formato
    if (format === "excel") {
        generateExcelReport({
            headers,
            rows,
            fileName: `${fileNamePrefix}-${timestamp}.xlsx`,
            sheetName,
            meta,
        });
    }

    if (format === "pdf") {
        generatePdfReport({
            headers,
            rows,
            fileName: `${fileNamePrefix}-${timestamp}.pdf`,
            reportTitle,
            meta,
        });
    }

    return true;
}
