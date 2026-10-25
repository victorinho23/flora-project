// src/features/inventory/pages/InventoryListPage.jsx
import InventoryDetailModal from "../components/InventoryDetailModal";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Bell, Search } from "lucide-react";
import { showSuccesAlert, showErrorAlert } from "@/shared/services/alertService";

import { DataTable, Button, Navbar } from "../../../shared";
import { createInventoryColumns, inventoryFilters, inventoryInitialSort } from "../table/InventoryColumns";
import { inventory } from "../data/inventory";
import InventoryReportModal from "../reports/components/InventoryReportModal";

import fotoFondo from "@/assets/images/fondo-inventory.jpeg";


export default function InventoryListPage () {

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [rows, setRows] = useState(inventory);
    const navigate = useNavigate();

    const [selectedId, setSelectedId] = useState(null);

    const handleView = (item) => setSelectedId(item.id);
    const handleEdit = (item) => navigate("/editInventory", { state: { item } });

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
        () => createInventoryColumns({ onView: handleView, onEdit: handleEdit, onStatusChange: (item, status) => setRows((prev) => prev.map((i) => (i.id === item.id ? { ...i, status } : i))) }),
        []
    );

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
                    onBack={() => navigate("/createInventory")}
                    className="rounded-[1.25rem] shadow-[0_22px_48px_-26px_color-mix(in_srgb,var(--color-bg-s950)_70%,transparent)]"
                    actions={
                        <>
                            <Button size="sm" variant="crema" aria-label="Existencias bajas" onClick={notifyLowStock}>
                                <Bell size={18} />
                            </Button>

                            <Button size="sm" variant="crema" onClick={() => navigate("/detailsInventory")}>
                                <Search size={16} />
                                Consultar producto
                            </Button>

                            <Button size="sm" variant="crema" onClick={() => setIsReportModalOpen(true)}>
                                Generar reporte
                            </Button>
                        </>
                    }
                />

                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="text-center px-8 py-4 min-w-44 text-bg-w rounded-[1.25rem] bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-[0_18px_36px_-20px_color-mix(in_srgb,var(--color-bg-t950)_75%,transparent)]">
                        <p className="text-sm font-medium text-bg-w">Total de productos</p>
                        <p className="text-2xl font-bold text-bg-w">{totalItems}</p>
                    </div>
                </div>

                <DataTable variant="cafe" data={rows} columns={columns} filters={inventoryFilters(rows)} initialSort={inventoryInitialSort} />
            </div>
            <InventoryDetailModal
                item={rows.find((i) => i.id === selectedId)}
                onClose={() => setSelectedId(null)}
                onEdit={handleEdit}
            />

            <InventoryReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                data={rows}
            />
        </div>
    )
}