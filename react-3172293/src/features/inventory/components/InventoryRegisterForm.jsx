import { useState } from 'react';

export default function InventoryRegisterForm() {
    const [formData, setFormData] = useState({ 
        establecimiento: '', 
        fecha: '', 
        departamento: '', 
        empleado: '' 
    });
    const [productos, setProductos] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.establecimiento || !formData.fecha) {
            alert("Por favor completa los campos principales.");
            return;
        }

        setProductos([...productos, { ...formData, id: productos.length + 1 }]);
        
        setFormData({ establecimiento: '', fecha: '', departamento: '', empleado: '' });
    };

    return (
        <div className="min-h-screen w-full bg-cover bg-center text-white font-sans flex flex-col items-center justify-start p-0 relative">
            <div className="absolute inset-0 bg-black/75 z-0"></div>

            <div className="w-full max-w-5xl z-10 p-6 flex flex-col">
                
                <div className="w-full flex flex-col items-center justify-center border-b border-stone-800/40 pb-4 mb-6 relative">
                    <button className="absolute right-2 top-2 text-stone-400 hover:text-white text-xl transition">
                        
                    </button>

                    <div className="bg-white text-stone-900 font-serif font-black px-4 py-1.5 rounded text-lg tracking-wider text-center leading-none mb-2">
                        FLORA
                        <span className="block text-[10px] font-sans font-normal normal-case tracking-normal">Pizza y Café</span>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-stone-100 tracking-wide">
                        Hoja de inventarios
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4 mb-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                        
                        <div className="flex items-center rounded overflow-hidden border border-stone-600/40 bg-black/20">
                            <label className="w-36 bg-[#8C6D53]/90 text-[#F5EBE0] text-xs font-semibold py-2.5 px-3 whitespace-nowrap text-center">
                                Establecimiento:
                            </label>
                            <input 
                                type="text" 
                                className="w-full p-2 bg-transparent text-white placeholder-stone-500 text-xs outline-none"
                                placeholder="Digita el nombre del establecimiento" 
                                value={formData.establecimiento}
                                onChange={(e) => setFormData({...formData, establecimiento: e.target.value})}
                            />
                        </div>

                        <div className="flex items-center rounded overflow-hidden border border-stone-600/40 bg-black/20"> 
                            <label className="w-36 bg-[#8C6D53]/90 text-[#F5EBE0] text-xs font-semibold py-2.5 px-3 whitespace-nowrap text-center">
                                Fecha de inventario:
                        </label>
                        <input 
                        type="text" 
                        className="w-full p-2 bg-transparent text-white placeholder-stone-500 text-xs outline-none"
                        placeholder="DD/MM/AAAA" 
                        value={formData.fecha}
                        onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                        />
                        </div>

                        <div className="flex items-center rounded overflow-hidden border border-stone-600/40 bg-black/20">
                            <label className="w-36 bg-[#8C6D53]/90 text-[#F5EBE0] text-xs font-semibold py-2.5 px-3 whitespace-nowrap text-center">
                                Departamento:
                            </label>
                            <input 
                                type="text" 
                                className="w-full p-2 bg-transparent text-white placeholder-stone-500 text-xs outline-none"
                                placeholder="Departamento" 
                                value={formData.departamento}
                                onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                            />
                        </div>

                        <div className="flex items-center rounded overflow-hidden border border-stone-600/40 bg-black/20">
                            <label className="w-36 bg-[#8C6D53]/90 text-[#F5EBE0] text-xs font-semibold py-2.5 px-3 whitespace-nowrap text-center">
                                Empleado:
                            </label>
                            <input 
                                type="text" 
                                className="w-full p-2 bg-transparent text-white placeholder-stone-500 text-xs outline-none"
                                placeholder="Nombre del empleado" 
                                value={formData.empleado}
                                onChange={(e) => setFormData({...formData, empleado: e.target.value})}
                            />
                        </div>

                    </div>

                    <div className="w-full flex justify-end pt-2">
                        <button 
                            type="submit" 
                            className="px-6 py-1.5 bg-transparent hover:bg-white/10 text-stone-300 border border-stone-500/60 rounded text-xs transition"
                        >
                            Añadir producto
                        </button>
                    </div>
                </form>

                <div className="w-full text-center text-[11px] text-stone-400 tracking-wide mb-4">
                    La cantidad mínima de cada producto es de 
                    <span className="font-bold text-stone-300">10</span>
                </div>

            </div>
        </div>
    );
}