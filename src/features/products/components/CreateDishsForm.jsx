// src/features/products/components/CreateDishsForm.jsx
// Formulario para agregar un platillo al menu
import { useState, useEffect } from "react";
import { Input, Select, Button, Imageinput, Textarea, Navbar } from "@/shared";
import { getDishCategories } from "@/services/selectServices";
import { useNavigate } from "react-router-dom";
import { dishSchema } from "../../../shared/schemas/disheSchema";
import { showSuccesAlert, showUnexpectedErrorAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/fondo-dish.png";
import { menu } from "@/features/users/data/menu";

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

        // No pueden existir dos platillos con el mismo nombre en la misma categoria
        const categoryLabel = categories.find((category) => category.id === result.data.dishCategory)?.label ?? result.data.dishCategory;
        const duplicated = menu.some((item) => item.name.trim().toLowerCase() === result.data.dishName.trim().toLowerCase() && item.category === categoryLabel);
        if (duplicated) {
            setErrors({ dishName: "Ya existe un platillo con este nombre en la misma categoría" });
            return;
        }

        setErrors({});

        try {
         
            await showSuccesAlert({
                title: "Platillo registrado",
                text: "El platillo fue registrado correctamente",
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

    // Carga las categorias del select
    useEffect(() => {
        getDishCategories().then(setCategories);
    }, []);

    return (
        <div className="min-h-screen flex flex-col">

            <Navbar
                variant="banda"
                image={fotoFondo}
                title="Crear plato"
                onBack={() => navigate("/home")}
                actions={
                    <>
                        <Button variant="crema" size="sm" type="button" onClick={() => navigate("/listMenu")}>
                            Ver listado
                        </Button>
                    </>
                }
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

                        <div className="flex flex-col gap-2">
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
                            <Button
                                type="button"
                                onClick={() => navigate("/configuration")}
                                className="text-sm font-semibold text-br-t950 hover:underline self-start"
                                variant="enlace"
                            >
                                 Crear nueva categoria
                            </Button>
                        </div>

                        <Textarea
                            name="dishDescription"
                            label="Descripcion"
                            placeholder="Describe el plato: ingredientes, preparacion, etc."
                            htmlFor="dish-description"
                            variant="latte"
                            value={formData.dishDescription}
                            onChange={handleChange}
                            error={errors.dishDescription}
                        />
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
                        {errors.dishImage && (
                            <span className="inline-block rounded bg-red-50 px-2 py-0.5 text-red-900 font-medium text-sm">{errors.dishImage}</span>
                        )}

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
                                Guardar Plato
                            </Button>
                        </div>

                    </div>

                </form>
            </div>

        </div>
    );
}