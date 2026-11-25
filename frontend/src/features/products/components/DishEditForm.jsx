// src/features/products/components/DishEditForm.jsx
// Formulario para actualizar un platillo del menu
import { useState, useEffect, useMemo } from "react";
import { UtensilsCrossed, Eye, Tag, Pencil, Power, Image as ImageIcon } from "lucide-react";
import { Input, Select, Button, Imageinput, Textarea, Navbar, Card, ToggleSwitch } from "@/shared";
import imagenPorDefecto from "@/assets/images/menu.png";
import { getDishCategories } from "@/services/selectServices";
import { useNavigate } from "react-router-dom";
import { dishUpdateSchema } from "@/shared/schemas/disheSchema.js";
import { showSuccesAlert, showUnexpectedErrorAlert, showConfirmAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/fondo-dish.png";
import { updateDish } from "../services/dishService";

export function DishEditForm({ dish }) {
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);

    // Estado del formulario precargado con los datos actuales del platillo
    const [formData, setFormData] = useState({
        dishName: dish.dishName || "",
        dishPrice: dish.dishPrice || "",
        dishCategory: dish.dishCategory || "",
        dishDescription: dish.dishDescription || "",
        dishImage: [],
        isEnabled: dish.isEnabled ?? true,
    });

    // Actualiza el campo que cambio
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Habilita o inhabilita el platillo pidiendo confirmacion
    const toggleEnabled = async () => {
        const next = !formData.isEnabled;
        const result = await showConfirmAlert({
            title: `¿Deseas ${next ? "habilitar" : "inhabilitar"} el platillo?`,
            text: "El cambio se aplicará al guardar.",
            confirmButtonText: next ? "Habilitar" : "Inhabilitar",
        });
        if (!result.isConfirmed) return;
        setFormData((prev) => ({
            ...prev,
            isEnabled: next,
        }));
    };

    // Valida, revisa nombre repetido en la categoria y pide confirmacion antes de guardar
    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = dishUpdateSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        const confirmation = await showConfirmAlert({
            title: `¿Guardar los cambios de ${result.data.dishName}?`,
            text: "Se actualizará el platillo en el menú.",
            confirmButtonText: "Guardar cambios",
        });
        if (!confirmation.isConfirmed) return;

        try {
            // El backend revisa el nombre repetido y si el platillo esta en una orden en proceso
            await updateDish(dish.menuId, formData);
            await showSuccesAlert({
                title: "Menú actualizado",
                text: "El menú ha sido actualizado correctamente",
                timer: 3000,
            });
            navigate("/viewDish", { state: { id: dish.menuId }, replace: true });
        } catch (error) {
            console.log("Error: ", error.message);
            if (error.field) setErrors({ [error.field]: error.message });
            await showUnexpectedErrorAlert({
                text: error.message,
                timer: 3000,
            });
        }
    };

    useEffect(() => {
        getDishCategories().then(setCategories);
    }, []);

    // nombre de la categoria elegida, para la vista previa (Map -> busqueda directa)
    const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.label])), [categories]);

    // foto de la vista previa: la nueva si eligieron una, si no la actual, si no la general del menu
    const newImage = useMemo(() => (formData.dishImage[0] ? URL.createObjectURL(formData.dishImage[0]) : null), [formData.dishImage]);
    useEffect(() => () => {
        if (newImage) URL.revokeObjectURL(newImage);
    }, [newImage]);
    const previewImage = newImage ?? dish.imageUrl ?? imagenPorDefecto;

    const price = Number(formData.dishPrice) || 0;

    // estilos de cada fila de datos: titulo a la izquierda y campos a la derecha
    const rowBox = "grid grid-cols-1 md:grid-cols-[13rem_minmax(0,1fr)] gap-4 md:gap-6 py-6 border-b border-bd-s100 last:border-b-0";
    const rowTitle = "flex items-center gap-2 h-fit text-m3-title-small font-bold uppercase tracking-wider text-br-t950";

    return (
        <div className="min-h-screen flex flex-col">

            <Navbar
                variant="banda"
                image={fotoFondo}
                title="Actualizar plato"
                icon={UtensilsCrossed}
                onBack={() => navigate("/viewDish", { state: { id: dish.menuId } })}
                actions={
                    <Button variant="crema" size="sm" type="button" onClick={() => navigate("/listMenu")}>
                        Ver listado
                    </Button>
                }
            />

            <form
                onSubmit={handleSubmit}
                noValidate
                className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-wrap items-start gap-6 [&_.w-80]:w-full [&_textarea]:h-32"
            >

                {/* ===== Panel lateral: vista previa de la carta y la foto ===== */}
                <aside className="grow basis-72 lg:grow-0 lg:max-w-90 flex flex-col gap-4 p-6 bg-bg-w border border-bd-s100 rounded-m3-xl shadow-m3-1">
                    <h3 className={rowTitle}>
                        <Eye size={18} className="text-br-t900" />
                        Foto y vista previa
                    </h3>
                    <div className="flex justify-center">
                        <Card
                            product={{
                                title: formData.dishName || "Nombre del plato",
                                image: previewImage,
                                price,
                                description: formData.dishDescription || "La descripción aparecerá aquí.",
                            }}
                        />
                    </div>
                    <p className="text-center text-m3-label-large text-br-s800">
                        {categoryNames.get(formData.dishCategory) ?? "Sin categoría"}
                    </p>

                    {/* foto: la zona se ajusta al ancho del panel */}
                    <div className="w-full flex flex-col gap-2">
                        <span className="flex items-center gap-2 text-m3-label-large font-semibold text-br-s950">
                            <ImageIcon size={16} className="shrink-0" />
                            {"Cambiar foto (si no eliges otra, se conserva la actual)"}
                        </span>
                        <div className="w-full [&>div]:w-full [&_.border-dashed]:w-full [&_.border-dashed]:h-36 [&_.border-dashed]:shrink">
                            <Imageinput
                                value={formData.dishImage}
                                onChange={(files) => setFormData((prev) => ({ ...prev, dishImage: files }))}
                                multiple={false}
                                variant="latte"
                                formats={["png", "jpg", "jpeg", "webp"]}
                                maxSizeMB={5}
                            />
                        </div>
                        {errors.dishImage && (
                            <span className="self-start rounded-m3-xs bg-m3-error-container px-2 py-0.5 text-m3-on-error-container font-medium text-sm">{errors.dishImage}</span>
                        )}
                    </div>
                </aside>

                {/* ===== Datos: un bloque por fila, botones abajo ===== */}
                <div className="grow-[999] basis-[560px] min-w-0 flex flex-col">
                    <section className="px-6 sm:px-8 bg-bg-w border border-bd-s100 rounded-m3-xl shadow-m3-1">

                        <div className={rowBox}>
                            <h3 className={rowTitle}>
                                <UtensilsCrossed size={18} className="text-br-t900" />
                                Datos del plato
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_12rem] gap-4 items-start">
                                <Input
                                    type="text"
                                    name="dishName"
                                    label="Nombre del platillo"
                                    placeholder="Ej: Pizza hawaiana mediana"
                                    htmlFor="dish-name"
                                    variant="latte"
                                    value={formData.dishName}
                                    onChange={handleChange}
                                    error={errors.dishName}
                                    maxLength={60}
                                />
                                <div className="flex flex-col gap-1">
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        name="dishPrice"
                                        label="Precio (COP)"
                                        placeholder="Ej: 18000"
                                        htmlFor="dish-price"
                                        variant="latte"
                                        value={formData.dishPrice}
                                        onChange={(e) => handleChange({ target: { name: "dishPrice", value: e.target.value.replace(/\D/g, "") } })}
                                        error={errors.dishPrice}
                                    />
                                    <p className="text-m3-body-small text-br-s800" aria-live="polite">
                                        {price ? <>Se verá como <b>${price.toLocaleString("es-CO")}</b></> : "Solo números, sin puntos"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={rowBox}>
                            <h3 className={rowTitle}>
                                <Tag size={18} className="text-br-t900" />
                                Categoría
                            </h3>
                            <div className="flex flex-col gap-1">
                                <Select
                                    label="Categoría"
                                    name="dishCategory"
                                    value={formData.dishCategory}
                                    htmlFor="dishCategory"
                                    options={categories}
                                    onChange={handleChange}
                                    error={errors.dishCategory}
                                    variant="latte"
                                />
                            </div>
                        </div>

                        <div className={rowBox}>
                            <h3 className={rowTitle}>
                                <Pencil size={18} className="text-br-t900" />
                                Descripción
                            </h3>
                            <div className="flex flex-col gap-1">
                                <Textarea
                                    name="dishDescription"
                                    label="Descripción (opcional)"
                                    placeholder="Ingredientes, tamaño, acompañamientos..."
                                    htmlFor="dish-description"
                                    variant="latte"
                                    value={formData.dishDescription}
                                    onChange={handleChange}
                                    error={errors.dishDescription}
                                    maxLength={300}
                                />
                                <p className={`self-end text-m3-body-small ${formData.dishDescription.length > 280 ? "text-m3-error font-semibold" : "text-br-s800"}`}>
                                    {formData.dishDescription.length} / 300
                                </p>
                            </div>
                        </div>
                        {/* prender o apagar el platillo en la carta */}
                        <div className={rowBox}>
                            <h3 className={rowTitle}>
                                <Power size={18} className="text-br-t900" />
                                Estado en la carta
                            </h3>
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <p className="text-m3-body-medium text-br-s800 max-w-md">
                                    {formData.isEnabled ? "Visible en la carta y se puede pedir en las órdenes." : "Oculto: no aparece en la carta ni se puede pedir."}
                                </p>
                                <ToggleSwitch
                                    checked={formData.isEnabled}
                                    onChange={toggleEnabled}
                                    label={formData.isEnabled ? "Habilitado" : "Deshabilitado"}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-wrap justify-end gap-3 py-4">
                        <Button variant="crema" size="md" type="button" onClick={() => navigate("/viewDish", { state: { id: dish.menuId } })}>
                            Cancelar
                        </Button>
                        <Button variant="espresso" size="md" type="submit">
                            Guardar cambios
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default DishEditForm;
