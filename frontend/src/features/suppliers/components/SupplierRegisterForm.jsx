// src/features/suppliers/components/SupplierRegisterForm.jsx
// Formulario para registrar un proveedor

import { useState, useEffect } from "react";
import { Input, Select, Checkbox, Textarea, Button } from "@/shared";
import { getSupplierCategories, getSupplierDocumentTypes } from "@/services/selectServices";
import { useNavigate, useLocation } from "react-router-dom";
import { createSupplier, updateSupplier } from "../services/supplierService";
import { Truck, Building2, Phone, Check, ChevronLeft, ChevronRight, ArrowLeft, Lightbulb } from "lucide-react";
import { supplierSchema } from "../schemas/supplierSchema";
import { getInventoryOptions } from "@/features/inventory/services/inventoryService";
import { showSuccesAlert, showUnexpectedErrorAlert, showConfirmAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/suppliers.png";


export default function SupplierRegisterForm() {

    const navigate = useNavigate();
    // Si llega un proveedor por navegacion el formulario funciona en modo edicion
    const editing = useLocation().state?.supplier;

    // productos del inventario que llegan del backend
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        getInventoryOptions().then(setInventory).catch(console.error);
    }, []);

    // Solo se ofrecen productos activos del inventario para asociar al proveedor
    // En edicion tambien se muestran los productos ya asociados aunque no esten disponibles
    const productOptions = inventory.filter((item) => item.status === "Disponible" || editing?.products.includes(item.id));

    // Estado de errores de validacion por campo
    const [errors, setErrors] = useState({});

    // Estado del formulario
    const [formData, setFormData] = useState(() => ({
        companyName: editing?.companyName ?? "",
        documentType: editing?.documentType ?? "",
        documentNumber: editing ? String(editing.nit).replace(/\D/g, "") : "",
        products: editing?.products ?? [],
        phone: editing?.phone ?? "",
        email: editing?.email ?? "",
        address: editing?.address ?? "",
        category: editing?.category ?? "",
        observations: editing?.observations ?? "",
        isActive: editing?.isActive ?? true,
    }));

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
        // Un proveedor inhabilitado no puede asociarse con productos nuevos
        if (!formData.isActive && !formData.products.includes(productId)) {
            setErrors((prev) => ({ ...prev, products: "Un proveedor inhabilitado no puede asociarse con nuevos productos" }));
            return;
        }
        setFormData((prev) => ({
            ...prev,
            products: prev.products.includes(productId)
                ? prev.products.filter((id) => id !== productId)
                : [...prev.products, productId],
        }));
    };

    // Pasos del formulario y los campos que se revisan en cada uno
    const steps = [
        { title: "Empresa", description: "Nombre, documento y categoría", fields: ["companyName", "documentType", "documentNumber", "category"] },
        { title: "Contacto", description: "Teléfono, correo y dirección", fields: ["phone", "email", "address"] },
        { title: "Productos y notas", description: "Lo que le compras y observaciones", fields: ["products", "observations", "isActive"] },
    ];

    // Paso en el que va el usuario (0, 1 o 2)
    const [step, setStep] = useState(0);
    const isLastStep = step === steps.length - 1;

    // Pasa los errores de Zod a un objeto { campo: mensaje }
    const toFieldErrors = (issues) => {
        const fieldErrors = {};
        issues.forEach((issue) => {
            fieldErrors[issue.path[0]] = issue.message;
        });
        return fieldErrors;
    };

    // Revisa solo los campos del paso actual antes de dejar avanzar
    const validateStep = (index) => {
        const fields = Object.fromEntries(steps[index].fields.map((field) => [field, true]));
        const result = supplierSchema.pick(fields).safeParse(formData);
        if (result.success) return true;
        setErrors(toFieldErrors(result.error.issues));
        return false;
    };

    const goNext = () => {
        if (!validateStep(step)) return;
        setErrors({});
        setStep((prev) => prev + 1);
    };

    const goBack = () => {
        setErrors({});
        setStep((prev) => prev - 1);
    };

    // Desde la barra de pasos se puede volver a uno anterior, y avanzar solo si el actual esta bien
    const goToStep = (index) => {
        if (index < step) {
            setErrors({});
            setStep(index);
        } else if (index === step + 1) {
            goNext();
        }
    };

    const handleSubmit = async (e) => {
        // Evita que el formulario recargue la pagina
        e.preventDefault();

        // Con Enter en los primeros pasos solo se avanza al siguiente
        if (!isLastStep) {
            goNext();
            return;
        }

        // Validamos todo el formulario contra el esquema Zod
        // safeParse no lanza excepcion, retorna un objeto controlado
        const result = supplierSchema.safeParse(formData);

        // Si algo falla se regresa al primer paso que tenga un error
        if (!result.success) {
            const fieldErrors = toFieldErrors(result.error.issues);
            setErrors(fieldErrors);
            const stepWithError = steps.findIndex((s) => s.fields.some((field) => fieldErrors[field]));
            if (stepWithError !== -1) setStep(stepWithError);
            return;
        }

        // Si la validacion pasa limpiamos errores previos
        setErrors({});

        // En edicion pide confirmacion antes de guardar
        if (editing) {
            const confirmation = await showConfirmAlert({
                title: `¿Guardar los cambios de ${result.data.companyName}?`,
                text: "Se actualizará la información del proveedor.",
                confirmButtonText: "Guardar cambios",
            });
            if (!confirmation.isConfirmed) return;
            try {
                // El backend revisa que el numero de documento no lo tenga otro proveedor
                await updateSupplier(editing.id, result.data);
            } catch (error) {
                showBackendError(error);
                await showUnexpectedErrorAlert({ text: error.message, timer: 3000 });
                return;
            }
            await showSuccesAlert({
                title: "Proveedor actualizado",
                text: "Proveedor actualizado correctamente.",
                timer: 2500,
            });
            navigate("/listSuppliers");
            return;
        }

        try {
            // result.data contiene los datos ya validados por Zod
            await createSupplier(result.data);

            await showSuccesAlert({
                title: "Proveedor registrado",
                text: "Proveedor registrado correctamente.",
                timer: 3000,
            });

            navigate("/listSuppliers");
        } catch (error) {
            showBackendError(error);
            await showUnexpectedErrorAlert({
                text: error.message,
                timer: 3000,
            });
        }
    };

    // Si el backend dice que campo fallo (ej: documento repetido) se marca y se lleva a su paso
    const showBackendError = (error) => {
        if (!error.field) return;
        setErrors({ [error.field]: error.message });
        const stepWithError = steps.findIndex((s) => s.fields.includes(error.field));
        if (stepWithError !== -1) setStep(stepWithError);
    };

    // Textos legibles para el resumen de los pasos ya llenos
    const categoryLabel = categories.find((c) => (c.value ?? c.id) === formData.category)?.label ?? formData.category;

    // A donde lleva la flecha de volver
    const backTo = editing ? "/listSuppliers" : "/home";

    return (
        <div className="min-h-screen lg:h-screen w-full grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] bg-bg-w">

            {/* Lado izquierdo: foto con el titulo y los pasos (solo en pantallas grandes) */}
            <aside
                className="hidden lg:flex flex-col justify-between gap-8 p-10 bajo:p-7 text-bg-w bg-cover bg-center"
                style={{ backgroundImage: `linear-gradient(160deg, color-mix(in srgb, var(--color-bg-s950) 88%, transparent), color-mix(in srgb, var(--color-bg-t950) 80%, transparent)), url(${fotoFondo})` }}
            >
                <div className="flex items-center justify-between gap-4">
                    <Button type="button" onClick={() => navigate(backTo)} className="flex items-center gap-2 text-sm font-semibold text-bg-w/90 hover:text-bg-w">
                        <ArrowLeft size={18} />
                        {editing ? "Proveedores" : "Inicio"}
                    </Button>
                    <Button variant="sex" size="sm" type="button" onClick={() => navigate("/listSuppliers")}>
                        Ver proveedores
                    </Button>
                </div>

                <div className="flex flex-col gap-8 bajo:gap-5">
                    <div>
                        <span className="w-14 h-14 rounded-2xl bg-bg-w/10 ring-1 ring-bd-w/25 grid place-items-center text-br-t200">
                            <Truck size={26} />
                        </span>
                        <h1 className="text-4xl bajo:text-3xl font-bold mt-5 bajo:mt-3">
                            {editing ? "Actualizar proveedor" : "Registrar proveedor"}
                        </h1>
                        <p className="text-br-p100 mt-2 max-w-sm">
                            {editing
                                ? `Editando ${editing.companyName}. Puedes moverte entre los pasos.`
                                : "Tres pasos cortos. Puedes volver a cualquiera sin perder lo que escribiste."}
                        </p>
                    </div>

                    {/* Pasos en vertical: se puede volver a uno anterior dando clic */}
                    <ol className="flex flex-col">
                        {steps.map((item, index) => (
                            <li key={item.title} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <Button
                                        type="button"
                                        onClick={() => goToStep(index)}
                                        className={`w-10 h-10 rounded-full grid place-items-center font-bold transition-colors ${
                                            index < step
                                                ? "bg-bg-t900 text-bg-w"
                                                : index === step
                                                    ? "bg-bg-w text-br-s950"
                                                    : "border border-bd-w/40 text-bg-w/70"
                                        }`}
                                    >
                                        {index < step ? <Check size={18} /> : index + 1}
                                    </Button>
                                    {index < steps.length - 1 && (
                                        <span className={`w-0.5 h-10 bajo:h-6 ${index < step ? "bg-bg-t800" : "bg-bg-w/25"}`} />
                                    )}
                                </div>
                                <div className="pt-1.5">
                                    <p className={`font-semibold ${index <= step ? "text-bg-w" : "text-bg-w/70"}`}>{item.title}</p>
                                    <p className="text-sm text-br-p100/80">{item.description}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>

                <p className="flex items-center gap-2 text-sm text-br-p100">
                    <Lightbulb size={16} className="shrink-0" />
                    Un proveedor inactivo no se puede asociar con productos nuevos.
                </p>
            </aside>

            {/* Lado derecho: el formulario del paso actual */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col min-h-screen lg:min-h-0 lg:overflow-y-auto p-5 sm:p-10 xl:p-12 bajo:xl:py-8"
            >
                {/* Encabezado corto para celular y tablet, donde no se ve la foto */}
                <div className="lg:hidden flex items-center justify-between gap-3 mb-6">
                    <Button type="button" onClick={() => navigate(backTo)} className="flex items-center gap-2 text-sm font-semibold text-br-s950">
                        <ArrowLeft size={18} />
                        {editing ? "Actualizar proveedor" : "Registrar proveedor"}
                    </Button>
                    <Button variant="crema" size="sm" type="button" onClick={() => navigate("/listSuppliers")}>
                        Ver proveedores
                    </Button>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-7 bajo:gap-5 max-w-2xl w-full mx-auto">

                    {/* Resumen de lo que ya se lleno, para no perderlo de vista */}
                    {step > 0 && (
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="rounded-xl border border-bd-s100 bg-bg-s50 px-4 py-3 flex items-center gap-3">
                                <Building2 size={18} className="shrink-0 text-br-t900" />
                                <span className="text-br-s950">
                                    <b>{formData.companyName}</b> · {formData.documentType} {formData.documentNumber} · {categoryLabel}
                                </span>
                            </div>
                            {step > 1 && (
                                <div className="rounded-xl border border-bd-s100 bg-bg-s50 px-4 py-3 flex items-center gap-3">
                                    <Phone size={18} className="shrink-0 text-br-t900" />
                                    <span className="text-br-s950">{formData.phone} · {formData.email}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-br-t900">Paso {step + 1} de {steps.length}</p>
                        <h2 className="text-3xl bajo:text-2xl font-bold text-br-s950 mt-1">
                            {step === 0 && "Datos de la empresa"}
                            {step === 1 && "¿Cómo lo contactamos?"}
                            {step === 2 && "¿Qué productos suministra?"}
                        </h2>
                        <p className="text-sm text-br-s800 mt-1">
                            {step === 0 && "Nombre, documento y categoría del proveedor."}
                            {step === 1 && "Teléfono y correo son obligatorios; la dirección es opcional."}
                            {step === 2 && "Elige los productos del inventario que le compras a este proveedor (opcional)."}
                        </p>
                    </div>

                    {/* Paso 1: empresa */}
                    {step === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 [&_.w-80]:w-full">
                            <div className="md:col-span-2">
                                <Input
                                    label="Empresa"
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    placeholder="Nombre de la empresa"
                                    htmlFor="supplier-company-name"
                                    variant="latte"
                                    fullWidth
                                    onChange={handleChange}
                                    error={errors.companyName}
                                />
                            </div>

                            <Select
                                label="Tipo de documento"
                                name="documentType"
                                value={formData.documentType}
                                htmlFor="supplier-document-type"
                                options={documentTypes}
                                variant="latte"
                                fullWidth
                                onChange={handleChange}
                                error={errors.documentType}
                            />

                            <Input
                                label="Número de documento"
                                type="text"
                                name="documentNumber"
                                value={formData.documentNumber}
                                placeholder="Ej: 900123456"
                                htmlFor="supplier-document-number"
                                variant="latte"
                                fullWidth
                                onChange={handleChange}
                                error={errors.documentNumber}
                            />

                            <div className="md:col-span-2">
                                <Select
                                    label="Categoría"
                                    name="category"
                                    value={formData.category}
                                    htmlFor="supplier-category"
                                    options={categories}
                                    variant="latte"
                                    fullWidth
                                    onChange={handleChange}
                                    error={errors.category}
                                />
                            </div>
                        </div>
                    )}

                    {/* Paso 2: contacto */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 [&_.w-80]:w-full">
                            <Input
                                label="Teléfono"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                placeholder="Número de teléfono"
                                htmlFor="supplier-phone"
                                variant="latte"
                                fullWidth
                                onChange={handleChange}
                                error={errors.phone}
                            />

                            <Input
                                label="Correo electrónico"
                                type="email"
                                name="email"
                                value={formData.email}
                                placeholder="correo@empresa.com"
                                htmlFor="supplier-email"
                                variant="latte"
                                fullWidth
                                onChange={handleChange}
                                error={errors.email}
                            />

                            <div className="md:col-span-2">
                                <Input
                                    label="Dirección (opcional)"
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    placeholder="Dirección de la empresa"
                                    htmlFor="supplier-address"
                                    variant="latte"
                                    fullWidth
                                    onChange={handleChange}
                                    error={errors.address}
                                />
                            </div>
                        </div>
                    )}

                    {/* Paso 3: productos, notas y estado */}
                    {step === 2 && (
                        <div className="flex flex-col gap-5 bajo:gap-3 [&_textarea]:h-28 bajo:[&_textarea]:h-20">
                            <div className="flex flex-col gap-2">
                                {productOptions.length ? (
                                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                                        {productOptions.map((product) => (
                                            <Checkbox
                                                key={product.id}
                                                id={`supplier-product-${product.id}`}
                                                label={product.status === "Disponible" ? product.name : `${product.name} (${product.status})`}
                                                variant="chipLatte"
                                                checked={formData.products.includes(product.id)}
                                                onChange={() => toggleProduct(product.id)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="rounded-xl border border-dashed border-bd-s300 bg-bg-s50 px-4 py-3 text-sm text-br-s900">
                                        Aún no hay productos disponibles en el inventario. Puedes crear el proveedor y asociarle productos después.
                                    </p>
                                )}
                                {errors.products && (
                                    <p className="text-sm inline-block self-start px-2 py-0.5 rounded bg-red-50 text-red-900 font-medium">{errors.products}</p>
                                )}
                            </div>

                            <Textarea
                                label="Observaciones (opcional)"
                                name="observations"
                                value={formData.observations}
                                placeholder="Notas internas sobre el proveedor"
                                htmlFor="supplier-observations"
                                variant="latte"
                                onChange={handleChange}
                                error={errors.observations}
                            />

                            <Checkbox
                                variant="latte"
                                id="supplier-is-active"
                                label="Proveedor activo"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    

                
                </div>

                {/* Botones para moverse entre pasos, siempre abajo */}
                <div className="max-w-2xl w-full mx-auto flex items-center justify-between gap-4 border-t border-bd-s100 pt-6 bajo:pt-4 mt-8 bajo:mt-5">
                    {step > 0 ? (
                        <Button variant="crema" size="md" type="button" onClick={goBack}>
                            <ChevronLeft size={18} />
                            Anterior
                        </Button>
                    ) : (
                        <span />
                    )}

                    {isLastStep ? (
                        <Button variant="caramelo" size="md" type="submit">
                            {editing ? "Guardar cambios" : "Crear proveedor"}
                            <Check size={18} />
                        </Button>
                    ) : (
                        <Button variant="caramelo" size="md" type="submit">
                            Siguiente
                            <ChevronRight size={18} />
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}