// src/features/suppliers/components/SupplierRegisterForm.jsx
// Formulario para registrar un proveedor

import { useState, useEffect } from "react";
import { Input, Select, Checkbox, Button } from "@/shared";
import { getSupplierCategories } from "@/services/selectServices";
import { useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";
import { supplierSchema } from "../schemas/supplierSchema";

export default function SupplierRegisterForm() {

    const navigate = useNavigate();

    // Estado de errores de validacion por campo
    const [errors, setErrors] = useState({});

    // Estado del formulario
    const [formData, setFormData] = useState({
        companyName: "",
        nit: "",
        contactName: "",
        phone: "",
        email: "",
        address: "",
        category: "",
        isActive: true,
    });

    // Categorias disponibles para el select, cargadas desde el servicio
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        getSupplierCategories().then(setCategories);
    }, []);

    const handleChange = (e) => {
        // Se obtiene el nombre del campo y su valor
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            // Se copian todos los valores anteriores del estado
            ...prev,
            // Se actualiza unicamente lo que cambio
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        // Evita que el formulario recargue la pagina
        e.preventDefault();

        // Validamos los datos del formulario contra el esquema Zod
        // safeParse no lanza excepcion, retorna un objeto controlado
        const result = supplierSchema.safeParse(formData);

        // Si la validacion falla
        if (!result.success) {
            // Objeto donde almacenaremos los errores por campo
            const fieldErrors = {};

            // Recorremos cada error generado por Zod
            result.error.issues.forEach((issue) => {
                // issue.path[0] corresponde al nombre del campo
                // issue.message contiene el mensaje de error definido en el schema
                fieldErrors[issue.path[0]] = issue.message;
            });

            setErrors(fieldErrors);
            return;
        }

        // Si la validacion pasa limpiamos errores previos
        setErrors({});

        try {
            // Llamamos al servicio frontend que consume la API
            // result.data contiene los datos ya validados por Zod
            // const response = await createSupplier(result.data)

            // feedback basico al usuario
            alert("Proveedor creado correctamente");

            // Navegamos a la vista anterior
            navigate(-1);
        } catch (error) {
            // Capturamos errores de red o errores lanzados por el service
            console.log("Error: ", error.message);
            alert(error.message);
        }
    };

    return (
        <div className="p-6 lg:p-10 w-full">

            {/* Encabezado de la pantalla: icono, titulo y descripcion */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--color-primary-500)]/40">
                <div className="p-3 rounded-xl bg-[var(--color-primary-200)]">
                    <Truck size={26} className="text-[var(--color-tertiary-600)]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-secundary-900)]">Registrar proveedor</h1>
                    <p className="text-sm text-text-secondary">Agrega un nuevo proveedor y sus datos de contacto.</p>
                </div>
            </div>

            {/* Tarjeta clara que contiene el formulario */}
            <div className="bg-[var(--color-white)]/95 rounded-xl shadow-lg p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    <div className="flex flex-wrap gap-6">
                        <Input
                            label="Empresa"
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            placeholder="Nombre de la empresa"
                            htmlFor="supplier-company-name"
                            variant="secondary"
                            onChange={handleChange}
                            error={errors.companyName}
                        />

                        <Input
                            label="NIT"
                            type="text"
                            name="nit"
                            value={formData.nit}
                            placeholder="Ej: 900123456-1"
                            htmlFor="supplier-nit"
                            variant="secondary"
                            onChange={handleChange}
                            error={errors.nit}
                        />

                        <Input
                            label="Nombre de contacto"
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            placeholder="Nombre de la persona de contacto"
                            htmlFor="supplier-contact-name"
                            variant="secondary"
                            onChange={handleChange}
                            error={errors.contactName}
                        />
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <Input
                            label="Telefono"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            placeholder="Numero de telefono"
                            htmlFor="supplier-phone"
                            variant="secondary"
                            onChange={handleChange}
                            error={errors.phone}
                        />

                        <Input
                            label="Correo electronico"
                            type="email"
                            name="email"
                            value={formData.email}
                            placeholder="correo@empresa.com"
                            htmlFor="supplier-email"
                            variant="secondary"
                            onChange={handleChange}
                            error={errors.email}
                        />

                        <Select
                            label="Categoria"
                            name="category"
                            value={formData.category}
                            htmlFor="supplier-category"
                            options={categories}
                            onChange={handleChange}
                            error={errors.category}
                        />
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <Input
                            label="Direccion"
                            type="text"
                            name="address"
                            value={formData.address}
                            placeholder="Direccion de la empresa"
                            htmlFor="supplier-address"
                            variant="secondary"
                            onChange={handleChange}
                            error={errors.address}
                        />
                    </div>

                    <Checkbox
                        label="Proveedor activo"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                    />

                    <div className="flex justify-end">
                        <Button variant="primary" size="lg" type="submit">
                            Crear proveedor
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}
