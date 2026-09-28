// src/features/suppliers/components/SupplierRegisterForm.jsx
// Formulario para registrar un proveedor

import { useState, useEffect } from "react";
import { Input, Select, Checkbox, Textarea, Button } from "@/shared";
import { getSupplierCategories, getSupplierDocumentTypes } from "@/services/selectServices";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, List } from "lucide-react";
import { supplierSchema } from "../schemas/supplierSchema";
import { inventory } from "@/features/inventory/data/inventory";
import authBg from "@/assets/images/suppliers.png";
import { showSuccesAlert, showUnexpectedErrorAlert } from "@/shared/services/alertService";

// Solo se ofrecen productos activos del inventario para asociar al proveedor
const availableProducts = inventory.filter((item) => item.status === "Disponible");

// Label + campo. Se usa en lugar del label interno de cada componente
// porque ese label es de 8px (text-caption) y en el Select sale blanco sobre blanco.
function Field({ label, htmlFor, className = "", children }) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <label htmlFor={htmlFor} className="text-sm font-semibold text-br-s900">
                {label}
            </label>
            {children}
        </div>
    );
}

// Titulo de cada bloque del formulario
function SectionTitle({ children }) {
    return (
        <h2 className="flex items-center gap-2 text-base md:text-lg font-bold text-br-s900 border-b border-bd-p400 pb-2">
            <span className="w-1.5 h-5 rounded-full bg-br-t600" aria-hidden="true" />
            {children}
        </h2>
    );
}

