//  Fincion utilitaria para constuir el dataset de un reporte (tabla)
// Patron: transformacion de datos (input -> output listo para exportar)

export function buildReportDataset({
    users,              // Array de suarios origen
    selectedFields,     // Campos seleccionados para el reporte [{key, label}]
    scope,              // Alcance del reporte: "all" | "document"
    documentNumber       // Numero de documento para filtrar (si a'plica)
}) {

    // Copia inmutabe del array original (evita mutaciones)

    let filteredUsers = [...users];

    // Filtro por alcance: si es por documento se aplica el filtro especificio
    if (scope === "document" && documentNumber) {
        filteredUsers = filteredUsers.filter(
            (user) => user.document_number === documentNumber
        );
    }

    // Construccion de encabeados del reporte
    // Se toma el label de cada campo seleccionado
    const headers = selectedFields.map((field) => field.label)

    // Construccion de filas del reporte
    // Cada usuario se transforma en un array de valores segun los campos seleccionados

    const rows = filteredUsers.map((user) => selectedFields.map((field) => {
        const value = user[field.key] // Acceso dinamico a la propiedad

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