import { useState, useMemo } from 'react';
import { ClipboardCheck, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { inventoryProductSchema } from "../schemas/inventorySchema";
import { inventory } from "../data/inventory";
import { users } from "@/features/users/data/users";
import { Button, Input, Select, Textarea, Imageinput } from "@/shared";

import fondoInventory from "@/assets/images/fondo-inventory.jpeg";

// Opciones de estado del producto, ligadas al lote (RFADMIN08 / RFADMIN11)
const statusOptions = [
    { id: "Disponible", label: "Disponible" },
    { id: "Vencido", label: "Vencido" },
    { id: "Avería", label: "Avería" },
    { id: "Agotado", label: "Agotado" },
];

// Cuentadante: se selecciona entre los usuarios ya registrados (RFADMIN02)
const custodianOptions = users.map((u) => ({ id: String(u.id), label: u.username }));

export default function InventoryRegisterForm() {
    // Navegacion hacia el listado
    const navigate = useNavigate();

    // Marcas ya registradas en el inventario, mas las que el usuario agregue en esta sesion
    const initialBrands = useMemo(
        () => [...new Set(inventory.map((item) => item.brand))],
        []
    );
    const [brands, setBrands] = useState(initialBrands);
    const [showNewBrand, setShowNewBrand] = useState(false);
    const [newBrand, setNewBrand] = useState('');

    // Estado del producto a registrar
    const [productForm, setProductForm] = useState({
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
    });

    // Lote: siempre 1 para un producto nuevo (RFADMIN10 - se incrementa al reabastecer)
    const batch = 1;

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
    };

    const handleAddProduct = (e) => {
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
            return;
        }

        // Si la validacion paso, limpiamos errores previos
        setErrors({});

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

        alert("Producto registrado correctamente");

        setProductForm({
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
        });
    };

    return (
    
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-fixed px-4 py-10"
            style={{ backgroundImage: `url(${fondoInventory})` }}
        >

            <div className="w-full max-w-6xl mx-auto space-y-4">

                {/* Contenedor Tarjeta Principal */}
                <div className="w-full bg-[var(--color-secundary-950)]/85 backdrop-blur-md border border-[var(--color-tertiary-900)]/40 rounded-2xl p-10 md:p-14 lg:p-20 shadow-2xl space-y-10">

                            {/* Encabezado */}
                            <div className="flex items-center justify-between gap-4 border-b border-[var(--color-tertiary-900)]/40 pb-5">
                                <div className="flex items-center gap-4">
                                    <div className="shrink-0 p-3 rounded-xl bg-[var(--color-tertiary-600)]/90 shadow-lg">
                                        <ClipboardCheck size={22} className="text-[var(--color-tertiary-950)]" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl md:text-2xl font-bold text-[var(--color-white)] tracking-wide">
                                            Registrar inventario
                                        </h1>
                                        <p className="text-xs text-[var(--color-tertiary-200)]/60 mt-1">
                                            Registro general de inventario y detalle de productos
                                        </p>
                                    </div>
                                </div>

                                {/* "Ver todo" / listar -> vuelve al listado completo */}
                                <div className="flex items-center gap-4">
                                    <Button variant="secondary" size="sm" onClick={() => navigate("/listInventory")}>
                                        Ver listado
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => navigate("/home")}
                                        className="text-[var(--color-white)] hover:opacity-70 transition-opacity"
                                        aria-label="Volver al inicio"
                                    >
                                        <ArrowLeft className="w-7 h-7" />
                                    </button>
                                </div>
                            </div>

                            {/* Formulario Principal, organizado en secciones para que el orden de los campos sea claro */}
                            <form onSubmit={handleAddProduct} className="space-y-8">

                                <section className="space-y-4">
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-tertiary-400)]">
                                        Identificación
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="ID / código único"
                                            type="text"
                                            name="id"
                                            variant="cafe"
                                            value={productForm.id}
                                            placeholder="Ej: 113"
                                            htmlFor="inventory-id"
                                            onChange={handleProductChange}
                                            error={errors.id}
                                        />

                                        <Input
                                            label="Nombre del producto"
                                            type="text"
                                            name="name"
                                            variant="cafe"
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
                                            variant="cafe"
                                            value={productForm.barcode}
                                            placeholder="Ej: 172345678"
                                            htmlFor="inventory-codigo-barras"
                                            onChange={handleProductChange}
                                            error={errors.barcode}
                                        />

                                        <Select
                                            label="Marca"
                                            name="brand"
                                            variant="cafe"
                                            value={productForm.brand}
                                            htmlFor="inventory-brand"
                                            options={brands.map((m) => ({ id: m, label: m }))}
                                            onChange={handleProductChange}
                                            error={errors.brand}
                                        />

                                        {showNewBrand ? (
                                            <div className="flex items-end gap-2 md:col-span-2">
                                                <Input
                                                    label="Nueva marca"
                                                    type="text"
                                                    variant="cafe"
                                                    value={newBrand}
                                                    placeholder="Nombre de la marca"
                                                    htmlFor="inventory-new-brand"
                                                    onChange={(e) => setNewBrand(e.target.value)}
                                                />
                                                <Button variant="secondary" size="sm" type="button" onClick={handleAddBrand}>
                                                    Agregar
                                                </Button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setShowNewBrand(true)}
                                                className="w-80 h-12 rounded-md bg-[var(--color-white)] text-[var(--color-secundary-900)] border border-[var(--color-gray-300)] flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                                            >
                                                <Plus size={14} />
                                                Nueva marca
                                            </button>
                                        )}
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-tertiary-400)]">
                                        Responsable y existencias
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            label="Cuentadante"
                                            name="custodian"
                                            variant="cafe"
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
                                            variant="cafe"
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
                                            variant="cafe"
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
                                            variant="cafe"
                                            value={productForm.minQuantity}
                                            placeholder="Aviso de existencias bajas"
                                            htmlFor="inventory-min-quantity"
                                            onChange={handleProductChange}
                                            error={errors.minQuantity}
                                        />
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-tertiary-400)]">
                                        Estado y vencimiento
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                        <Select
                                            label="Estado"
                                            name="status"
                                            variant="cafe"
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
                                            variant="cafe"
                                            value={productForm.expirationDate}
                                            htmlFor="inventory-fecha-vencimiento"
                                            onChange={handleProductChange}
                                            error={errors.expirationDate}
                                        />

                                        <div className="flex items-center gap-2.5 rounded-lg border border-[var(--color-tertiary-900)]/40 bg-[var(--color-black)]/30 px-3 py-2.5 text-[var(--color-tertiary-100)]/70 text-xs h-12">
                                            Lote: {batch} (nuevo producto)
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-tertiary-400)]">
                                        Detalles adicionales
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        <Textarea
                                            label="Descripción"
                                            name="description"
                                            variant="cafe"
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
                                            variant="cafe"
                                            value={productForm.location}
                                            placeholder="Ej: Bodega principal"
                                            htmlFor="inventory-location"
                                            onChange={handleProductChange}
                                            error={errors.location}
                                            fullWidth
                                        />
                                    </div>

                                    <div className="grid justify-center">
                                        <p className="text-center text-xs font-medium text-[var(--color-tertiary-100)]/80 mb-2">
                                            Imagen del producto
                                        </p>
                                        <Imageinput
                                            value={productForm.image}
                                            onChange={(files) =>
                                                setProductForm((prev) => ({ ...prev, image: files }))
                                            }
                                            multiple={false}
                                            variant="fifteenth"
                                        />
                                    </div>
                                </section>

                               
                                <div className="flex items-center justify-center pt-1 gap-3 flex-wrap">
                                    <Button variant="primary" size="sm" type="submit">
                                    <Plus size={16} />
                                    Añadir producto
                                </Button>
                                </div>
                            </form>

                           
                            {products.length > 0 && (
                                <div className="bg-[var(--color-black)]/30 p-4 rounded-xl border border-[var(--color-tertiary-900)]/40 space-y-3">
                                    <h3 className="text-xs font-semibold text-[var(--color-tertiary-200)] tracking-wider uppercase">
                                        Productos Agregados ({products.length}):
                                    </h3>
                                    <div className="max-h-40 overflow-y-auto pr-1">
                                        <ul className="text-xs space-y-2">
                                            {products.map((p) => (
                                                <li
                                                    key={p.id}
                                                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-secundary-950)]/80 border border-[var(--color-tertiary-900)]/30 text-[var(--color-tertiary-100)]"
                                                >
                                                    <span className="font-medium text-[var(--color-tertiary-50)]">{p.name}</span>
                                                    <span className="px-2 py-0.5 rounded bg-[var(--color-tertiary-900)]/40 text-[var(--color-tertiary-200)] text-[11px] font-mono">
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
        </div>
    );
}