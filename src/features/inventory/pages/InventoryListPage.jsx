// src/features/inventory/pages/InventoryListPage.jsx

// Hook de React para manejar el estado del modal de reportes
import { useState } from "react";

// Iconos del encabezado (caja de inventario y campana de notificaciones)
import { Package, Bell } from "lucide-react";

import { DataTable, Button } from "../../../shared";
import { InventoryColumns } from "../table/InventoryColumns";
import { inventory } from "../data/inventory";
import InventoryReportModal from "../reports/components/InventoryReportModal";


export default function InventoryListPage (){

    // Estado que controla la visibilidad del modal de reportes
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    return(
        <div className="p-6 lg:p-10 w-full">

            {/* Encabezado de la pantalla: icono, titulo, descripcion y acciones */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--color-primary-500)]/40">

                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[var(--color-primary-200)]">
                        <Package size={26} className="text-[var(--color-tertiary-600)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-secundary-900)]">Inventario</h1>
                        <p className="text-sm text-text-secondary">Administra las existencias de todas las sucursales.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notificaciones (visual, sin logica asociada por ahora) */}
                    <button
                        type="button"
                        aria-label="Notificaciones"
                        className="relative p-2 rounded-full hover:bg-[var(--color-primary-200)]"
                    >
                        <Bell size={20} className="text-[var(--color-secundary-900)]" />
                    </button>

                    <Button variant="primary" size="sm" onClick={() => setIsReportModalOpen(true)}>
                        Generar reporte
                    </Button>
                </div>
            </div>

            {/* Tarjeta clara: mantiene el texto y la tabla legibles sobre el fondo oscurecido */}
            <div className="bg-white/95 rounded-xl shadow-lg p-6">
                <DataTable data={inventory} columns={InventoryColumns}/>
            </div>

            {/* Modal de configuracion de reporte (Reportar inventario/Front) */}
            <InventoryReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
            />
        </div>
    )
}
