// src/features/users/components/UserEditForm.jsx
// Formulario para actualizar una cuenta de usuario
import { useState, useEffect } from "react";
import { Input, Select, Button, Imageinput, Navbar } from "@/shared";
import { getDocumentTypes } from "@/services/selectServices";
import { getTypeUser } from "@/services/selectServices";
import { useNavigate } from "react-router-dom"
import { userSchema } from "../schemas/userSchema";
import authBg from "@/assets/icons/usuario.png";
import authicon from "@/assets/icons/usuario.png";
import { showSuccesAlert, showUnexpectedErrorAlert, showConfirmAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/fondo-users.png";
import { users } from "../data/users";



export default function UserEditForm({ user }){

    const navigate = useNavigate();

    const [errors, setErrors] = useState({});   


    // Estado del formulario precargado con los datos del usuario seleccionado
    const [formData, setFormData] = useState({
        userName: user.userName || "",
        userEmail: user.userEmail || "",
        userEmailConfirm: user.userEmail || "",
        userBusinessEmail: user.userBusinessEmail || "",
        userPhone: user.userPhone || "",
        userDocumentTypes: user.userDocumentTypes || "",
        userType: user.userType || "",
        userDocumentNumber: user.userDocumentNumber || "",
        userPassword: "",
        userImage: [],
        userAddress: user.userAddress || "",
        userContractStartDate: user.userContractStartDate || "",
        userContractEndDate: user.userContractEndDate || "",

        isStaff: user.isStaff || false,
        isActive: user.isActive || false,
        isSuperUser: user.isSuperUser || false,


    });


    
    // Actualiza el campo que cambio
    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked: value,
    }))
};

    // Habilita o inhabilita la cuenta, para inhabilitar pide el motivo
    const toggleActiveStatus = async () => {
        const next = !formData.isActive;
        const result = await showConfirmAlert({
            title: `¿Deseas ${next ? "habilitar" : "inhabilitar"} la cuenta?`,
            text: "El cambio se aplicará al guardar.",
            confirmButtonText: next ? "Habilitar" : "Inhabilitar",
            reasonLabel: next ? undefined : "Motivo de inactivación (obligatorio)",
        });
        if (!result.isConfirmed) return;
        setFormData((prev) => ({
            ...prev,
            isActive: next,
        }));
    };

    // Valida, revisa correo y documento repetidos y confirma antes de guardar
    const handleSubmit = async (e) => {
        e.preventDefault();

    const result = userSchema.safeParse(formData)
    // La contrasena es opcional al editar: si se deja vacia se conserva la actual
    const issues = result.success ? [] : result.error.issues.filter((issue) => !(issue.path[0] === "userPassword" && !formData.userPassword));

    if (issues.length){
        const fieldErrors = {};

    issues.forEach((issue) => {
    fieldErrors[issue.path[0]] = issue.message;
    });

    setErrors(fieldErrors);


    return;
}
        // El correo y el documento no pueden estar en uso por otro usuario
        const others = users.filter((item) => item.id !== user.id);
        const duplicateErrors = {};
        if (others.some((item) => item.useremail.toLowerCase() === formData.userEmail.toLowerCase())) duplicateErrors.userEmail = "Este correo ya está registrado";
        if (others.some((item) => item.document_number === formData.userDocumentNumber)) duplicateErrors.userDocumentNumber = "Este número de documento ya está en uso";
        if (Object.keys(duplicateErrors).length) {
            setErrors(duplicateErrors);
            return;
        }

    const confirmation = await showConfirmAlert({
        title: "¿Guardar los cambios de la cuenta?",
        text: "Se actualizarán los datos del usuario.",
        confirmButtonText: "Guardar cambios",
    });
    if (!confirmation.isConfirmed) return;

    setErrors({});

    try{
        await showSuccesAlert({
            title: "Usuario actualizado",
            text: "Cuenta actualizada exitosamente",
            timer: 3000,
        });
        navigate(`/viewUser`)
    } catch(error){
        console.log("Error: ", error.message)
        await showUnexpectedErrorAlert({
            text: error.message,
            timer: 3000,
        })
    }

};

    const [documentTypes, setDocumentTypes] = useState([])
    const [typesUser, setTypeUser] = useState([])
    
    
    
        useEffect(()=>{
            getDocumentTypes().then((data) => {
                setDocumentTypes(data);
                console.log("Opciones reales del select (documentTypes):", data);
            });
        },[])

         useEffect(()=>{
            getTypeUser().then((data) => {
                setTypeUser(data);
                console.log("Opciones reales del select (typesUser):", data);
            });
        },[])


    return(
        
        <div className="relative min-h-screen w-full max-w-7xl mx-auto flex flex-col gap-6 xl:gap-4 p-5 sm:p-8 xl:py-4">

            <Navbar
                variant="banda"
                image={fotoFondo}
                avatar={authBg}
                title="Modificar usuario"
                onBack={() => navigate("/viewUser")}
                backSide="right"
                className="rounded-2xl shadow-lg"
            />

            <form 
                action=""
                onSubmit={handleSubmit}
                className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start gap-6 bajo:gap-4 [&_.w-80]:w-full"
            >
               <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] p-4 sm:p-5 bajo:sm:p-4 xl:col-start-1">
                   <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                       <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                       Datos del usuario
                   </h2>
                   <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 bajo:gap-3 items-end">
                       <Input 
                           type="text"
                           name="userName"
                           label="Nombre"
                           value={formData.userName}
                           placeholder="Escribe tu nombre"
                           htmlFor= "user-name"
                           variant="latte"
                           onChange={handleChange}
                           error={errors.userName}
                       />

                       <Select 
                           label="Tipo de documento"
                           name="userDocumentTypes"
                           value={formData.userDocumentTypes}
                           htmlFor="userDocumentTypes"
                           options={documentTypes}
                           onChange={handleChange}
                           error={errors.userDocumentTypes}
                           variant="latte"
                       />
                       <Input 
                       name="userDocumentNumber"
                       type="text"
                       label="Numero de documento"
                       value={formData.userDocumentNumber}
                       placeholder="Escribe tu numero documento"
                       htmlFor= "user-document-number"
                       variant="latte"
                       onChange={handleChange}
                       error={errors.userDocumentNumber}
                   />

                       <Select 
                           label="Tipo de usuario"
                           name="userType"
                           value={formData.userType}
                           htmlFor="userType"
                           options={typesUser}
                           onChange={handleChange}
                           error={errors.userType}
                           variant="latte"
                       />

                       <Input 
                           name="userEmail"
                           type="email"
                           label="Correo electronico"
                           value={formData.userEmail}
                           placeholder="Escribe tu Correo Electronico"
                           htmlFor= "user-email"
                           variant="latte"
                           onChange={handleChange}
                           error={errors.userEmail}
                       />

                       <Input 
                           name="userPassword"
                           type="password"
                           label="Contraseña (opcional)"
                           value={formData.userPassword}
                           placeholder="Déjala vacía para conservarla"
                           htmlFor= "user-password"
                           variant="latte"
                           onChange={handleChange}
                           error={errors.userPassword}
                       />

                       <Input 
                           name="userEmailConfirm"
                           type="email"
                           label="Confirmar correo electronico"
                           value={formData.userEmailConfirm}
                           placeholder="Confirma tu correo electronico"
                           htmlFor= "user-email-confirm"
                           variant="latte"
                           onChange={handleChange}
                           error={errors.userEmailConfirm}
                       />

                       <Input 
                           name="userAddress"
                           type="text"
                           label="Direccion"
                           value={formData.userAddress}
                           placeholder="Direccion"
                           htmlFor= "user-direction"
                           variant="latte"
                           onChange={handleChange}
                           error={errors.userAddress}
                       />

                       <Input 
                           name="userBusinessEmail"
                           type="email"
                           label="Correo empresarial"
                           value={formData.userBusinessEmail}
                           placeholder="Correo empresarial"
                           htmlFor= "user-business-email"
                           variant="latte"
                           onChange={handleChange}
                           error={errors.userBusinessEmail}
                       />

                       <Input 
                           name="userContractStartDate"
                           type="date"
                           label="Fecha inicio contrato"
                           value={formData.userContractStartDate}
                           htmlFor= "user-contract-start"
                           variant="latte"
                           onChange={handleChange}
                           error={errors.userContractStartDate}
                       />



                       <Input 
                           name="userPhone"
                           type="tel"
                           label="Telefono"
                           value={formData.userPhone}
                           placeholder="Escribe tu numero de telefono"
                           htmlFor= "user-Phone"
                           variant="latte"
                           onChange={handleChange}
                           error={errors.userPhone}
                       />

                        <Input 
                           name="userContractEndDate"
                           type="date"
                           label="Fecha fin contrato"
                           value={formData.userContractEndDate}
                           htmlFor= "user-contract-end"
                           variant="latte"
                           onChange={handleChange}
                           error={errors.userContractEndDate}
                       />

                       <div className="flex items-end justify-center sm:justify-start">
                           <Button
                               variant={formData.isActive ? "statusActive" : "statusInactive"}
                               size="lgg"
                               type="button"
                               onClick={toggleActiveStatus}
                           >
                               <img className="w-4 h-4 brightness-0 invert" src={authicon} alt="" />
                               {formData.isActive ? "Estado Activo" : "Estado Inactivo"}
                           </Button>
                       </div>

                       </div>
               </div>

                <div className="flex justify-center xl:justify-end xl:col-start-1">
                    <Button
                        variant="primary"
                        size="w"
                        type="submit"
                    >
                        Guardar cambios
                    </Button>
                </div>

                <div className="flex flex-col items-center gap-4 xl:col-start-2 xl:row-start-1 xl:row-span-2">
                    <div className="flex flex-col gap-4 bajo:gap-3 border border-bd-s100 border-l-[5px] border-l-bd-t800 rounded-[0.9rem] bg-linear-135 from-bg-t50 via-bg-w via-55% to-bg-s50 shadow-[0_12px_28px_-22px_color-mix(in_srgb,var(--color-bg-s950)_50%,transparent)] p-4 sm:p-5 bajo:sm:p-4 items-center">
                        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-br-t900">
                            <span className="w-2 h-2 rounded-full bg-bg-t900 shrink-0" />
                            Foto de perfil
                        </h2>
                        <Imageinput
                            value={formData.userImage}
                            onChange={(files) =>
                                setFormData((prev) => ({...prev, userImage: files}))
                            }
                            multiple={true}
                            variant="latte"
                        />
                        {errors.userImage && (
                            <span className="inline-block rounded bg-red-50 px-2 py-0.5 text-red-900 font-medium text-sm">{errors.userImage}</span>
                        )}
                    </div>
                </div>{/** Actions */}
            </form>
            
                </div>
)
}