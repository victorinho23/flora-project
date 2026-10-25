// src/features/users/pages/ViewSuppliersListPage.jsx
// Consulta de proveedores con filtros y reportes
import { DataTable, Navbar } from "../../../shared";
import { createSupplierColumns, supplierFilters, supplierInitialSort } from "../table/SuppliersColumns"
import { suppliers } from "@/features/suppliers/data/suppliers"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../../shared"
import ReportConfigModal from "../reports/components/ReportConfigModal"
import SupplierDetailModal from "../components/SupplierDetailModal"
import { supplierReportFields, supplierReportScopes, supplierReportFilters } from "../reports/config/supplierReportFields"
import { useMemo, useState } from "react"
import { Truck } from "lucide-react"
import fotoFondo from "@/assets/images/suppliers.png";


export default function SuppliersListPage () {

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    // Copia de los proveedores para reflejar al instante los cambios de estado
    const [rows, setRows] = useState(suppliers);
    const navigate = useNavigate();

    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const handleView = (supplier) => setSelectedSupplier(supplier);
    const handleEdit = (supplier) => navigate("/editSupplier", { state: { supplier } });

    // Columnas de la tabla con las acciones de ver, editar y cambiar estado
    const columns = useMemo(
        () => createSupplierColumns({ onView: handleView, onEdit: handleEdit, onStatusChange: (supplier, value) => setRows((prev) => prev.map((s) => (s.id === supplier.id ? { ...s, isActive: value } : s))) }),
        []
    );

    const totalSuppliers = rows.length;

    return (
        <div className="p-6 md:p-10 min-h-screen bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            <div className="w-full space-y-6">
                <Navbar
                    variant="foto"
                    navigation
                    image={fotoFondo}
                    icon={Truck}
                    title="Listado de proveedores"
                    subtitle="Administra los proveedores registrados y sus datos de contacto."
                    onBack={() => navigate("/suppliersCreate")}
                    className="rounded-[1.25rem] shadow-[0_22px_48px_-26px_color-mix(in_srgb,var(--color-bg-s950)_70%,transparent)]"
                    actions={
                        <>
                            <Button size="sm" variant="crema" onClick={() => setIsReportModalOpen(true)}>
                                Reportar proveedor
                            </Button>

                            <Link to="/suppliersCreate">
                                <Button size="sm" variant="crema">
                                    Agregar proveedor
                                </Button>
                            </Link>
                        </>
                    }
                />

                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-[1.25rem] bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-[0_18px_36px_-20px_color-mix(in_srgb,var(--color-bg-t950)_75%,transparent)]">
                        <p className="text-sm font-medium text-bg-w">Total de proveedores</p>
                        <p className="text-2xl font-bold text-bg-w">{totalSuppliers}</p>
                    </div>
                </div>

                <DataTable variant="cafe" data={rows} columns={columns} filters={supplierFilters} initialSort={supplierInitialSort} />
            </div>
            <SupplierDetailModal
                supplier={selectedSupplier}
                onClose={() => setSelectedSupplier(null)}
                onEdit={handleEdit}
            />

            <ReportConfigModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Generar reporte de proveedores"
                data={rows}
                fields={supplierReportFields}
                scopes={supplierReportScopes}
                filters={supplierReportFilters}
                fileNamePrefix="suppliers-report"
                reportTitle="Reporte de Proveedores"
                sheetName="Proveedores"
            />
        </div>
    )
}