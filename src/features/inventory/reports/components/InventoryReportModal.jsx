// src/features/inventory/reports/components/InventoryReportModal.jsx
// Reporte de inventario: reutiliza el modal de reportes con sus propios alcances
import { useMemo } from "react";
import { ReportConfigModal } from "@/features/users";
import { inventoryReportFields } from "../config/inventoryReportFields";
import { inventory } from "../../data/inventory";

export default function InventoryReportModal({ isOpen, onClose, data = inventory }) {
    // Marcas disponibles para filtrar el reporte
    const brands = useMemo(() => [...new Set(data.map((item) => item.brand))].sort(), [data]);

    // Tipos de reporte: activo, agotado, vencido, averiado, todos, por marca o individual
    const scopes = useMemo(() => [
        { value: "all", label: "Todo el inventario" },
        { value: "Disponible", label: "Inventario activo", filter: (item) => item.status === "Disponible" },
        { value: "Agotado", label: "Inventario agotado", filter: (item) => item.status === "Agotado" },
        { value: "Vencido", label: "Inventario vencido", filter: (item) => item.status === "Vencido" },
        { value: "Avería", label: "Inventario averiado", filter: (item) => item.status === "Avería" },
        { value: "brand", label: "Por marca", param: { label: "Marca", options: brands.map((brand) => ({ value: brand, label: brand })) }, filter: (item, value) => item.brand === value },
        { value: "pick", label: "Reporte individual", pick: { multiple: false, label: (item) => `${item.name} · ${item.barcode}` } },
    ], [brands]);

    return (
        <ReportConfigModal
            isOpen={isOpen}
            onClose={onClose}
            title="Generar reporte de inventario"
            data={data}
            fields={inventoryReportFields}
            scopes={scopes}
            fileNamePrefix="inventory-report"
            reportTitle="Reporte de Inventario"
            sheetName="Inventario"
        />
    );
}
