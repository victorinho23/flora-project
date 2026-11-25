// src/features/inventory/pages/InventoryListPage.jsx
import InventoryDetailModal from "../components/InventoryDetailModal";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Bell, Search } from "lucide-react";
import { showSuccesAlert, showErrorAlert } from "@/shared/services/alertService";

import { DataTable, Button, Navbar, DetailModal } from "../../../shared";
import InventoryDetailPage from "./InventoryDetailPage";
import { createInventoryColumns, inventoryFilters, inventoryInitialSort } from "../table/InventoryColumns";
import { getInventory, updateInventoryStatus } from "../services/inventoryService";
import InventoryReportModal from "../reports/components/InventoryReportModal";

import fotoFondo from "@/assets/images/fondo-inventory.jpeg";
import { useAccess } from "@/features/auth/services/accessService";


export default function InventoryListPage () {
    // permisos del usuario: lo que no puede hacer no se muestra (el backend igual lo bloquea)
    const can = useAccess();

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [rows, setRows] = useState([]);
    const navigate = useNavigate();

    const [selectedId, setSelectedId] = useState(null);

    const handleView = (item) => setSelectedId(item.id);
    // lupa: consultar un producto en una ventana pequeña, sin salir del listado
    const [lookupOpen, setLookupOpen] = useState(false);

    const handleEdit = (item) => navigate("/editInventory", { state: { item, from: "/listInventory" } });

    // Campana: avisa que productos estan por debajo de su cantidad minima
    const notifyLowStock = async () => {
        const low = rows.filter((item) => Number(item.quantity) < Number(item.minQuantity ?? 0));
        if (!low.length) {
            await showSuccesAlert({ title: "Existencias al día", text: "Ningún producto está por debajo de su cantidad mínima.", timer: 2500 });
            return;
        }
        await showErrorAlert({
            title: "Existencias bajas",
            text: low.map((item) => `${item.name}: ${item.quantity} (mínimo ${item.minQuantity})`).join(" · "),
            confirmButtonText: "Entendido",
            timer: 6000,
        });
    };



    const columns = useMemo(
        () => createInventoryColumns({ onView: can("inventario_visualizar") ? handleView : undefined, onEdit: can("inventario_actualizar") ? handleEdit : undefined, onStatusChange: !can("inventario_estado") ? undefined : async (item, status) => {
            await updateInventoryStatus(item.id, status);
            setRows((prev) => prev.map((i) => (i.id === item.id ? { ...i, status } : i)));
        } }),
        [can]
    );

    // productos reales que llegan de la base
    useEffect(() => {
        getInventory().then(setRows).catch((error) => showErrorAlert({ title: "No se pudo cargar el inventario", text: error.message, confirmButtonText: "Entendido", timer: 4000 }));
    }, []);

    const totalItems = rows.length;

    return (
        <div className="p-6 md:p-10 min-h-screen bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            <div className="w-full space-y-6">
                <Navbar
                    variant="foto"
                    navigation
                    image={fotoFondo}
                    icon={Package}
                    title="Inventario"
                    subtitle="Administra las existencias de todas las sucursales."
                    onBack={() => navigate("/home")}
                    className="rounded-m3-lg shadow-m3-2"
                    actions={
                        <>
                            <Button size="sm" variant="crema" aria-label="Existencias bajas" onClick={notifyLowStock}>
                                <Bell size={18} />
                            </Button>

                            {can("inventario_visualizar") && (
                                <Button size="sm" variant="crema" aria-label="Consultar producto" title="Consultar producto" onClick={() => setLookupOpen(true)}>
                                    <Search size={18} />
                                </Button>
                            )}

                            {can("inventario_reporte") && (
                                <Button size="sm" variant="crema" onClick={() => setIsReportModalOpen(true)}>
                                    Reporte
                                </Button>
                            )}

                            {can("inventario_crear") && (
                                <Button size="sm" variant="crema" onClick={() => navigate("/createInventory")}>
                                    
                                    Crear productos
                                </Button>
                            )}
                        </>
                    }
                />

                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-m3-lg bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-m3-2">
                        <p className="text-sm font-medium text-bg-w">Total de productos</p>
                        <p className="text-2xl font-bold text-bg-w">{totalItems}</p>
                    </div>
                </div>

                <DataTable variant="cafe" data={rows} columns={columns} filters={inventoryFilters(rows)} initialSort={inventoryInitialSort} />
            </div>
            <InventoryDetailModal
                item={rows.find((i) => i.id === selectedId)}
                onClose={() => setSelectedId(null)}
                onEdit={can("inventario_actualizar") ? handleEdit : undefined}
            />

            {/* lupa: buscar un producto por ID, codigo de barras o nombre */}
            <DetailModal
                open={lookupOpen}
                onClose={() => setLookupOpen(false)}
                icon={Search}
                title="Consultar producto"
                subtitle="Busca por ID, código de barras o nombre"
                size="max-w-3xl"
                bodyClassName="grid-cols-1"
                footer={false}
            >
                <InventoryDetailPage inModal onEdit={handleEdit} />
            </DetailModal>

            <InventoryReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                data={rows}
            />
        </div>
    )
}