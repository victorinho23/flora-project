// src/features/settings/pages/TablesSettingsPage.jsx
// Configuracion -> Mesas: dos pestañas
// - Lista: crear, editar y habilitar/deshabilitar las mesas (no se eliminan para no perder el historial)
// - Mapa: dibujar el negocio por pisos y ubicar las mesas, para que el mesero sepa a donde ir
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Pencil, Plus, Users, MapPin, List, Map as MapIcon, Layers } from "lucide-react";
import { DataTable, Navbar, Input, Select, Button, DetailModal, Switch } from "@/shared";
import { getAllTables, createTable, updateTable, updateTableStatus, saveTableMap, createTableFloor, deleteTableFloor } from "../services/tableService";
import RestaurantMapEditor from "../components/RestaurantMapEditor";
import { showConfirmAlert, showConfirmDeleteAlert, showSuccesAlert, showErrorAlert } from "@/shared/services/alertService";
import { useAccess } from "@/features/auth/services/accessService";
import fotoFondo from "@/assets/images/fondo-orders.png";

// datos vacios del formulario de la ventana
const EMPTY = { number: "", capacity: "4", zone: "Salón" };

export default function TablesSettingsPage() {
    const navigate = useNavigate();
    const can = useAccess();
    const [rows, setRows] = useState([]);
    const [zones, setZones] = useState([]);
    // pestaña de la pagina: lista de mesas o mapa del negocio
    const [tab, setTab] = useState("list");
    // pisos del mapa guardados (el editor trabaja sobre una copia hasta que se guarda) y el piso abierto
    const [maps, setMaps] = useState([]);
    const [floorId, setFloorId] = useState(null);
    // ventana para crear un piso
    const [floorForm, setFloorForm] = useState(null);
    // sube cada vez que se recarga, para que el editor del mapa arranque de nuevo con lo guardado
    const [version, setVersion] = useState(0);
    // si el backend falla (por ejemplo, falta correr una migracion) se muestra el motivo en vez del mapa
    const [loadError, setLoadError] = useState("");

    // ventana de crear / editar: editing = null (cerrada), "new" o la mesa que se edita
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});

    const load = () => getAllTables()
        .then((data) => {
            setRows(data.tables);
            setZones(data.zones);
            setMaps(data.maps);
            // si el piso abierto ya no existe (se borro) se abre el primero
            setFloorId((current) => (data.maps.some((floor) => floor.id === current) ? current : data.maps[0]?.id ?? null));
            setVersion((value) => value + 1);
            setLoadError("");
        })
        .catch((err) => {
            setLoadError(err.message);
            return showErrorAlert({ title: "No se pudieron cargar las mesas", text: err.message, confirmButtonText: "Entendido", timer: 4000 });
        });

    useEffect(() => {
        load();
    }, []);

    // resumen de arriba: cuantas mesas activas y cuantos puestos hay
    const active = rows.filter((table) => table.active);
    const seats = active.reduce((sum, table) => sum + table.capacity, 0);
    const onMap = active.filter((table) => table.floorId != null).length;
    const floor = maps.find((item) => item.id === floorId);

    const handleSaveMap = async (data) => {
        try {
            await saveTableMap(floorId, data);
            await load();
            await showSuccesAlert({ title: "Mapa guardado", text: "Los meseros ya lo ven al buscar las mesas", timer: 2000 });
        } catch (err) {
            await showErrorAlert({ title: "No se pudo guardar el mapa", text: err.message, confirmButtonText: "Entendido", timer: 4000 });
        }
    };

    // piso nuevo: se crea vacio y queda abierto para dibujarlo
    const handleCreateFloor = async () => {
        const name = floorForm.name.trim();
        if (!name) return setFloorForm((prev) => ({ ...prev, error: "Escribe el nombre del piso" }));
        try {
            const { mapId } = await createTableFloor(name);
            setFloorForm(null);
            setFloorId(mapId);
            await load();
        } catch (err) {
            setFloorForm((prev) => ({ ...prev, error: err.message }));
        }
    };

    const handleDeleteFloor = async () => {
        const result = await showConfirmDeleteAlert({
            title: `¿Eliminar ${floor.name}?`,
            text: "Se borra el dibujo de este piso y sus mesas quedan sin ubicar (las mesas no se borran).",
            confirmButtonText: "Eliminar piso",
        });
        if (!result.isConfirmed) return;
        try {
            await deleteTableFloor(floor.id);
            await load();
            await showSuccesAlert({ title: "Piso eliminado", timer: 2000 });
        } catch (err) {
            await showErrorAlert({ title: "No se pudo eliminar", text: err.message, confirmButtonText: "Entendido", timer: 4000 });
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

                {/* barra de navegacion de la pagina: la lista de mesas o el mapa del negocio */}
                <div role="tablist" aria-label="Secciones de mesas" className="grid grid-cols-2 gap-2 p-1.5 rounded-m3-full bg-bg-w border border-bd-s100 shadow-m3-1 sm:max-w-md">
                    {[
                        ["list", "Lista de mesas", List],
                        ["map", "Mapa del negocio", MapIcon],
                    ].map(([id, label, Icon]) => (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={tab === id}
                            onClick={() => setTab(id)}
                            className={`m3-state h-12 flex items-center justify-center gap-2 rounded-m3-full text-m3-label-large font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${tab === id ? "bg-bg-s950 text-bg-w shadow-m3-1" : "text-br-s900"}`}
                        >
                            <Icon size={18} />
                            {label}
                        </button>
                    ))}
                </div>

                {loadError && (
                    <p role="alert" className="rounded-m3-lg bg-m3-error-container text-m3-on-error-container px-5 py-4 font-semibold shadow-m3-1">
                        No se pudieron cargar las mesas: {loadError}
                    </p>
                )}

                {tab === "list" && <DataTable variant="cafe" data={rows} columns={columns} emptyText="Todavía no hay mesas" />}

                {tab === "map" && (
                    <div className="space-y-4">
                        {/* pisos del negocio: uno por pestaña, y el boton para agregar otro */}
                        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pisos del mapa">
                            <span className="flex items-center gap-1.5 mr-1 text-m3-title-small font-bold uppercase tracking-wider text-br-t950">
                                <Layers size={16} />
                                Pisos
                            </span>
                            {maps.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    aria-pressed={item.id === floorId}
                                    onClick={() => setFloorId(item.id)}
                                    className={`m3-state h-10 px-4 rounded-m3-full border text-m3-label-large font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus ${item.id === floorId ? "bg-m3-secondary-container text-m3-on-secondary-container border-transparent" : "bg-bg-w text-br-s950 border-bd-s300"}`}
                                >
                                    {item.name}
                                </button>
                            ))}
                            {can("mesas_actualizar") && (
                                <Button size="md" variant="contorno" type="button" onClick={() => setFloorForm({ name: `Piso ${maps.length + 1}`, error: "" })}>
                                    <Plus size={16} />
                                    Agregar piso
                                </Button>
                            )}
                        </div>

                        {floor && (
                            <RestaurantMapEditor
                                key={`${floor.id}-${version}`}
                                map={floor}
                                tables={rows}
                                floors={maps}
                                onSave={handleSaveMap}
                                onDelete={maps.length > 1 ? handleDeleteFloor : undefined}
                                canEdit={can("mesas_actualizar")}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* piso nuevo: solo el nombre */}
            <DetailModal
                open={Boolean(floorForm)}
                onClose={() => setFloorForm(null)}
                icon={Layers}
                title="Agregar piso"
                subtitle="Después lo dibujas y ubicas sus mesas"
                size="max-w-md"
                bodyClassName="grid-cols-1 [&_.w-80]:w-full"
                onEdit={handleCreateFloor}
                editLabel="Crear piso"
            >
                <Input
                    type="text"
                    name="floorName"
                    label="Nombre del piso"
                    htmlFor="new-floor-name"
                    variant="latte"
                    placeholder="Ej: Segundo piso, Terraza alta"
                    value={floorForm?.name ?? ""}
                    maxLength={40}
                    onChange={(e) => setFloorForm({ name: e.target.value, error: "" })}
                    error={floorForm?.error}
                />
            </DetailModal>

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