export default function SupplierRegisterForm() {

    const navigate = useNavigate();

    // Estado de errores de validacion por campo
    const [errors, setErrors] = useState({});

    // Estado del formulario
    const [formData, setFormData] = useState({
        companyName: "",
        documentType: "",
        documentNumber: "",
        products: [],
        phone: "",
        email: "",
        address: "",
        category: "",
        observations: "",
        isActive: true,
    });

    // Categorias y tipos de documento disponibles para los select, cargados desde el servicio
    const [categories, setCategories] = useState([]);
    const [documentTypes, setDocumentTypes] = useState([]);

    useEffect(() => {
        getSupplierCategories().then(setCategories);
    }, []);

    useEffect(() => {
        getSupplierDocumentTypes().then(setDocumentTypes);
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

    // Selecciona o quita un producto de la lista de productos que suministra el proveedor
    const toggleProduct = (productId) => {
        setFormData((prev) => ({
            ...prev,
            products: prev.products.includes(productId)
                ? prev.products.filter((id) => id !== productId)
                : [...prev.products, productId],
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
            await showSuccesAlert({
                title: "Proveedor registrado",
                text: "El proveedor fue registrado correctamente",
                timer: 3000,
            });

            // Navegamos a la vista anterior
            navigate(-1);
        } catch (error) {
            // Capturamos errores de red o errores lanzados por el service
            console.log("Error: ", error.message);
            await showUnexpectedErrorAlert({
                text: error.message,
                timer: 3000,
            });
        }
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center gap-6 md:gap-8 bg-cover bg-center md:bg-fixed px-3 sm:px-6 py-6 md:py-8"
            style={{ backgroundImage: `url(${authBg})` }}
        >
                {/* Encabezado de la pantalla: ocupa todo el ancho */}
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-bd-t400 bg-bg-t50/97 backdrop-blur-xl shadow-xl p-5 md:px-8 md:py-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 md:p-4 rounded-xl bg-[var(--color-primary-200)] shrink-0">
                            <Truck className="w-7 h-7 md:w-8 md:h-8 text-[var(--color-tertiary-600)]" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-secundary-900)]">
                                Registrar proveedor
                            </h1>
                            <p className="text-sm md:text-base text-br-s700">
                                Agrega un nuevo proveedor y sus datos de contacto.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                        {/* Cafe oscuro sobre crema: mucho mas contraste que el caramelo */}
                        <Button variant="primary" size="md" type="button" onClick={() => navigate("/listSuppliers")}>
                            <List className="w-5 h-5" />
                            Ver proveedores
                        </Button>

                        <button
                            type="button"
                            onClick={() => navigate("/home")}
                            className="p-2 rounded-full text-[var(--color-secundary-900)] hover:bg-bg-t100 transition-colors"
                            aria-label="Volver al inicio"
                        >
                            <ArrowLeft className="w-7 h-7" />
                        </button>
                    </div>
                </div>

                
                <div className="w-full bg-[var(--color-white)]/97 backdrop-blur-xl rounded-2xl border border-bd-p400 shadow-2xl p-5 sm:p-8 md:p-10">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-8 md:gap-10">

                        {/* ===== Datos de la empresa ===== */}
                        <section className="flex flex-col gap-5">
                            <SectionTitle>Datos de la empresa</SectionTitle>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-5">
                                <Field label="Empresa" htmlFor="supplier-company-name" className="md:col-span-2">
                                    <Input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        placeholder="Nombre de la empresa"
                                        htmlFor="supplier-company-name"
                                        variant="secondary"
                                        fullWidth
                                        onChange={handleChange}
                                        error={errors.companyName}
                                    />
                                </Field>

                                <Field label="Tipo de documento" htmlFor="supplier-document-type">
                                    <Select
                                        name="documentType"
                                        value={formData.documentType}
                                        htmlFor="supplier-document-type"
                                        options={documentTypes}
                                        fullWidth
                                        onChange={handleChange}
                                        error={errors.documentType}
                                    />
                                </Field>

                                <Field label="Número de documento" htmlFor="supplier-document-number">
                                    <Input
                                        type="text"
                                        name="documentNumber"
                                        value={formData.documentNumber}
                                        placeholder="Ej: 900123456"
                                        htmlFor="supplier-document-number"
                                        variant="secondary"
                                        fullWidth
                                        onChange={handleChange}
                                        error={errors.documentNumber}
                                    />
                                </Field>

                                <Field label="Categoría"            htmlFor="supplier-category">
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        htmlFor="supplier-category"
                                        options={categories}
                                        fullWidth
                                        onChange={handleChange}
                                        error={errors.category}
                                    />
                                </Field>
                            </div>
                        </section>

                       
                        <section className="flex flex-col gap-5">
                            <SectionTitle>Contacto</SectionTitle>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-5">
                                <Field label="Teléfono" htmlFor="supplier-phone">
                                    <Input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        placeholder="Número de teléfono"
                                        htmlFor="supplier-phone"
                                        variant="secondary"
                                        fullWidth
                                        onChange={handleChange}
                                        error={errors.phone}
                                    />
                                </Field>

                                <Field label="Correo electrónico" htmlFor="supplier-email">
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        placeholder="correo@empresa.com"
                                        htmlFor="supplier-email"
                                        variant="secondary"
                                        fullWidth
                                        onChange={handleChange}
                                        error={errors.email}
                                    />
                                </Field>

                                <Field label="Dirección (opcional)" htmlFor="supplier-address" className="md:col-span-2 xl:col-span-1">
                                    <Input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        placeholder="Dirección de la empresa"
                                        htmlFor="supplier-address"
                                        variant="secondary"
                                        fullWidth
                                        onChange={handleChange}
                                        error={errors.address}
                                    />
                                </Field>
                            </div>
                        </section>

                        <section className="flex flex-col gap-5">
                            <SectionTitle>Productos y notas</SectionTitle>

                            <div className="flex flex-col gap-1.5">
                                <span className="text-sm font-semibold text-br-s900">
                                    Productos que suministra (opcional)
                                </span>

                            
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 rounded-lg border border-bd-p400 bg-bg-p50 p-4 max-h-56 overflow-y-auto [&_input]:accent-[var(--color-tertiary-600)] [&_label]:text-br-s900">
                                    {availableProducts.map((product) => (
                                        <Checkbox
                                            key={product.id}
                                            id={`supplier-product-${product.id}`}
                                            label={product.name}
                                            checked={formData.products.includes(product.id)}
                                            onChange={() => toggleProduct(product.id)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Field label="Observaciones (opcional)" htmlFor="supplier-observations">
                                <Textarea
                                    name="observations"
                                    value={formData.observations}
                                    placeholder="Notas internas sobre el proveedor"
                                    htmlFor="supplier-observations"
                                    variant="secondary"
                                    onChange={handleChange}
                                    error={errors.observations}
                                />
                            </Field>
                        </section>

                        {/* ===== Estado y accion final ===== */}
                        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-5 border-t border-bd-p400 pt-6">
                            <div className="[&_input]:accent-[var(--color-tertiary-600)] [&_label]:text-br-s900 [&_label]:text-base">
                                <Checkbox
                                    id="supplier-is-active"
                                    label="Proveedor activo"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex justify-center sm:justify-end">
                                <Button variant="primary" size="lg" type="submit">
                                    Crear proveedor
                                </Button>
                            </div>
                        </div>

                    </form>
                </div>
        </div>
    );
}