// Libreria para generacion de pdfs en el cliente
import jsPDF from "jspdf";

// Plugin para cracion de tablas dentro del PDF
import autoTable from "jspdf-autotable";

// Funcion utilitaria para generar un reporte PDF 
// Patron: exportacion de datos (dataset -> documento estructura)

export function generatePdfReport ({
    headers,                        // Encabezado de la tabla (columnas)
    rows,                           // Datos (array de filas)
    fileName = "user-report-pdf"    // Nombre del archivo de salida
}) {

    // Inicializa el documento PDF 
    const doc = new jsPDF();

    // Configuracion del titulo
    doc.setFontSize(16);
    doc.text("Reporte de Usuarios", 14, 20); // Posicion (x,y)

    // Generacin de tabla automatica
    autoTable(doc, {
        startY: 30,     // Posicion incial deba del titulo

        head: [headers],    // Encabezados (debe ser array de arrays)
        body: rows,         // Filas del reporte

        theme: "grid",      // Estilo visual de la tabla

        // Estilos del encabezado
        headStyles : {
            fillColor: [33, 150, 243],   // Color fondo (RGB)
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

