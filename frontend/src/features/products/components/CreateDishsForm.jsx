// src/features/products/components/CreateDishsForm.jsx
// Formulario para agregar un platillo al menu
import { useState, useEffect, useMemo } from "react";
import { Input, Select, Button, Imageinput, Textarea, Navbar, Card } from "@/shared";
import { UtensilsCrossed, Eye, Plus, Tag, Pencil, Image as ImageIcon } from "lucide-react";
import { getDishCategories } from "@/services/selectServices";
import { useNavigate } from "react-router-dom";
import { dishSchema } from "../../../shared/schemas/disheSchema";
import { showSuccesAlert, showUnexpectedErrorAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/fondo-dish.png";
import { createDish } from "../services/dishService";
import { useAccess } from "@/features/auth/services/accessService";
import imagenPorDefecto from "@/assets/images/menu.png";


export default function CreateDishsForm() {
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);

    // Estado del formulario, el platillo queda habilitado por defecto
    const [formData, setFormData] = useState({
        dishName: "",
        dishPrice: "",
        dishCategory: "",
        dishDescription: "",
        dishImage: [],
        isEnabled: true,
    });

    // Actualiza el campo que cambio
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Valida el formulario, revisa que no se repita el nombre en la categoria y confirma el registro
    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = dishSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        try {
            // El backend revisa que no se repita el nombre en la misma categoria
            const response = await createDish(formData);
            await showSuccesAlert({
                title: "Platillo registrado",
                text: "El platillo fue registrado correctamente",
                timer: 3000,
            });
            navigate("/viewDish", { state: { id: response.dishId }, replace: true });
        } catch (error) {
            console.log("Error: ", error.message);
            if (error.field) setErrors({ [error.field]: error.message });
            await showUnexpectedErrorAlert({
                text: error.message,
                timer: 3000,
            });
        }
    };

    const can = useAccess();

    // nombre de la categoria elegida, para la vista previa (Map -> busqueda directa)
    const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.label])), [categories]);

    // foto elegida para la vista previa; la url temporal se libera cuando cambia la foto
    const previewImage = useMemo(() => (formData.dishImage[0] ? URL.createObjectURL(formData.dishImage[0]) : imagenPorDefecto), [formData.dishImage]);
    useEffect(() => () => {
        if (previewImage !== imagenPorDefecto) URL.revokeObjectURL(previewImage);
    }, [previewImage]);

    const price = Number(formData.dishPrice) || 0;

    // Carga las categorias del select
    useEffect(() => {
        getDishCategories().then(setCategories);
    }, []);

    // estilos de cada fila de datos: titulo a la izquierda y campos a la derecha
    const rowBox = "grid grid-cols-1 md:grid-cols-[13rem_minmax(0,1fr)] gap-4 md:gap-6 py-6 border-b border-bd-s100 last:border-b-0";
    const rowTitle = "flex items-center gap-2 h-fit text-m3-title-small font-bold uppercase tracking-wider text-br-t950";

    return (
        <div className="min-h-screen flex flex-col">

            <Navbar
                variant="banda"
                image={fotoFondo}
                title="Crear plato"
                icon={UtensilsCrossed}
                onBack={() => navigate("/listMenu")}
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
                            {"Foto del plato (JPG, PNG o WEBP, máx. 5 MB)"}
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
                                {can("menu_agregar") && (
                                    <Button
                                        type="button"
                                        onClick={() => navigate("/categories")}
                                        className="m3-state self-start flex items-center gap-1 px-3 py-1.5 rounded-m3-full text-m3-label-large font-semibold text-br-t950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus"
                                        variant="enlace"
                                    >
                                        <Plus size={16} />
                                        Gestionar categorías
                                    </Button>
                                )}
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
                                    label="Descripción"
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
                    </section>

                    <div className="flex flex-wrap justify-end gap-3 py-4">
                        <Button variant="crema" size="md" type="button" onClick={() => navigate("/listMenu")}>
                            Cancelar
                        </Button>
                        <Button variant="espresso" size="md" type="submit">
                            Guardar plato
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
