import { useState, useMemo } from 'react';
import { showSuccesAlert, showErrorAlert, showConfirmAlert } from "@/shared/services/alertService";
import { ClipboardCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { inventoryProductSchema } from "../schemas/inventorySchema";
import { inventory } from "../data/inventory";
import { users } from "@/features/users/data/users";
import { Button, Input, Select, Textarea, Imageinput, Navbar } from "@/shared";
import fotoFondo from "@/assets/images/fondo-inventory.jpeg";


// Opciones de estado del producto, ligadas al lote
const statusOptions = [
    { id: "Disponible", label: "Disponible" },
    { id: "Vencido", label: "Vencido" },
    { id: "Avería", label: "Avería" },
    { id: "Agotado", label: "Agotado" },
];

// Cuentadante: se selecciona entre los usuarios ya registrados
const custodianOptions = users.map((u) => ({ id: String(u.id), label: u.username }));

// Convierte la fecha DD/MM/AAAA de los datos al formato del input de fecha
const toInputDate = (value = "") => {
    const [day, month, year] = value.split("/");
    return year ? `${year}-${month}-${day}` : value;
};

// Producto vacio para limpiar el formulario
const emptyProduct = {
    id: '',
    brand: '',
    name: '',
    barcode: '',
    custodian: '',
    quantity: '',
    minQuantity: '',
    unitValue: '',
    status: 'Disponible',
    expirationDate: '',
    description: '',
    location: '',
    image: [],
};

export default function InventoryRegisterForm() {
    // Navegacion hacia el listado
    const navigate = useNavigate();
    // Si llega un producto por navegacion el formulario funciona en modo edicion
    const editing = useLocation().state?.item;

    // Marcas ya registradas en el inventario, mas las que el usuario agregue en esta sesion
    const initialBrands = useMemo(
        () => [...new Set(inventory.map((item) => item.brand))],
        []
    );
    const [brands, setBrands] = useState(initialBrands);
    const [showNewBrand, setShowNewBrand] = useState(false);
    const [newBrand, setNewBrand] = useState('');

    // Estado del producto a registrar
    const [productForm, setProductForm] = useState(() => editing
        ? {
              ...emptyProduct,
              ...editing,
              custodian: String(editing.custodian ?? ''),
              quantity: String(editing.quantity ?? ''),
              minQuantity: String(editing.minQuantity ?? ''),
              unitValue: String(editing.unitValue ?? ''),
              expirationDate: toInputDate(editing.expirationDate),
              location: editing.location ?? '',
              image: [],
          }
        : emptyProduct);

    // Lote: siempre 1 para un producto nuevo (se incrementa al reabastecer)
    const batch = editing?.batch ?? 1;

    // Lista de products agregados en esta sesion
    const [products, setProducts] = useState([]);

    // Estado de errores de validacion por nombre de campo
    const [errors, setErrors] = useState({});

    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setProductForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddBrand = () => {
        const brand = newBrand.trim();
        if (!brand) return;

        if (!brands.includes(brand)) {
            setBrands((prev) => [...prev, brand]);
        }
        setProductForm((prev) => ({ ...prev, brand }));
        setNewBrand('');
        setShowNewBrand(false);
        showSuccesAlert({
            title: "Marca agregada",
            text: `La marca ${brand} quedó seleccionada`,
            timer: 2000,
        });
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        // Validamos el producto actual contra el esquema Zod
        // safeParse no lanza excepcion, retorna un objeto controlado
        const result = inventoryProductSchema.safeParse(productForm);

        if (!result.success) {
            const fieldErrors = {};

            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });

            setErrors(fieldErrors);
            await showErrorAlert({
                title: "Revisa el formulario",
                text: "Hay campos obligatorios sin completar o con errores",
                confirmButtonText: "Aceptar",
                timer: 3000,
            });
            return;
        }

        // ID y codigo de barras unicos, y la imagen es obligatoria
        const others = inventory.filter((item) => item.id !== editing?.id);
        const duplicateErrors = {};
        if (!editing && others.some((item) => item.id === result.data.id)) duplicateErrors.id = "Ya existe un producto con este ID";
        if (others.some((item) => item.barcode === result.data.barcode)) duplicateErrors.barcode = "Ya existe un producto con este código de barras";
        if (!productForm.image.length && !editing?.image) duplicateErrors.image = "La imagen del producto es obligatoria";
        if (Object.keys(duplicateErrors).length) {
            setErrors(duplicateErrors);
            await showErrorAlert({
                title: "Revisa el formulario",
                text: Object.values(duplicateErrors).join(". "),
                confirmButtonText: "Aceptar",
                timer: 3500,
            });
            return;
        }

        // Si la validacion paso, limpiamos errores previos
        setErrors({});

        // En edicion pide confirmacion, avisa y vuelve a actualizar inventario
        if (editing) {
            const confirmation = await showConfirmAlert({
                title: `¿Guardar los cambios de ${result.data.name}?`,
                text: "Se actualizará la información del producto en el inventario.",
                confirmButtonText: "Guardar cambios",
            });
            if (!confirmation.isConfirmed) return;
            await showSuccesAlert({
                title: "Inventario actualizado",
                text: "Inventario actualizado exitosamente",
                timer: 2500,
            });
            navigate("/updateInventory");
            return;
        }

        // Cantidad total y valor total se calculan automaticamente a partir
        // del batch que se esta registrando
        const quantityNum = Number(result.data.quantity);
        const unitValueNum = Number(result.data.unitValue);

        const newProduct = {
            ...result.data,
            batch,
            totalQuantity: quantityNum,
            totalValue: quantityNum * unitValueNum,
        };

        setProducts((prev) => [...prev, newProduct]);

        await showSuccesAlert({
            title: "Producto registrado",
            text: "El producto fue añadido al inventario correctamente",
            timer: 2500,
        });

        setProductForm(emptyProduct);
    };

    return (

        <div
            className="min-h-screen w-full px-4 sm:px-8 py-6 xl:py-4 bajo:xl:py-2 bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]"
        >

            <div className="w-full max-w-8xl mx-auto flex flex-col gap-6 xl:gap-4">

                                                        <Navbar
                                                            variant="foto"
                                                            image={fotoFondo}
                                                            icon={ClipboardCheck}
                                                            title={editing ? "Actualizar inventario" : "Registrar inventario"}
                                                            subtitle={editing ? `Producto #${editing.id} · el ID y el lote no se pueden modificar` : "Registro general de inventario y detalle de productos"}
                                                            onBack={() => navigate(editing ? "/updateInventory" : "/home")}
                                                            className="rounded-2xl shadow-lg"
                                                            actions={
                                                                <>
                                                                    <Button variant="crema" size="sm" onClick={() => navigate("/listInventory")}>
                                                                        Ver listado
                                                                    </Button>
                                                                </>
                                                            }
                                                        />

                            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-start gap-5 bajo:gap-3 [&_.w-80]:w-full [&_input]:min-w-0 [&_select]:min-w-0">

                                <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] p-4 sm:p-5 bajo:sm:p-4 xl:col-start-1 xl:row-start-1">
                                    <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                                        <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                                        Identificación
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bajo:gap-3">
                                        <Input
                                            label="ID / código único"
                                            type="text"
                                            name="id"
                                            variant="latte"
                                            value={productForm.id}
                                            placeholder="Ej: 113"
                                            htmlFor="inventory-id"
                                            readOnly={Boolean(editing)}
                                            onChange={handleProductChange}
                                            error={errors.id}
                                        />

                                        <Input
                                            label="Nombre del producto"
                                            type="text"
                                            name="name"
                                            variant="latte"
                                            value={productForm.name}
                                            placeholder="Ej: Café Arábica 500g"
                                            htmlFor="inventory-name"
                                            onChange={handleProductChange}
                                            error={errors.name}
                                        />

                                        <Input
                                            label="Código de barras"
                                            type="text"
                                            name="barcode"
                                            variant="latte"
                                            value={productForm.barcode}
                                            placeholder="Ej: 172345678"
                                            htmlFor="inventory-codigo-barras"
                                            onChange={handleProductChange}
                                            error={errors.barcode}
                                        />

                                        <Select
                                            label="Marca"
                                            name="brand"
                                            variant="latte"
                                            value={productForm.brand}
                                            htmlFor="inventory-brand"
                                            options={brands.map((m) => ({ id: m, label: m }))}
                                            onChange={handleProductChange}
                                            error={errors.brand}
                                        />

                                        {showNewBrand ? (
                                            <div className="flex items-end gap-2 sm:col-span-2">
                                                <Input
                                                    label="Nueva marca"
                                                    type="text"
                                                    variant="latte"
                                                    value={newBrand}
                                                    placeholder="Nombre de la marca"
                                                    htmlFor="inventory-new-brand"
                                                    onChange={(e) => setNewBrand(e.target.value)}
                                                />
                                                <Button variant="crema" size="sm" type="button" onClick={handleAddBrand}>
                                                    Agregar
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={() => setShowNewBrand(true)}
                                                className="w-full h-12 rounded-md bg-[var(--color-white)] text-[var(--color-secundary-900)] border border-[var(--color-secundary-400)] flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                                            >

                                                Nueva marca
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] p-4 sm:p-5 bajo:sm:p-4 xl:col-start-2 xl:row-start-1">
                                    <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                                        <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                                        Responsable y existencias
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bajo:gap-3">
                                        <Select
                                            label="Cuentadante"
                                            name="custodian"
                                            variant="latte"
                                            value={productForm.custodian}
                                            htmlFor="inventory-custodian"
                                            options={custodianOptions}
                                            onChange={handleProductChange}
                                            error={errors.custodian}
                                        />

                                        <Input
                                            label="Valor unitario"
                                            type="number"
                                            name="unitValue"
                                            variant="latte"
                                            value={productForm.unitValue}
                                            placeholder="Ej: 5000"
                                            htmlFor="inventory-valor-unitario"
                                            onChange={handleProductChange}
                                            error={errors.unitValue}
                                        />

                                        <Input
                                            label="Cantidad (lote actual)"
                                            type="number"
                                            name="quantity"
                                            variant="latte"
                                            value={productForm.quantity}
                                            placeholder="10"
                                            htmlFor="inventory-quantity"
                                            onChange={handleProductChange}
                                            error={errors.quantity}
                                        />

                                        <Input
                                            label="Cantidad mínima"
                                            type="number"
                                            name="minQuantity"
                                            variant="latte"
                                            value={productForm.minQuantity}
                                            placeholder="Aviso de existencias bajas"
                                            htmlFor="inventory-min-quantity"
                                            onChange={handleProductChange}
                                            error={errors.minQuantity}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] p-4 sm:p-5 bajo:sm:p-4 xl:col-start-1 xl:row-start-2">
                                    <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                                        <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                                        Estado y vencimiento
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bajo:gap-3 items-end">
                                        <Select
                                            label="Estado"
                                            name="status"
                                            variant="latte"
                                            value={productForm.status}
                                            htmlFor="inventory-status"
                                            options={statusOptions}
                                            onChange={handleProductChange}
                                            error={errors.status}
                                        />

                                        <Input
                                            label="Fecha de vencimiento"
                                            type="date"
                                            name="expirationDate"
                                            variant="latte"
                                            value={productForm.expirationDate}
                                            htmlFor="inventory-fecha-vencimiento"
                                            onChange={handleProductChange}
                                            error={errors.expirationDate}
                                        />

                                        <div className="flex items-center gap-2.5 rounded-lg border border-bd-s300 bg-bg-s50 px-3 py-2.5 text-br-s900 text-sm font-medium h-12 sm:col-span-2">
                                            Lote: {batch} {editing ? "(no se puede modificar)" : "(nuevo producto)"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] p-4 sm:p-5 bajo:sm:p-4 xl:col-start-2 xl:row-start-2 [&_textarea]:h-32 bajo:[&_textarea]:h-24 bajo:[&_textarea]:h-24">
                                    <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                                        <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                                        Detalles adicionales
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        <Textarea

                                            name="description"
                                            variant="latte"
                                            value={productForm.description}
                                            placeholder="Describe el producto"
                                            htmlFor="inventory-description"
                                            onChange={handleProductChange}
                                            error={errors.description}

                                        />

                                        <Input
                                            label="Ubicación (opcional)"
                                            type="text"
                                            name="location"
                                            variant="latte"
                                            value={productForm.location}
                                            placeholder="Ej: Bodega principal"
                                            htmlFor="inventory-location"
                                            onChange={handleProductChange}
                                            error={errors.location}
                                            fullWidth
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-5 md:col-span-2 xl:col-span-1 xl:col-start-3 xl:row-start-1 xl:row-span-2">
                                    <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] p-4 sm:p-5 bajo:sm:p-4 items-center">
                                        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                                            <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                                            Imagen del producto
                                        </h2>
                                        <Imageinput
                                            value={productForm.image}
                                            onChange={(files) =>
                                                setProductForm((prev) => ({ ...prev, image: files }))
                                            }
                                            multiple={false}
                                            variant="latte"
                                            formats={["png", "jpg", "jpeg", "svg"]}
                                            maxSizeMB={5}
                                        />
                                        {editing?.image && !productForm.image.length && (
                                            <p className="text-sm text-br-s900">Se conserva la imagen actual si no cargas una nueva.</p>
                                        )}
                                        {errors.image && (
                                            <p className="text-sm inline-block px-2 py-0.5 rounded bg-red-50 text-red-900 font-medium">{errors.image}</p>
                                        )}
                                    </div>

                                    <Button variant="caramelo" size="lgg" type="submit">
                                        {editing ? "Guardar cambios" : "Añadir producto +"}
                                    </Button>
                                </div>
                            </form>

                       
                            {products.length > 0 && (
                                <div className="bg-bg-s50 p-4 rounded-xl border border-bd-s100 space-y-3">
                                    <h3 className="text-sm font-bold text-br-t900 tracking-wider uppercase">
                                        Productos Agregados ({products.length}):
                                    </h3>
                                    <div className="max-h-40 overflow-y-auto pr-1">
                                        <ul className="text-sm space-y-2">
                                            {products.map((p) => (
                                                <li
                                                    key={p.id}
                                                    className="flex items-center justify-between p-2 rounded-lg bg-bg-w border border-bd-s100 text-br-s950"
                                                >
                                                    <span className="font-semibold text-br-s950">{p.name}</span>
                                                    <span className="px-2 py-0.5 rounded bg-bg-t50 text-br-t950 text-xs font-mono">
                                                        {p.quantity} uds
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
            </div>
        </div>
    );
}