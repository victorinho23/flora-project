// src/features/inventory/pages/InventoryUpdatePage.jsx
import { showSuccesAlert, showErrorAlert } from "@/shared/services/alertService";
import InventoryDetailModal from "../components/InventoryDetailModal";

// Hook de React para manejar el estado de busqueda y las cantidades editadas
import { useMemo, useState } from "react";

// Iconos usados en el encabezado y la tabla
import { RefreshCw, Bell } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { Button, Navbar, DataTable, Input } from "../../../shared";
import Tablerowactions from "@/shared/components/Tablerowactions";
import { inventory as initialInventory } from "../data/inventory";
import fotoFondo from "@/assets/images/fondo-inventory.jpeg";

// Cantidad minima permitida por producto antes de marcarlo como bajo stock
const MIN_QUANTITY = 10;



const statusStyle = (status) => {
    if (status === "Disponible") return "bg-green-50 text-green-900 border border-green-700/40";
    if (status === "Vencido") return "bg-red-50 text-red-900 border border-red-800/40";
    return "bg-bg-t50 text-br-t950 border border-bd-t300";
};

export default function InventoryUpdatePage() {

    // Copia editable del inventario (las cantidades se actualizan localmente)
    const [items, setItems] = useState(initialInventory);

    // Hook para volver al listado despues de guardar
    const navigate = useNavigate();

    const [selectedId, setSelectedId] = useState(null);

    // Actualiza la cantidad de un producto especifico
    const handleQuantityChange = (id, value) => {
        const newQuantity = Number(value);

        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, quantity: Number.isNaN(newQuantity) ? 0 : newQuantity }
                    : item
            )
        );
    };

    // Campana: avisa que productos estan por debajo de su cantidad minima
    const notifyLowStock = async () => {
        const low = items.filter((item) => Number(item.quantity) < Number(item.minQuantity ?? 0));
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

    // Columnas de la tabla: la cantidad se edita directamente en la fila
    const columns = useMemo(
        () => [
            { accessorKey: "id", header: "Id" },
            { accessorKey: "brand", header: "Marca" },
            { accessorKey: "name", header: "Nombre del producto" },
            { accessorKey: "barcode", header: "Codigo de barras" },
            {
                accessorKey: "quantity",
                header: "Cantidad",
                cell: ({ row }) => (
                    <Input
                        type="number"
                        min={0}
                        size="sm"
                        width="w-24"
                        htmlFor={`inventory-quantity-${row.original.id}`}
                        variant={row.original.quantity < (row.original.minQuantity ?? MIN_QUANTITY) ? "caramelo" : "latte"}
                        value={row.original.quantity}
                        onChange={(e) => handleQuantityChange(row.original.id, e.target.value)}
                    />
                ),
            },
            {
                accessorKey: "unitValue",
                header: "Valor unitario",
                cell: ({ row }) => `$ ${(row.original.unitValue ?? 0).toLocaleString("es-CO")}`,
            },
            {
                accessorKey: "status",
                header: "Estado",
                cell: ({ row }) => <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyle(row.original.status)}`}>{row.original.status}</span>,
            },
            { accessorKey: "expirationDate", header: "Fecha de vencimiento" },
            {
                id: "actions",
                header: "Acciones",
                cell: ({ row }) => (
                    <Tablerowactions
                        onView={() => setSelectedId(row.original.id)}
                        onEdit={() => navigate("/editInventory", { state: { item: row.original } })}
                    />
                ),
            },
        ],
        [navigate]
    );

    // Por ahora solo deja la constancia en consola de que se guardo
    // (aqui se conectara la llamada real cuando exista backend)
    const handleSave = async () => {
        await showSuccesAlert({
            title: "Inventario actualizado",
            text: "Los cambios del inventario se guardaron correctamente",
            timer: 2500,
        });
        navigate("/listInventory");
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
            <div className="w-full space-y-6">
                {/* Encabezado */}
                <Navbar
                    variant="foto"
                    navigation
                    image={fotoFondo}
                    icon={RefreshCw}
                    title="Actualizar inventario"
                    subtitle="Gestiona y manten actualizadas las existencias de tu inventario."
                    onBack={() => navigate("/listInventory")}
                    className="rounded-[1.25rem] shadow-[0_22px_48px_-26px_color-mix(in_srgb,var(--color-bg-s950)_70%,transparent)]"
                    actions={
                        <>
                            <Button variant="crema" size="sm" aria-label="Existencias bajas" onClick={notifyLowStock}>
                                <Bell size={18} />
                            </Button>
                        </>
                    }
                />

                <DataTable variant="cafe" data={items} columns={columns} />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-bg-s950 p-4">
                    <p className="text-sm font-medium text-br-p100">
                        Las cantidades por debajo de la cantidad mínima de cada producto se resaltan en caramelo.
                    </p>

                    <Button variant="caramelo" size="md" onClick={handleSave}>
                        Guardar cambios
                    </Button>
                </div>
            </div>
            <InventoryDetailModal
                item={items.find((i) => i.id === selectedId)}
                onClose={() => setSelectedId(null)}
                onEdit={(item) => navigate("/editInventory", { state: { item } })}
            />
        </div>
    );
}