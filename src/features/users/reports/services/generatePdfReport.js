// Libreria para generacion de pdfs en el cliente
import jsPDF from "jspdf";

// Plugin para cracion de tablas dentro del PDF
import autoTable from "jspdf-autotable";

// Funcion utilitaria para generar un reporte PDF 
// Patron: exportacion de datos (dataset -> documento estructura)

export function generatePdfReport ({
    headers,                        // Encabezado de la tabla (columnas)
    rows,                           // Datos (array de filas)
    fileName = "reporte.pdf",       // Nombre del archivo de salida
    reportTitle = "Reporte",
    meta = {},
}) {

    // Inicializa el documento PDF 
    const doc = new jsPDF({ orientation: headers.length > 6 ? "landscape" : "portrait" });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(45, 31, 21);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text(meta.company ?? "Flora", 14, 13);
    doc.setFontSize(9);
    doc.text(meta.generatedAt ?? "", pageWidth - 14, 13, { align: "right" });
    doc.setTextColor(45, 31, 21);

    // Configuracion del titulo
    doc.setFontSize(16);
    doc.text(reportTitle, 14, 32); // Posicion (x,y)
    doc.setFontSize(10);
    doc.text(`Generado por: ${meta.user ?? ""}   ·   Fecha y hora: ${meta.generatedAt ?? ""}   ·   Registros: ${rows.length}`, 14, 39);

    // Generacin de tabla automatica
    autoTable(doc, {
        startY: 45,     // Posicion incial deba del titulo

        head: [headers],    // Encabezados (debe ser array de arrays)
        body: rows,         // Filas del reporte

        theme: "grid",      // Estilo visual de la tabla

        // Estilos del encabezado
        headStyles : {
            fillColor: [131, 69, 4],   // Color fondo (RGB)
            textColor: 255,              // Color del texto
            fontSize: 11
        },

        // Estilos globales de las celdas

        styles: {
            fontSize: 10
        },

        // Margenes del documento
        margin:{
            left: 14,
            right: 14
        }
    });

    // Genera y descarga el archivo PDF
    doc.save(fileName);
}

