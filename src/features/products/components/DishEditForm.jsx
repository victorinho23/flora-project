// src/features/products/components/DishEditForm.jsx
// Formulario para actualizar un platillo del menu
import { useState, useEffect } from "react";
import { Input, Select, Button, Imageinput, Textarea, Navbar } from "@/shared";
import { getDishCategories } from "@/services/selectServices";
import { useNavigate } from "react-router-dom";
import { dishUpdateSchema } from "@/shared/schemas/disheSchema.js";
import { showSuccesAlert, showUnexpectedErrorAlert, showConfirmAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/fondo-dish.png";
import { menu } from "@/features/users/data/menu";

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

        // No pueden existir dos platillos con el mismo nombre en la misma categoria
        const categoryLabel = categories.find((category) => category.id === result.data.dishCategory)?.label ?? result.data.dishCategory;
        const duplicated = menu.some((item) => item.id !== dish.menuId && item.name.trim().toLowerCase() === result.data.dishName.trim().toLowerCase() && item.category === categoryLabel);
        if (duplicated) {
            setErrors({ dishName: "Ya existe un platillo con este nombre en la misma categoría" });
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
            
            await showSuccesAlert({
                title: "Menú actualizado",
                text: "El menú ha sido actualizado correctamente",
                timer: 3000,
            });
            navigate("/viewDish");
        } catch (error) {
            console.log("Error: ", error.message);
            await showUnexpectedErrorAlert({
                text: error.message,
                timer: 3000,
            });
        }
    };

    useEffect(() => {
        getDishCategories().then(setCategories);
    }, []);

    return (
        <div className="min-h-screen flex flex-col">

            <Navbar
                variant="banda"
                image={fotoFondo}
                title="Actualizar plato"
                onBack={() => navigate(-1)}
                backSide="right"
            />

            <div className="flex-1 flex justify-center items-center px-4 sm:px-8 py-6 xl:py-4">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start gap-6 bajo:gap-4 [&_.w-80]:w-full"
                >

                    <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] p-4 sm:p-5 bajo:sm:p-4 bajo:[&_textarea]:h-48">
                        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                            <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                            Datos del plato
                        </h2>
                        <Input
                            type="text"
                            name="dishName"
                            label="Nombre del platillo"
                            placeholder="Escribe el nombre del plato"
                            htmlFor="dish-name"
                            variant="latte"
                            value={formData.dishName}
                            onChange={handleChange}
                            error={errors.dishName}
                        />

                        <Input
                            type="text"
                            name="dishPrice"
                            label="Precio"
                            placeholder="Escribe el precio"
                            htmlFor="dish-price"
                            variant="latte"
                            value={formData.dishPrice}
                            onChange={handleChange}
                            error={errors.dishPrice}
                        />

                        <Select
                            label="Categoria"
                            name="dishCategory"
                            value={formData.dishCategory}
                            htmlFor="dishCategory"
                            options={categories}
                            onChange={handleChange}
                            error={errors.dishCategory}
                            variant="latte"
                        />

                        <Textarea
                            name="dishDescription"
                            label="Descripcion (opcional)"
                            placeholder="Describe el plato: ingredientes, preparacion, etc."
                            htmlFor="dish-description"
                            variant="latte"
                            value={formData.dishDescription}
                            onChange={handleChange}
                            error={errors.dishDescription}
                        />

                        <div className="flex justify-center sm:justify-start">
                            <Button
                                variant={formData.isEnabled ? "statusActive" : "statusInactive"}
                                size="lgg"
                                type="button"
                                onClick={toggleEnabled}
                            >
                                {formData.isEnabled ? "Habilitado" : "Deshabilitado"}
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 items-center">

                        <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] p-4 sm:p-5 bajo:sm:p-4 items-center">
                            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                                <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                                Foto del plato
                            </h2>
                            <Imageinput
                                value={formData.dishImage}
                                onChange={(files) =>
                                    setFormData((prev) => ({ ...prev, dishImage: files }))
                                }
                                multiple={false}
                                variant="latte"
                                formats={["png", "jpg", "jpeg", "webp"]}
                                maxSizeMB={5}
                            />
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                variant="crema"
                                size="lgg"
                                type="button"
                                onClick={() => navigate(-1)}
                            >
                                Cancelar
                            </Button>

                            <Button
                                variant="espresso"
                                size="lgg"
                                type="submit"
                            >
                                Guardar cambios
                            </Button>
                        </div>

                    </div>

                </form>
            </div>

        </div>
    );
}

export default DishEditForm;