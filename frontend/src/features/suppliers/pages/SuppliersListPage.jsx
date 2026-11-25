// src/features/suppliers/pages/SuppliersListPage.jsx
// Listado de proveedores con filtros, cambio de estado y reportes
import { DataTable, Navbar } from "@/shared/index";
import { createSupplierColumns, supplierFilters, supplierInitialSort } from "@/features/suppliers/table/SuppliersColumns"
import { getSuppliers, getSuppliersReport, updateSupplierStatus } from "@/features/suppliers/services/supplierService"
import { getInventoryOptions } from "@/features/inventory/services/inventoryService"
import { showErrorAlert } from "@/shared/services/alertService"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/index"
import ReportConfigModal from "@/shared/reports/components/ReportConfigModal"
import SupplierDetailModal from "@/features/suppliers/components/SupplierDetailModal"
import { supplierReportFields, supplierReportScopes, supplierReportFilters } from "@/features/suppliers/reports/config/supplierReportFields"
import { useEffect, useMemo, useState } from "react"
import { Truck } from "lucide-react"
import fotoFondo from "@/assets/images/suppliers.png";
import { useAccess } from "@/features/auth/services/accessService";


export default function SuppliersListPage () {
    // permisos del usuario: lo que no puede hacer no se muestra (el backend igual lo bloquea)
    const can = useAccess();

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    // Copia de los proveedores para reflejar al instante los cambios de estado
    const [rows, setRows] = useState([]);
    const navigate = useNavigate();

    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const handleView = (supplier) => setSelectedSupplier(supplier);
    const handleEdit = (supplier) => navigate("/editSupplier", { state: { supplier } });

    // Columnas de la tabla con las acciones de ver, editar y cambiar estado
    const columns = useMemo(
        () => createSupplierColumns({ onView: can("proveedores_visualizar") ? handleView : undefined, onEdit: can("proveedores_actualizar") ? handleEdit : undefined, onStatusChange: !can("proveedores_habilitar") ? undefined : async (supplier, value, reason) => {
            await updateSupplierStatus(supplier.id, value, reason);
            setRows((prev) => prev.map((s) => (s.id === supplier.id ? { ...s, isActive: value } : s)));
        } }),
        [can]
    );

    // proveedores reales y productos del inventario para los filtros
    const [products, setProducts] = useState([]);

    useEffect(() => {
        getSuppliers().then(setRows).catch((error) => showErrorAlert({ title: "No se pudieron cargar los proveedores", text: error.message, confirmButtonText: "Entendido", timer: 4000 }));
        getInventoryOptions().then(setProducts).catch(console.error);
    }, []);

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
                    onBack={() => navigate("/home")}
                    className="rounded-m3-lg shadow-m3-2"
                    actions={
                        <>
                            {can("proveedores_reporte") && (
                                <Button size="sm" variant="crema" onClick={() => setIsReportModalOpen(true)}>
                                    Reportar proveedor
                                </Button>
                            )}

                            {can("proveedores_registrar") && (
                                <Button size="sm" variant="crema" onClick={() => navigate("/suppliersCreate")}>
                                    Agregar proveedor
                                </Button>
                            )}
                        </>
                    }
                />

                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-m3-lg bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-m3-2">
                        <p className="text-sm font-medium text-bg-w">Total de proveedores</p>
                        <p className="text-2xl font-bold text-bg-w">{totalSuppliers}</p>
                    </div>
                </div>

                <DataTable variant="cafe" data={rows} columns={columns} filters={supplierFilters(products)} initialSort={supplierInitialSort} />
            </div>
            <SupplierDetailModal
                supplier={selectedSupplier}
                onClose={() => setSelectedSupplier(null)}
                onEdit={can("proveedores_actualizar") ? handleEdit : undefined}
            />

            <ReportConfigModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Generar reporte de proveedores"
                data={rows}
                fetchReport={getSuppliersReport}
                fields={supplierReportFields}
                scopes={supplierReportScopes}
                filters={supplierReportFilters(products)}
                fileNamePrefix="suppliers-report"
                reportTitle="Reporte de Proveedores"
                sheetName="Proveedores"
            />
        </div>
    )
}