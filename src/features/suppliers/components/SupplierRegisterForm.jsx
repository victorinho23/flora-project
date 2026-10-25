// src/features/suppliers/components/SupplierRegisterForm.jsx
// Formulario para registrar un proveedor

import { useState, useEffect } from "react";
import { Input, Select, Checkbox, Textarea, Button, Navbar } from "@/shared";
import { getSupplierCategories, getSupplierDocumentTypes } from "@/services/selectServices";
import { useNavigate, useLocation } from "react-router-dom";
import { suppliers } from "../data/suppliers";
import { Truck, Building2, Phone, Package } from "lucide-react";
import { supplierSchema } from "../schemas/supplierSchema";
import { inventory } from "@/features/inventory/data/inventory";
import { showSuccesAlert, showUnexpectedErrorAlert, showConfirmAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/suppliers.png";

// Solo se ofrecen productos activos del inventario para asociar al proveedor
const availableProducts = inventory.filter((item) => item.status === "Disponible");


export default function SupplierRegisterForm() {

    const navigate = useNavigate();
    // Si llega un proveedor por navegacion el formulario funciona en modo edicion
    const editing = useLocation().state?.supplier;

    // En edicion tambien se muestran los productos ya asociados aunque no esten disponibles
    const productOptions = editing
        ? inventory.filter((item) => item.status === "Disponible" || editing.products.includes(item.id))
        : availableProducts;

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

        // No se permite un numero de documento repetido
        const duplicated = suppliers.some((supplier) => supplier.id !== editing?.id && String(supplier.nit).replace(/\D/g, "") === result.data.documentNumber);
        if (duplicated) {
            setErrors({ documentNumber: "Ya existe otro proveedor con este número de documento" });
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
            await showSuccesAlert({
                title: "Proveedor actualizado",
                text: "Proveedor actualizado correctamente.",
                timer: 2500,
            });
            navigate("/listSuppliers");
            return;
        }

        try {
            // Llamamos al servicio frontend que consume la API
            // result.data contiene los datos ya validados por Zod
            // const response = await createSupplier(result.data)

            // feedback basico al usuario
            await showSuccesAlert({
                title: "Proveedor registrado",
                text: "Proveedor registrado correctamente.",
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
            className="min-h-screen w-full flex flex-col items-center gap-6 xl:gap-4 bajo:xl:gap-3 bg-cover bg-center px-3 sm:px-6 py-6 xl:py-4 bajo:xl:py-3 bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]"
        >
                <Navbar
                    variant="foto"
                    image={fotoFondo}
                    icon={Truck}
                    title={editing ? "Actualizar proveedor" : "Registrar proveedor"}
                    subtitle={editing ? `Editando ${editing.companyName}` : "Agrega un nuevo proveedor y sus datos de contacto."}
                    onBack={() => navigate(editing ? "/listSuppliers" : "/home")}
                    className="rounded-[1.25rem] shadow-[0_22px_48px_-26px_color-mix(in_srgb,var(--color-bg-s950)_70%,transparent)] w-full max-w-8xl"
                    actions={
                        <>
                            <Button variant="caramelo" size="md" type="button" onClick={() => navigate("/listSuppliers")}>
                                Ver proveedores
                            </Button>
                        </>
                    }
                />

            
                <div className="w-full max-w-8xl border border-bd-s100 border-t-[5px] border-t-bd-t800 rounded-[1.25rem] bg-bg-w bg-linear-180 from-bg-w to-bg-p50 shadow-[0_26px_50px_-28px_color-mix(in_srgb,var(--color-bg-s950)_55%,transparent)] p-5 sm:p-8 xl:p-6 bajo:xl:py-4">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-x-8 xl:gap-y-5 bajo:xl:gap-y-3 [&_.w-80]:w-full">

                    
                        <div className="flex flex-col gap-5 bajo:gap-3">
                            <h2 className="self-stretch flex items-center gap-2 text-base md:text-lg font-bold text-br-s950 border-b border-bd-s100 pb-2">
                                <Building2 className="w-5 h-5 shrink-0 text-br-t900" />
                                Datos de la empresa
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-x-6 gap-y-4 bajo:gap-y-3 md:[&>:nth-child(1)]:col-span-2 xl:[&>:nth-child(1)]:col-span-1 [&_label]:text-br-s900 [&_label]:text-sm [&_label]:font-semibold [&_label]:mb-1.5">
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

                   
                        <div className="flex flex-col gap-5 bajo:gap-3">
                            <h2 className="self-stretch flex items-center gap-2 text-base md:text-lg font-bold text-br-s950 border-b border-bd-s100 pb-2">
                                <Phone className="w-5 h-5 shrink-0 text-br-t900" />
                                Contacto
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-x-6 gap-y-4 bajo:gap-y-3 md:[&>:nth-child(3)]:col-span-2 xl:[&>:nth-child(3)]:col-span-1 [&_label]:text-br-s900 [&_label]:text-sm [&_label]:font-semibold [&_label]:mb-1.5">
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

                        <div className="flex flex-col gap-5 bajo:gap-3 bajo:[&_textarea]:h-32 [&>div>label]:text-br-s900 [&>div>label]:text-sm [&>div>label]:font-semibold [&>div>label]:mb-1.5">
                            <h2 className="self-stretch flex items-center gap-2 text-base md:text-lg font-bold text-br-s950 border-b border-bd-s100 pb-2">
                                <Package className="w-5 h-5 shrink-0 text-br-t900" />
                                Productos y notas
                            </h2>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-sm font-semibold text-br-s900">
                                    Productos que suministra (opcional)
                                </span>


                                <div className="flex flex-wrap gap-2 p-1 max-h-56 xl:max-h-40 overflow-y-auto">
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
                                {errors.products && (
                                    <p className="text-sm inline-block px-2 py-0.5 rounded bg-red-50 text-red-900 font-medium">{errors.products}</p>
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
                        </div>

                        <div className="flex flex-col-reverse items-center sm:flex-row justify-between gap-5 border-t border-bd-s100 pt-6 xl:pt-4 bajo:xl:pt-3 xl:col-span-3">
                            <div className="[&_input]:accent-[var(--color-tertiary-900)] [&_label]:text-br-s900 [&_label]:text-base">
                                <Checkbox
                                    variant="latte"
                                    id="supplier-is-active"
                                    label="Proveedor activo"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex justify-center sm:justify-end">
                                <Button variant="caramelo" size="lg" type="submit">
                                    {editing ? "Guardar cambios" : "Crear proveedor"}
                                </Button>
                            </div>
                        </div>

                    </form>
                </div>
        </div>
    );
}