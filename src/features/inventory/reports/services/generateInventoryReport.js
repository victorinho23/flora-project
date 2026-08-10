// Fuente de datos de inventario (mock o fuente centralizada)
import { inventory } from "../../data/inventory";

// Utilidad para transformar datos en dataset de reporte
import { buildInventoryReportDataset } from "../utils/buildInventoryReportDataset";

// Servicios de exportacion (compartidos con el modulo de usuarios)
import { generateExcelReport } from "@/features/users/reports/services/generateExcelReport";
import { generatePdfReport } from "@/features/users/reports/services/generatePdfReport";

// Caso de uso: orquestador de generacion de reportes de inventario
// Patron: Application Service (coordina utilidades y servicios)
export function generateInventoryReport({
    format,          // "excel" | "pdf"
    selectedFields,  // Campos seleccionados por el usuario
    scope,           // Alcance del reporte
    filterValue,     // Filtro opcional (establecimiento o producto)
}) {

    // Construccion del dataset (desacoplado de la UI)
    const { headers, rows } = buildInventoryReportDataset({
        inventory,
        selectedFields,
        scope,
        filterValue,
    });

    // Validacion: evita generar archivos vacios
    if (!rows.length) {
        alert("No hay datos para generar reporte");
        return; // Corte de ejecucion
    }

    // Generacion de timestamp para nombre unico de archivo (YYYY-MM-DD)
    const timestamp = new Date().toDateString().slice(0, 10);

    // Seleccion de estrategia de exportacion segun formato
    if (format === "excel") {
        generateExcelReport({
            headers,
            rows,
            fileName: `inventory-report-${timestamp}.xlsx`,
            sheetName: "Inventario",
        });
    }

    if (format === "pdf") {
        generatePdfReport({
            headers,
            rows,
            fileName: `inventory-report-${timestamp}.pdf`,
            title: "Reporte de Inventario",
        });
    }
}
