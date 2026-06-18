import { useState, useEffect } from 'react';

export default function SupplierRegisterForm() {
    const [suppliers, setSuppliers] = useState(() => {
        const saved = localStorage.getItem('suppliersData');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [form, setForm] = useState({ 
        documento: '', 
        tipo: 'Tipo', 
        nombre: '', 
        correo: '', 
        contacto: '', 
        direccion: '', 
        categoria: 'Componentes', 
        notas: '' 
    });

    useEffect(() => {
        localStorage.setItem('suppliersData', JSON.stringify(suppliers));
    }, [suppliers]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.nombre || !form.documento) return; 
        setSuppliers([...suppliers, form]);
        setForm({ documento: '', tipo: 'Tipo', nombre: '', correo: '', contacto: '', direccion: '', categoria: 'Componentes', notas: '' });
    };

    return (
        <div className="min-h-screen w-full  bg-cover bg-center text-white font-sans flex flex-col items-center justify-start p-0 relative">
            <div className="absolute inset-0 bg-black/60 z-0"></div>

            <div className="w-full max-w-6xl z-10 p-6 flex flex-col h-full justify-between">
                
                <div className="w-full flex items-center justify-between border-b border-amber-900/30 pb-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-white text-stone-800 font-serif font-black px-4 py-2 rounded text-xl tracking-wider leading-none text-center">
                            FLORA
                            <span className="block text-xs font-sans font-normal normal-case">Pizza y Café</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-semibold text-stone-200 tracking-wide pr-12">
                        Registrar proveedor
                    </h1>
                    <div></div>
                </div>

                <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    <div className="lg:col-span-5 space-y-4">
                        <div className="flex gap-2">
                            <input 
                                className="w-full p-2.5 rounded border border-stone-500/50 bg-black/20 text-white placeholder-stone-400 text-sm outline-none focus:border-amber-600 transition"
                                placeholder="Número De Documento"
                                value={form.documento}
                                onChange={(e) => setForm({...form, documento: e.target.value})}
                            />
                            <select 
                                className="p-2.5 rounded border border-stone-500/50 bg-stone-900/80 text-stone-300 text-sm outline-none focus:border-amber-600"
                                value={form.tipo}
                                onChange={(e) => setForm({...form, tipo: e.target.value})}
                            >
                                <option value="Tipo">Tipo</option>
                                <option value="Natural">Natural</option>
                                <option value="Jurídica">Jurídica</option>
                            </select>
                        </div>

                        <input 
                            className="w-full p-2.5 rounded border border-stone-500/50 bg-black/20 text-white placeholder-stone-400 text-sm outline-none focus:border-amber-600 transition"
                            placeholder="Nombre Proveedor"
                            value={form.nombre}
                            onChange={(e) => setForm({...form, nombre: e.target.value})}
                        />

                        <input 
                            className="w-full p-2.5 rounded border border-stone-500/50 bg-black/20 text-white placeholder-stone-400 text-sm outline-none focus:border-amber-600 transition"
                            placeholder="Correo Electrónico Empresa"
                            type="email"
                            value={form.correo}
                            onChange={(e) => setForm({...form, correo: e.target.value})}
                        />

                        <input 
                            className="w-full p-2.5 rounded border border-stone-500/50 bg-black/20 text-white placeholder-stone-400 text-sm outline-none focus:border-amber-600 transition"
                            placeholder="Número De Contacto"
                            value={form.contacto}
                            onChange={(e) => setForm({...form, contacto: e.target.value})}
                        />

                        <input 
                            className="w-full p-2.5 rounded border border-stone-500/50 bg-black/20 text-white placeholder-stone-400 text-sm outline-none focus:border-amber-600 transition"
                            placeholder="Dirección"
                            value={form.direccion}
                            onChange={(e) => setForm({...form, direccion: e.target.value})}
                        />

                        <button 
                            type="button" 
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-stone-700/60 hover:bg-stone-600/70 text-stone-200 border border-stone-500/30 rounded text-sm font-medium w-fit transition shadow-md"
                        >
                           👤 Habilitar
                        </button>
                    </div>

                    <div className="lg:col-span-7 bg-stone-800/40 border border-stone-600/30 p-6 rounded-xl backdrop-blur-xs space-y-6">
                        
                        <div className="flex flex-wrap gap-2 justify-center">
                            {['Componentes', 'Insumos', 'Materia Prima', 'Repuestos', 'Otros'].map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setForm({...form, categoria: cat})}
                                    className={`px-3 py-1.5 rounded text-xs font-medium transition shadow-xs ${
                                        form.categoria === cat 
                                        ? 'bg-amber-700 text-white border border-amber-500' 
                                        : 'bg-white text-stone-800 hover:bg-stone-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <textarea 
                            className="w-full h-32 p-3 rounded border border-stone-500/50 bg-transparent text-white placeholder-stone-400 text-sm outline-none focus:border-amber-600 transition resize-none"
                            placeholder="Observaciones o Notas"
                            value={form.notas}
                            onChange={(e) => setForm({...form, notas: e.target.value})}
                        />
                    </div>

                    <div className="lg:col-span-12 flex justify-center pt-4">
                        <button 
                            type="submit"
                            className="px-12 py-2.5 bg-white text-stone-800 font-medium rounded hover:bg-stone-200 transition text-sm tracking-wide shadow-lg"
                        >
                            Registrar Proveedor
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}