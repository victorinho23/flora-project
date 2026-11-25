// src/features/products/pages/CategoriesPage.jsx
// Categorias del menu: crear, cambiar el nombre y habilitar o inhabilitar
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tags, Pencil } from "lucide-react";
import { DataTable, Navbar, Input, Button, DetailModal, Switch } from "@/shared";
import { getAllCategories, createCategory, updateCategory, updateCategoryStatus } from "../services/dishService";
import { showConfirmAlert, showSuccesAlert, showErrorAlert } from "@/shared/services/alertService";
import { useAccess } from "@/features/auth/services/accessService";
import fotoFondo from "@/assets/images/fondo-dish.png";

// inModal: se abre como ventana desde el listado del menu (sin fondo ni encabezado de pagina)
export default function CategoriesPage({ inModal = false }) {
    const navigate = useNavigate();
    const can = useAccess();
    const [rows, setRows] = useState([]);
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    // categoria que se esta editando en el modal
    const [editing, setEditing] = useState(null);
    const [editName, setEditName] = useState("");
    const [editError, setEditError] = useState("");

    const load = () => getAllCategories().then(setRows).catch((err) => showErrorAlert({ title: "No se pudieron cargar las categorías", text: err.message, confirmButtonText: "Entendido", timer: 4000 }));
    useEffect(() => {
        load();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createCategory(name);
            setName("");
            setError("");
            await load();
            await showSuccesAlert({ title: "Categoría creada", text: "Ya aparece en el menú y en la toma de órdenes", timer: 2000 });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRename = async () => {
        try {
            await updateCategory(editing.id, editName);
            setEditing(null);
            await load();
            await showSuccesAlert({ title: "Categoría actualizada", timer: 2000 });
        } catch (err) {
            setEditError(err.message);
        }
    };

    const columns = useMemo(() => [
        { accessorKey: "label", header: "Categoría" },
        { accessorKey: "dishes", header: "Platillos" },
        {
            accessorKey: "isActive",
            header: "Estado",
            cell: ({ row }) => {
                const category = row.original;
                const handleChange = async (value) => {
                    const result = await showConfirmAlert({
                        title: `¿${value ? "Habilitar" : "Inhabilitar"} ${category.label}?`,
                        text: value ? "Volverá a aparecer en el menú." : "No aparecerá al crear platillos ni al tomar órdenes.",
                        confirmButtonText: value ? "Habilitar" : "Inhabilitar",
                        reasonLabel: "Motivo del cambio",
                    });
                    if (!result.isConfirmed) return false;
                    try {
                        await updateCategoryStatus(category.id, value, result.value);
                        await load();
                        return true;
                    } catch (err) {
                        await showErrorAlert({ title: "No se puede cambiar", text: err.message, confirmButtonText: "Entendido", timer: 4000 });
                        return false;
                    }
                };
                return <Switch checked={category.isActive} onChange={handleChange} disabled={!can("menu_habilitar")} />;
            },
        },
        ...(can("menu_actualizar") ? [{
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => (
                <button
                    type="button"
                    onClick={() => { setEditing(row.original); setEditName(row.original.label); setEditError(""); }}
                    aria-label={`Cambiar nombre de ${row.original.label}`}
                    title="Cambiar nombre"
                    className="m3-state w-10 h-10 flex items-center justify-center rounded-m3-full text-bg-w focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-t200"
                >
                    <Pencil size={16} />
                </button>
            ),
        }] : []),
    ], [can]);

    return (
        <div className={inModal ? "w-full" : "p-6 md:p-10 min-h-screen bg-bg-p500 bg-fixed bg-linear-160 from-bg-p400 via-bg-p600 to-bg-s200"}>
            <div className={inModal ? "w-full space-y-6" : "w-full max-w-5xl mx-auto space-y-6"}>
                {!inModal && (
                <Navbar
                    variant="foto"
                    image={fotoFondo}
                    icon={Tags}
                    title="Categorías del menú"
                    subtitle="Organiza la carta: lo que crees aquí aparece al crear platillos y al tomar órdenes."
                    onBack={() => navigate("/listMenu")}
                    className="rounded-m3-lg shadow-m3-2"
                />
                )}

                {can("menu_agregar") && (
                    <form onSubmit={handleCreate} noValidate className="flex flex-col sm:flex-row sm:items-end gap-3 border border-bd-s100 rounded-m3-lg bg-bg-w shadow-m3-1 p-5 [&_.w-80]:w-full">
                        <div className="flex-1">
                            <Input
                                type="text"
                                name="categoryName"
                                label="Nueva categoría"
                                placeholder="Ej: Pizzas, Bebidas frías..."
                                htmlFor="category-name"
                                variant="latte"
                                value={name}
                                maxLength={60}
                                onChange={(e) => { setName(e.target.value); setError(""); }}
                                error={error}
                            />
                        </div>
                        <Button variant="espresso" size="lg" type="submit">Agregar</Button>
                    </form>
                )}

                <DataTable variant="cafe" data={rows} columns={columns} emptyText="Todavía no hay categorías" />
            </div>

            <DetailModal
                open={Boolean(editing)}
                onClose={() => setEditing(null)}
                icon={Tags}
                title="Cambiar nombre"
                subtitle={editing?.label}
                bodyClassName="grid-cols-1 [&_.w-80]:w-full"
                onEdit={handleRename}
                editLabel="Guardar"
            >
                <Input
                    type="text"
                    name="editCategoryName"
                    label="Nombre de la categoría"
                    htmlFor="edit-category-name"
                    variant="latte"
                    value={editName}
                    maxLength={60}
                    onChange={(e) => { setEditName(e.target.value); setEditError(""); }}
                    error={editError}
                />
            </DetailModal>
        </div>
    );
}
