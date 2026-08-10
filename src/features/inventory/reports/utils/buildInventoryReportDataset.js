// Funcion utilitaria para construir el dataset de un reporte de inventario (tabla)
// Patron: transformacion de datos (input -> output listo para exportar)

export function buildInventoryReportDataset({
    inventory,          // Array de registros de inventario origen
    selectedFields,     // Campos seleccionados para el reporte [{key, label}]
    scope,              // Alcance del reporte: "all" | "establecimiento" | "producto"
    filterValue,        // Valor de filtro para el alcance elegido (si aplica)
}) {

    // Copia inmutable del array original (evita mutaciones)
    let filteredInventory = [...inventory];

    // Filtro por alcance: establecimiento o producto
    if (scope === "establecimiento" && filterValue) {
        filteredInventory = filteredInventory.filter((record) =>
            record.establecimiento
                .toLowerCase()
                .includes(filterValue.toLowerCase())
        );
    }

    if (scope === "producto" && filterValue) {
        filteredInventory = filteredInventory.filter((record) =>
            record.nombre.toLowerCase().includes(filterValue.toLowerCase())
        );
    }

    // Construccion de encabezados del reporte
    // Se toma el label de cada campo seleccionado
    const headers = selectedFields.map((field) => field.label);

    // Construccion de filas del reporte
    // Cada registro se transforma en un array de valores segun los campos seleccionados
    const rows = filteredInventory.map((record) =>
        selectedFields.map((field) => {
            const value = record[field.key]; // Acceso dinamico a la propiedad

            // Normalizacion: evita undefined o null en el reporte
            return value ?? "";
        })
    );

    // Estructura final desacoplada de la UI
    // Lista para exportar a Excel, PDF o renderizar la tabla
    return {
        headers, // Array de strings (columnas)
        rows,    // Array de arrays (filas)
    };
}
