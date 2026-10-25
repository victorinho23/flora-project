// src/features/suppliers/pages/SupplierUpdatePage.jsx
import { showSuccesAlert, showConfirmAlert } from "@/shared/services/alertService";

// Hook de React para manejar el estado de busqueda y los datos editados
import { useMemo, useState } from "react";

// Iconos usados en el encabezado
import { RefreshCw, Bell } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { Button, Switch, Navbar, DataTable, Input } from "../../../shared";
import Tablerowactions from "@/shared/components/Tablerowactions";
import SupplierDetailModal from "@/features/users/components/SupplierDetailModal";
import { suppliers as initialSuppliers } from "../data/suppliers";
import fotoFondo from "@/assets/images/suppliers.png";



export default function SupplierUpdatePage() {

    // Copia editable de los proveedores (los datos se actualizan localmente)
    const [items, setItems] = useState(initialSuppliers);

    const [selectedSupplier, setSelectedSupplier] = useState(null);

    // Hook para volver al listado despues de guardar
    const navigate = useNavigate();

    // Actualiza el telefono de un proveedor especifico
    const handlePhoneChange = (id, value) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, phone: value } : item
            )
        );
    };

    // Actualiza el estado activo/inactivo de un proveedor especifico
    const handleActiveChange = (id, value) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isActive: value } : item
            )
        );
    };

    // Columnas de la tabla: el telefono y el estado se editan directamente en la fila
    const columns = useMemo(
        () => [
            { accessorKey: "id", header: "Id" },
            { accessorKey: "companyName", header: "Empresa" },
            { accessorKey: "nit", header: "NIT" },
            { accessorKey: "contactName", header: "Contacto" },
            {
                accessorKey: "phone",
                header: "Telefono",
                cell: ({ row }) => (
                    <Input
                        type="tel"
                        size="sm"
                        width="w-36"
                        variant="latte"
                        htmlFor={`supplier-phone-${row.original.id}`}
                        value={row.original.phone}
                        onChange={(e) => handlePhoneChange(row.original.id, e.target.value)}
                    />
                ),
            },
            { accessorKey: "category", header: "Categoria" },
            {
                accessorKey: "isActive",
                header: "Estado",
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <Switch
                            checked={item.isActive}
                            onChange={async (value) => {
                                const result = await showConfirmAlert({
                                    title: `¿Deseas ${value ? "habilitar" : "inhabilitar"} el proveedor ${item.companyName}?`,
                                    text: "El cambio no elimina ninguna información.",
                                    confirmButtonText: value ? "Habilitar" : "Inhabilitar",
                                });
                                if (!result.isConfirmed) return false;
                                handleActiveChange(item.id, value);
                                await showSuccesAlert({ title: "Estado actualizado", text: `${item.companyName} ha sido ${value ? "habilitado" : "inhabilitado"} correctamente.`, timer: 2500 });
                                return true;
                            }}
                        />
                    );
                },
            },
            {
                id: "actions",
                header: "Acciones",
                cell: ({ row }) => (
                    <Tablerowactions
                        onView={() => setSelectedSupplier(row.original)}
                        onEdit={() => navigate("/editSupplier", { state: { supplier: row.original } })}
                    />
                ),
            },
        ],
        [navigate]
    );

    // Por ahora solo deja la constancia en consola de que se guardo
    // (aqui se conectara la llamada real cuando exista backend)
    const handleGuardar = async () => {
        await showSuccesAlert({
            title: "Proveedores actualizados",
            text: "Los cambios de los proveedores se guardaron correctamente",
            timer: 2500,
        });
        navigate("/listSuppliers");
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
                    title="Actualizar proveedores"
                    subtitle="Gestiona y manten actualizados los datos de tus proveedores."
                    onBack={() => navigate("/listSuppliers")}
                    className="rounded-[1.25rem] shadow-[0_22px_48px_-26px_color-mix(in_srgb,var(--color-bg-s950)_70%,transparent)]"
                    actions={
                        <>
                            <Button variant="crema" size="sm" aria-label="Notificaciones">
                                <Bell size={18} />
                            </Button>
                        </>
                    }
                />

                <DataTable variant="cafe" data={items} columns={columns} />

                <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 rounded-2xl bg-bg-s950 p-4">
                    <Button variant="caramelo" size="md" onClick={handleGuardar}>
                        Guardar cambios
                    </Button>
                </div>
            </div>
            <SupplierDetailModal
                supplier={selectedSupplier}
                onClose={() => setSelectedSupplier(null)}
                onEdit={(supplier) => navigate("/editSupplier", { state: { supplier } })}
            />
        </div>
    );
}