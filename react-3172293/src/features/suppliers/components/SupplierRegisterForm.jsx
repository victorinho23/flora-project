import { useState } from "react";
import { Input, Checkbox, Button } from "@/shared";
import { useNavigate } from "react-router-dom";
import { supplierSchema } from "../schemas/supplierSchema";

export default function SupplierRegisterForm() {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        supplierName: "",
        supplierNit: "",
        supplierPhone: "",
        supplierEmail: "",
        supplierAddress: "",
        contactName: "",
        isActive: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const result = supplierSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        try {
            console.log("Proveedor listo para guardar:", result.data);
            alert("Proveedor registrado con éxito");
            navigate(-1);
        } catch (error) {
            alert("Error al registrar: " + error.message);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-title font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">
                Registrar Nuevo Proveedor (Supplier)
            </h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <Input 
                    label="Nombre de la Empresa / Proveedor"
                    name="supplierName"
                    type="text"
                    value={formData.supplierName}
                    placeholder="Ej: Distribuidora Cafetera Central"
                    htmlFor="supplier-name"
                    variant="secondary"
                    onChange={handleChange}
                    error={errors.supplierName}
                />

                <Input 
                    label="NIT / Identificación Fiscal"
                    name="supplierNit"
                    type="text"
                    value={formData.supplierNit}
                    placeholder="Ej: 900.123.456-1"
                    htmlFor="supplier-nit"
                    variant="secondary"
                    onChange={handleChange}
                    error={errors.supplierNit}
                />

                <Input 
                    label="Nombre de la Persona de Contacto"
                    name="contactName"
                    type="text"
                    value={formData.contactName}
                    placeholder="Ej: Carlos Mendoza"
                    htmlFor="contact-name"
                    variant="secondary"
                    onChange={handleChange}
                    error={errors.contactName}
                />

                <Input 
                    label="Teléfono de Contacto"
                    name="supplierPhone"
                    type="tel"
                    value={formData.supplierPhone}
                    placeholder="Ej: 3123456789"
                    htmlFor="supplier-phone"
                    variant="secondary"
                    onChange={handleChange}
                    error={errors.supplierPhone}
                />

                <Input 
                    label="Correo Electrónico"
                    name="supplierEmail"
                    type="email"
                    value={formData.supplierEmail}
                    placeholder="correo@proveedor.com"
                    htmlFor="supplier-email"
                    variant="secondary"
                    onChange={handleChange}
                    error={errors.supplierEmail}
                />

                <Input 
                    label="Dirección Comercial"
                    name="supplierAddress"
                    type="text"
                    value={formData.supplierAddress}
                    placeholder="Ej: Calle 10 # 14-25, Pereira"
                    htmlFor="supplier-address"
                    variant="secondary"
                    onChange={handleChange}
                    error={errors.supplierAddress}
                />

                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg my-2">
                    <Checkbox 
                        id="isActive"
                        name="isActive"
                        label="Proveedor Activo (Habilitado para hacer pedidos)"
                        checked={formData.isActive}
                        onChange={handleChange} 
                    />
                </div>
    
                <div className="md:col-span-2 flex gap-4 justify-end mt-4">
                    <Button
                        variant="secondary"
                        size="md"
                        type="button"
                        onClick={() => navigate(-1)}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="primary"
                        size="md"
                        type="submit"
                    >
                        Guardar Proveedor
                    </Button>
                </div>
            </form>
        </div>
    );
}
