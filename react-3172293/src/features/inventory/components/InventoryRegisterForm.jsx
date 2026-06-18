import { useState } from 'react';

export default function InventoryRegisterForm() {
    const [formData, setFormData] = useState({ nombre: '', cantidad: '', precio: '' });
    const [productos, setProductos] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.nombre.trim() === '') {
            alert("El nombre del producto es obligatorio.");
            return;
        }
        
        const cantidad = parseInt(formData.cantidad);
        const precio = parseFloat(formData.precio);

        if (isNaN(cantidad) || cantidad <= 0) {
            alert("La cantidad debe ser un número mayor a 0.");
            return;
        }

        if (isNaN(precio) || precio < 0) {
            alert("El precio no puede ser negativo.");
            return;
        }

        setProductos([...productos, { ...formData, cantidad, precio }]);
        
        setFormData({ nombre: '', cantidad: '', precio: '' });
    };

    return (
        <div className="flex flex-col items-center p-6 w-full">
            {/* Formulario */}
            <div className="bg-white/90 p-8 rounded-xl shadow-2xl w-full max-w-xl mb-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Registro de Inventario</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto</label>
                        <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-900 outline-none transition"
                            placeholder="Ej. Café Espresso" 
                            value={formData.nombre}
                            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                        <input 
                            type="number" 
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-900 outline-none transition"
                            placeholder="0" 
                            value={formData.cantidad}
                            onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                        <input 
                            type="number" 
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-900 outline-none transition"
                            placeholder="0.00" 
                            value={formData.precio}
                            onChange={(e) => setFormData({...formData, precio: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-amber-900 text-white p-3 rounded-md font-bold hover:bg-amber-800 transition duration-200"
                    >
                        Guardar Producto
                    </button>
                </form>
            </div>

            {productos.length > 0 && (
                <div className="bg-white/90 p-6 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Productos Registrados</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-amber-900">
                                    <th className="p-3">Producto</th>
                                    <th className="p-3">Cantidad</th>
                                    <th className="p-3">Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3">{item.nombre}</td>
                                        <td className="p-3">{item.cantidad}</td>
                                        <td className="p-3">${item.precio.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}