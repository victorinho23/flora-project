// Fuente de datos de usuarios (mock o fuente centralizada)
import { users } from "../../data/users";

// Utilidad para transformar datos en dataset de reporte
import { buildReportDataset } from "../utils/buildReportDataset";

// Servicios de exportacion

import { generateExcelReport } from "./generateExcelReport";
import { generatePdfReport } from "./generatePdfReport";

// Caso de uso: orquestador de generacion de reportes de usuarios
// Patrón: Apllication Service (cordina utilidades y servicios)
export function generateUserReport({
    format,             // Excel | pdf
    selectedFields,     // Campos seleccionados por el usuario
    scope,              // Alcance del reporte
    documentNumber      // Filtro opcional
}) {

    // Construccion del dataset (desaclopado de la UI)
    const {headers, rows} = buildReportDataset({
        users,
        selectedFields,
        scope,
        documentNumber
    });

    // Validacion: evita gnerar archivos vacios
    if(!rows.length){
        alert("No hay datos para generar reporte");
        return; // Corte de ejecución
    }

    // Genreacion de timestamp para nombre uncios de archivo (YYYY-MM-DD)
    const timestamp = new Date().toDateString().slice(0,10);

    // Seleccion de estrategia de exportacion segun formato
    if (format === "excel"){
        generateExcelReport({
            headers,
            rows,
            fileName: `users-report-${timestamp}.xlsx`
        });
    }

    if (format === "pdf"){
        generatePdfReport({
            headers,
            rows,
            fileName: `users-report-${timestamp}.pdf`
        });
    }
}