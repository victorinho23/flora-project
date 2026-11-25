// src/features/settings/pages/TablesSettingsPage.jsx
// Configuracion -> Mesas: crear, editar y habilitar/deshabilitar las mesas del restaurante (no se eliminan para no perder el historial)
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Pencil, Plus, Users, MapPin } from "lucide-react";
import { DataTable, Navbar, Input, Select, Button, DetailModal, Switch } from "@/shared";
import { getAllTables, createTable, updateTable, updateTableStatus, saveTableMap } from "../services/tableService";
import RestaurantMapEditor from "../components/RestaurantMapEditor";
import { showConfirmAlert, showSuccesAlert, showErrorAlert } from "@/shared/services/alertService";
import { useAccess } from "@/features/auth/services/accessService";
import fotoFondo from "@/assets/images/fondo-orders.png";

// datos vacios del formulario de la ventana
const EMPTY = { number: "", capacity: "4", zone: "Salón" };

export default function TablesSettingsPage() {
    const navigate = useNavigate();
    const can = useAccess();
    const [rows, setRows] = useState([]);
    const [zones, setZones] = useState([]);
    // mapa del restaurante guardado (el editor trabaja sobre una copia hasta que se guarda)
    const [map, setMap] = useState(null);
    // sube cada vez que se recarga, para que el editor del mapa arranque de nuevo con lo guardado
    const [version, setVersion] = useState(0);

    // ventana de crear / editar: editing = null (cerrada), "new" o la mesa que se edita
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});

    const load = () => getAllTables()
        .then((data) => {
            setRows(data.tables);
            setZones(data.zones);
            setMap(data.map);
            setVersion((value) => value + 1);
        })
        .catch((err) => showErrorAlert({ title: "No se pudieron cargar las mesas", text: err.message, confirmButtonText: "Entendido", timer: 4000 }));

    useEffect(() => {
        load();
    }, []);

    // resumen de arriba: cuantas mesas activas y cuantos puestos hay
    const active = rows.filter((table) => table.active);
    const seats = active.reduce((sum, table) => sum + table.capacity, 0);
    const onMap = active.filter((table) => table.x != null).length;

    const handleSaveMap = async (data) => {
        try {
            await saveTableMap(data);
            await load();
            await showSuccesAlert({ title: "Mapa guardado", text: "Los meseros ya lo ven al buscar las mesas", timer: 2000 });
        } catch (err) {
            await showErrorAlert({ title: "No se pudo guardar el mapa", text: err.message, confirmButtonText: "Entendido", timer: 4000 });
        }
    };

    const openNew = () => {
        // sugiere el numero siguiente al mas alto
        const next = rows.reduce((max, table) => Math.max(max, table.number), 0) + 1;
        setForm({ ...EMPTY, number: String(next) });
        setErrors({});
        setEditing("new");
    };

    const openEdit = (table) => {
        setForm({ number: String(table.number), capacity: String(table.capacity), zone: table.zone });
        setErrors({});
        setEditing(table);
    };

    const change = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    };

    // guarda la mesa (nueva o editada); el error del backend sale debajo de su campo
    const handleSave = async () => {
        const isNew = editing === "new";
        const result = await showConfirmAlert({
            title: isNew ? `¿Crear la mesa ${form.number}?` : `¿Guardar los cambios de la mesa ${editing.number}?`,
            text: `${form.zone} · ${form.capacity} personas`,
            confirmButtonText: isNew ? "Crear mesa" : "Guardar cambios",
        });
        if (!result.isConfirmed) return;

        try {
            const body = { number: Number(form.number), capacity: Number(form.capacity), zone: form.zone };
            if (isNew) await createTable(body);
            else await updateTable(editing.id, body);
            setEditing(null);
            await load();
            await showSuccesAlert({ title: isNew ? "Mesa creada" : "Mesa actualizada", text: "Ya la puedes ubicar en el mapa", timer: 2000 });
        } catch (err) {
            if (err.field) setErrors({ [err.field]: err.message });
            else await showErrorAlert({ title: "No se pudo guardar", text: err.message, confirmButtonText: "Entendido", timer: 4000 });
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: "number",
            header: "Mesa",
            cell: ({ row }) => <span className="font-bold">Mesa {row.original.number}</span>,
        },
        { accessorKey: "zone", header: "Zona" },
        {
            accessorKey: "capacity",
            header: "Capacidad",
            cell: ({ row }) => `${row.original.capacity} ${row.original.capacity === 1 ? "persona" : "personas"}`,
        },
        {
            accessorKey: "active",
            header: "Estado",
            cell: ({ row }) => {
                const table = row.original;
                const handleChange = async (value) => {
                    const result = await showConfirmAlert({
                        title: `¿${value ? "Habilitar" : "Deshabilitar"} la mesa ${table.number}?`,
                        text: value ? "Volverá a aparecer en el mapa y al tomar órdenes." : "No aparecerá en el mapa de los meseros y no se podrán abrir órdenes en ella.",
                        confirmButtonText: value ? "Habilitar" : "Deshabilitar",
                        reasonLabel: "Motivo del cambio",
                    });
                    if (!result.isConfirmed) return false;
                    try {
                        await updateTableStatus(table.id, value, result.value);
                        await load();
                        return true;
                    } catch (err) {
                        await showErrorAlert({ title: "No se puede cambiar", text: err.message, confirmButtonText: "Entendido", timer: 4000 });
                        return false;
                    }
                };
                return <Switch checked={table.active} onChange={handleChange} disabled={!can("mesas_habilitar")} />;
            },
        },
        ...(can("mesas_actualizar") ? [{
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    {can("mesas_actualizar") && (
                        <button
                            type="button"
                            onClick={() => openEdit(row.original)}
                            aria-label={`Editar mesa ${row.original.number}`}
                            title="Editar"
                            className="m3-state w-10 h-10 flex items-center justify-center rounded-m3-full text-bg-w focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-t200"
                        >
                            <Pencil size={16} />
                        </button>
                    )}
                </div>
            ),
        }] : []),
    ], [can, rows]);

    return (
        <div className="p-6 md:p-10 min-h-screen bg-bg-p500 bg-fixed bg-linear-160 from-bg-p400 via-bg-p600 to-bg-s200">
            <div className="w-full space-y-6">
                <Navbar
                    variant="foto"
                    image={fotoFondo}
                    icon={Settings}
                    title="Configuración · Mesas"
                    subtitle="Dibuja el mapa de tu negocio y ubica las mesas, así los meseros saben a dónde ir con solo mirarlo."
                    onBack={() => navigate("/home")}
                    className="rounded-m3-lg shadow-m3-2"
                    actions={can("mesas_crear") && (
                        <Button size="sm" variant="crema" onClick={openNew}>
                            <Plus size={16} />
                            Nueva mesa
                        </Button>
                    )}
                />

                {/* resumen rapido */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        ["Mesas activas", active.length],
                        ["Puestos disponibles", seats],
                        ["Zonas en uso", new Set(active.map((table) => table.zone)).size],
                        ["Mesas en el mapa", `${onMap} de ${active.length}`],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-m3-lg bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 shadow-m3-2 px-5 py-4 text-center">
                            <p className="text-sm font-medium text-bg-w">{label}</p>
                            <p className="text-2xl font-bold text-bg-w">{value}</p>
                        </div>
                    ))}
                </div>

                {map && <RestaurantMapEditor key={version} map={map} tables={rows} onSave={handleSaveMap} canEdit={can("mesas_actualizar")} />}

                <DataTable variant="cafe" data={rows} columns={columns} emptyText="Todavía no hay mesas" />
            </div>

            {/* crear / editar mesa: es poco contenido, por eso va en ventana */}
            <DetailModal
                open={Boolean(editing)}
                onClose={() => setEditing(null)}
                icon={Settings}
                title={editing === "new" ? "Nueva mesa" : `Editar mesa ${editing?.number ?? ""}`}
                subtitle="Número, capacidad y zona del restaurante"
                bodyClassName="grid-cols-1 sm:grid-cols-3 [&_.w-80]:w-full"
                onEdit={handleSave}
                editLabel={editing === "new" ? "Crear mesa" : "Guardar"}
            >
                <Input
                    type="number"
                    name="number"
                    label="Número de la mesa"
                    htmlFor="table-number-setting"
                    variant="latte"
                    value={form.number}
                    min={1}
                    onChange={change}
                    error={errors.number}
                />
                <Input
                    type="number"
                    name="capacity"
                    label="Capacidad (personas)"
                    htmlFor="table-capacity"
                    variant="latte"
                    value={form.capacity}
                    min={1}
                    max={30}
                    onChange={change}
                    error={errors.capacity}
                />
                <Select
                    label="Zona"
                    name="zone"
                    htmlFor="table-zone"
                    value={form.zone}
                    placeholder={false}
                    options={zones.map((zone) => ({ value: zone, label: zone }))}
                    onChange={change}
                    error={errors.zone}
                    variant="latte"
                />
                <p className="sm:col-span-3 flex items-center gap-2 text-m3-body-small text-br-s800">
                    <Users size={14} /> La capacidad ayuda al mesero a elegir la mesa según el grupo.
                    <MapPin size={14} className="ml-2" /> Después la ubicas en el mapa con la herramienta Mesas.
                </p>
            </DetailModal>
        </div>
    );
}
