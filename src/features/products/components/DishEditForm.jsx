import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Input, Select, Button, Imageinput, Textarea } from "@/shared";
import { getDishCategories } from "@/services/selectServices";
import { useNavigate } from "react-router-dom";
import { dishUpdateSchema } from "@/shared/schemas/disheSchema.js";

export function DishEditForm({ dish }) {
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        dishName: dish.dishName || "",
        dishPrice: dish.dishPrice || "",
        dishCategory: dish.dishCategory || "",
        dishDescription: dish.dishDescription || "",
        dishImage: [],
        isEnabled: dish.isEnabled ?? true,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const toggleEnabled = () => {
        setFormData((prev) => ({
            ...prev,
            isEnabled: !prev.isEnabled,
        }));
    };

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

        try {
            
            alert("El menu ha sido actualizado correctamente");
            navigate("/viewDish");
        } catch (error) {
            console.log("Error: ", error.message);
            alert(error.message);
        }
    };

    useEffect(() => {
        getDishCategories().then(setCategories);
    }, []);

    return (
        <div className="min-h-screen flex flex-col">

            <div className="w-full bg-bg-s700 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 bg-bg-s900/90 border border-bd-w/15">
                <div className="w-8" />
                <h1 className="text-title text-bg-w font-bold text-center">
                    Actualizar plato
                </h1>
                <Button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="text-bg-w hover:text-bg-w/70 transition-colors"
                    aria-label="Volver"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>
            </div>

            <div className="flex-1 flex justify-center items-center px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
                <form
                    onSubmit={handleSubmit}
                    className="w-full mx-auto max-w-7xl flex flex-col lg:flex-row gap-6 lg:gap-10 w-1000"
                >

                    <div className="flex flex-col gap-4 sm:gap-6 lg:flex-1 lg:min-w-0 pt-25 pr-25">

                        <Input
                            type="text"
                            name="dishName"
                            label="Nombre del platillo"
                            placeholder="Escribe el nombre del plato"
                            htmlFor="dish-name"
                            variant="cafe"
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
                            variant="cafe"
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
                            variant="cafe"
                        />

                        <Textarea
                            name="dishDescription"
                            label="Descripcion (opcional)"
                            placeholder="Describe el plato: ingredientes, preparacion, etc."
                            htmlFor="dish-description"
                            variant="cafe"
                            value={formData.dishDescription}
                            onChange={handleChange}
                            error={errors.dishDescription}
                        />

                        <Button
                            variant={formData.isEnabled ? "statusActive" : "statusInactive"}
                            size="lgg"
                            type="button"
                            onClick={toggleEnabled}
                        >
                            {formData.isEnabled ? "Habilitado" : "Deshabilitado"}
                        </Button>

                    </div>

                    <div className="flex flex-col gap-4 sm:gap-6 lg:flex-1 lg:min-w-0">

                        <p className="text-caption text-secondary text-bg-w">
                            Foto del plato
                        </p>

                        <div className="flex items-center justify-center bg-bg-s900/50 border border-bd-w/15 rounded-2xl h-150 w-fit p-4">
                            <Imageinput
                                value={formData.dishImage}
                                onChange={(files) =>
                                    setFormData((prev) => ({ ...prev, dishImage: files }))
                                }
                                multiple={false}
                                variant="fifteenth"
                            />
                        </div>
                        <p className="text-caption text-bg-w/50">

                        </p>

                        <div className="flex gap-4">
                            <Button
                                variant="secondary"
                                size="lgg"
                                type="button"
                                onClick={() => navigate(-1)}
                            >
                                Cancelar
                            </Button>

                            <Button
                                variant="primary"
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