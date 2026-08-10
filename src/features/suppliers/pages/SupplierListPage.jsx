// src/features/suppliers/pages/SupplierListPage.jsx

// Iconos del encabezado (camion de proveedores y campana de notificaciones)
import { Truck, Bell } from "lucide-react";

import { DataTable, Button } from "../../../shared";
import { SupplierColumns } from "../table/SuppliersColumns";
import { suppliers } from "../data/suppliers";
import { useNavigate } from "react-router-dom";

export default function SupplierListPage() {

    const navigate = useNavigate();

    return (
        <div className="p-6 lg:p-10 w-full">

            {/* Encabezado de la pantalla: icono, titulo, descripcion y acciones */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--color-primary-500)]/40">

                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[var(--color-primary-200)]">
                        <Truck size={26} className="text-[var(--color-tertiary-600)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-secundary-900)]">Proveedores</h1>
                        <p className="text-sm text-text-secondary">Administra los proveedores registrados y sus datos de contacto.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notificaciones (visual, sin logica asociada por ahora) */}
                    <Button variant="secondary" size="sm" aria-label="Notificaciones">
                        <Bell size={20} />
                    </Button>

                    <Button variant="primary" size="sm" onClick={() => navigate("/suppliers")}>
                        Nuevo proveedor
                    </Button>
                </div>
            </div>

            {/* Tarjeta clara: mantiene el texto y la tabla legibles sobre el fondo oscurecido */}
            <div className="bg-[var(--color-white)]/95 rounded-xl shadow-lg p-6">
                <DataTable data={suppliers} columns={SupplierColumns} />
            </div>
        </div>
    );
}
