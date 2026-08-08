import { useState } from 'react';
import { ClipboardCheck, Store, Calendar, Coffee, User, Package, Scale, Info } from 'lucide-react';
import { inventoryHeaderSchema, inventoryProductSchema } from "../schemas/inventorySchema";

export default function InventoryRegisterForm() {
    // Estado del encabezado
    const [headerData, setHeaderData] = useState({ 
        establecimiento: '', fecha: '', departamento: '', empleado: '' 
    });

    // Estado del producto actual en el formulario
    const [productForm, setProductForm] = useState({ nombre: '', cantidad: '' });

    // Lista de productos agregados
    const [productos, setProductos] = useState([]);

    // Estado de errores de validacion (encabezado + producto, por nombre de campo)
    const [errors, setErrors] = useState({});

    // Controladores de cambio (sin modificar)
    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setHeaderData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setProductForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddProduct = (e) => {
        e.preventDefault();

        // Validamos el encabezado y el producto actual contra los esquemas Zod
        // safeParse no lanza excepcion, retorna un objeto controlado
        const headerResult = inventoryHeaderSchema.safeParse(headerData);
        const productResult = inventoryProductSchema.safeParse(productForm);

        // Si alguna validacion falla, juntamos los errores de ambas por campo
        if (!headerResult.success || !productResult.success) {
            const fieldErrors = {};

            headerResult.error?.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });

            productResult.error?.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });

            setErrors(fieldErrors);
            return;
        }

        // Si la validacion paso, limpiamos errores previos
        setErrors({});

        setProductos((prev) => [
            ...prev, 
            { ...productResult.data, id: prev.length + 1 }
        ]);
        
        setProductForm({ nombre: '', cantidad: '' });
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-4">

            {/* Contenedor Tarjeta Principal */}
            <div className="w-full bg-[#1a130e]/85 backdrop-blur-md border border-amber-900/40 rounded-2xl p-10 md:p-14 lg:p-20 shadow-2xl space-y-10">

                        {/* Encabezado */}
                        <div className="flex items-center gap-4 border-b border-amber-900/40 pb-5">
                            <div className="shrink-0 p-3 rounded-xl bg-amber-600/90 shadow-lg">
                                <ClipboardCheck size={22} className="text-amber-950" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                                    Hoja de Inventarios
                                </h1>
                                <p className="text-xs text-amber-200/60 mt-1">
                                    Registro general de inventario y detalle de productos
                                </p>
                            </div>
                        </div>

                        {/* Formulario Principal */}
                        <form onSubmit={handleAddProduct} className="space-y-10">

                            {/* Sección 1: Datos Generales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Establecimiento */}
                                <div>
                                    <label className="block text-xs font-medium text-amber-100/80 mb-1.5">
                                        Establecimiento
                                    </label>
                                    <div className="flex items-center gap-2.5 rounded-lg border border-amber-900/40 bg-black/30 px-3 py-2.5 focus-within:border-amber-600/70 transition">
                                        <Store size={16} className="text-amber-500 shrink-0" />
                                        <input
                                            type="text"
                                            name="establecimiento"
                                            className="w-full bg-transparent text-amber-50 placeholder-amber-100/30 text-xs outline-none"
                                            placeholder="Nombre del local"
                                            value={headerData.establecimiento}
                                            onChange={handleHeaderChange}
                                        />
                                    </div>
                                    {errors.establecimiento && (
                                        <span className="text-red-400 text-[11px]">{errors.establecimiento}</span>
                                    )}
                                </div>

                                {/* Fecha */}
                                <div>
                                    <label className="block text-xs font-medium text-amber-100/80 mb-1.5">
                                        Fecha
                                    </label>
                                    <div className="flex items-center gap-2.5 rounded-lg border border-amber-900/40 bg-black/30 px-3 py-2.5 focus-within:border-amber-600/70 transition">
                                        <Calendar size={16} className="text-amber-500 shrink-0" />
                                        <input
                                            type="text"
                                            name="fecha"
                                            className="w-full bg-transparent text-amber-50 placeholder-amber-100/30 text-xs outline-none"
                                            placeholder="DD/MM/AAAA"
                                            value={headerData.fecha}
                                            onChange={handleHeaderChange}
                                        />
                                    </div>
                                    {errors.fecha && (
                                        <span className="text-red-400 text-[11px]">{errors.fecha}</span>
                                    )}
                                </div>

                                {/* Departamento */}
                                <div>
                                    <label className="block text-xs font-medium text-amber-100/80 mb-1.5">
                                        Departamento
                                    </label>
                                    <div className="flex items-center gap-2.5 rounded-lg border border-amber-900/40 bg-black/30 px-3 py-2.5 focus-within:border-amber-600/70 transition">
                                        <Coffee size={16} className="text-amber-500 shrink-0" />
                                        <input
                                            type="text"
                                            name="departamento"
                                            className="w-full bg-transparent text-amber-50 placeholder-amber-100/30 text-xs outline-none"
                                            placeholder="Área / Depto"
                                            value={headerData.departamento}
                                            onChange={handleHeaderChange}
                                        />
                                    </div>
                                    {errors.departamento && (
                                        <span className="text-red-400 text-[11px]">{errors.departamento}</span>
                                    )}
                                </div>

                                {/* Empleado */}
                                <div>
                                    <label className="block text-xs font-medium text-amber-100/80 mb-1.5">
                                        Empleado
                                    </label>
                                    <div className="flex items-center gap-2.5 rounded-lg border border-amber-900/40 bg-black/30 px-3 py-2.5 focus-within:border-amber-600/70 transition">
                                        <User size={16} className="text-amber-500 shrink-0" />
                                        <input
                                            type="text"
                                            name="empleado"
                                            className="w-full bg-transparent text-amber-50 placeholder-amber-100/30 text-xs outline-none"
                                            placeholder="Tu nombre"
                                            value={headerData.empleado}
                                            onChange={handleHeaderChange}
                                        />
                                    </div>
                                    {errors.empleado && (
                                        <span className="text-red-400 text-[11px]">{errors.empleado}</span>
                                    )}
                                </div>
                            </div>

                            {/* Separador elegante */}
                            <div className="relative py-1 flex items-center justify-center gap-3">
                                <div className="flex-1 border-t border-amber-900/40" />
                                <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-500 font-semibold whitespace-nowrap">
                                    <Coffee size={13} />
                                    Agregar Ítems
                                    <Coffee size={13} />
                                </span>
                                <div className="flex-1 border-t border-amber-900/40" />
                            </div>

                            {/* Sección 2: Inputs de Producto */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-amber-100/80 mb-1.5">
                                        Nombre del Producto
                                    </label>
                                    <div className="flex items-center gap-2.5 rounded-lg border border-amber-900/40 bg-black/30 px-3 py-2.5 focus-within:border-amber-600/70 transition">
                                        <Package size={16} className="text-amber-500 shrink-0" />
                                        <input
                                            type="text"
                                            name="nombre"
                                            className="w-full bg-transparent text-amber-50 placeholder-amber-100/30 text-xs outline-none"
                                            placeholder="Ej. Café Arábica 500g"
                                            value={productForm.nombre}
                                            onChange={handleProductChange}
                                        />
                                    </div>
                                    {errors.nombre && (
                                        <span className="text-red-400 text-[11px]">{errors.nombre}</span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-amber-100/80 mb-1.5">
                                        Cantidad (Mínimo 10)
                                    </label>
                                    <div className="flex items-center gap-2.5 rounded-lg border border-amber-900/40 bg-black/30 px-3 py-2.5 focus-within:border-amber-600/70 transition">
                                        <Scale size={16} className="text-amber-500 shrink-0" />
                                        <input
                                            type="number"
                                            name="cantidad"
                                            className="w-full bg-transparent text-amber-50 placeholder-amber-100/30 text-xs outline-none"
                                            placeholder="10"
                                            value={productForm.cantidad}
                                            onChange={handleProductChange}
                                        />
                                    </div>
                                    {errors.cantidad && (
                                        <span className="text-red-400 text-[11px]">{errors.cantidad}</span>
                                    )}
                                </div>
                            </div>

                            {/* Botón de Acción */}
                            <div className="flex items-center justify-between pt-1 gap-3 flex-wrap">
                                <p className="flex items-center gap-1.5 text-[11px] text-amber-200/50">
                                    <Info size={13} className="text-amber-500/70" />
                                    Mínimo requerido: <span className="text-amber-200 font-semibold">10 unidades</span>
                                </p>
                                <button
                                    type="submit"
                                    className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-lg text-xs font-semibold transition active:scale-95 shadow-lg shadow-amber-950/40"
                                >
                                    + Añadir producto
                                </button>
                            </div>
                        </form>

                        {/* Sección 3: Historial / Lista */}
                        {productos.length > 0 && (
                            <div className="bg-black/30 p-4 rounded-xl border border-amber-900/40 space-y-3">
                                <h3 className="text-xs font-semibold text-amber-200 tracking-wider uppercase">
                                    Productos Agregados ({productos.length}):
                                </h3>
                                <div className="max-h-40 overflow-y-auto pr-1">
                                    <ul className="text-xs space-y-2">
                                        {productos.map((p) => (
                                            <li
                                                key={p.id}
                                                className="flex items-center justify-between p-2 rounded-lg bg-[#1a130e]/80 border border-amber-900/30 text-amber-100"
                                            >
                                                <span className="font-medium text-amber-50">{p.nombre}</span>
                                                <span className="px-2 py-0.5 rounded bg-amber-900/40 text-amber-200 text-[11px] font-mono">
                                                    {p.cantidad} uds
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Franja final con lema, como en el diseño de referencia */}
                    <div className="flex items-center justify-center gap-3 py-2 text-amber-200/50 text-xs">
                        <Coffee size={13} className="text-amber-600" />
                        <span>Calidad que se siente, inventario que se controla.</span>
                        <Coffee size={13} className="text-amber-600" />
                    </div>
        </div>
    );
}