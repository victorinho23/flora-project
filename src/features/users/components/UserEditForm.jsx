// Formulario para modificar un usuario ya existente
import { useState, useEffect } from "react";
import {Input, Select, Checkbox, Button, Imageinput} from "@/shared";
import { getDocumentTypes } from "@/services/selectServices";
import { getTypeUser } from "@/services/selectServices";
import {useNavigate } from "react-router-dom"
import { userSchema } from "../schemas/userSchema";
import authBg from "@/assets/icons/usuario.png";
import authicon from "@/assets/icons/usuario.png";



export default function UserEditForm({ user }){

    const navigate = useNavigate();

    const [errors, setErrors] = useState({});   


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


    
    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked: value,
    }))
};

    const toggleActiveStatus = () => {
        setFormData((prev) => ({
            ...prev,
            isActive: !prev.isActive,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

    const result = userSchema.safeParse(formData)

    if (!result.success){
        const fieldErrors = {};

    result.error.issues.forEach((issue) => {
    fieldErrors[issue.path[0]] = issue.message;
    });

    setErrors(fieldErrors);


    return;
}
    setErrors({});

    try{
        alert("Usuario actualizado correctamente");
        navigate(`/viewUser`)
    } catch(error){
        console.log("Error: ", error.message)
        alert(error.message)
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
        
        <div className="grid items-center justify-center relative">

            <div className="flex absolute top-5 left-5 ">
                <img className="w-32 h-32" src={authBg } alt="usuario"/>
                <h1 className="mx-auto my-12 ml-10 mt-22 text-title text-text-primary font-bold flex align-center underline">Modificar usuario</h1>
            </div>

            <form 
                action=""
                onSubmit={handleSubmit}
                
            >
               <div className="flex gap-6 mt-50 absolute top-0 left-46 ">
                    <Input 
                        type="text"
                        name="userName"
                        label="Nombre"
                        value={formData.userName}
                        placeholder="Escribe tu nombre"
                        htmlFor= "user-name"
                        variant="cafe"
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
                        variant="cafe"
                    />


                </div>

                <div className="grid gap-4 absolute top-65 left-46">
                    <Input 
                    name="userDocumentNumber"
                    type="text"
                    label="Numero de documento"
                    value={formData.userDocumentNumber}
                    placeholder="Escribe tu numero documento"
                    htmlFor= "user-document-number"
                    variant="cafe"
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
                        variant="cafe"
                    />
                </div>
        

                <div className="grid grid-cols-2 absolute top-135
                left-45 gap-6 ">
                
                    <Input 
                        name="userEmail"
                        type="email"
                        label="Correo electronico"
                        value={formData.userEmail}
                        placeholder="Escribe tu Correo Electronico"
                        htmlFor= "user-email"
                        variant="cafe"
                        onChange={handleChange}
                        error={errors.userEmail}
                    />

                    <Input 
                        name="userPassword"
                        type="password"
                        label="Contraseña"
                        value={formData.userPassword}
                        placeholder="contraseña"
                        htmlFor= "user-password"
                        variant="cafe"
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
                        variant="cafe"
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
                        variant="cafe"
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
                        variant="cafe"
                        onChange={handleChange}
                        error={errors.userBusinessEmail}
                    />

                    <Input 
                        name="userContractStartDate"
                        type="date"
                        label="Fecha inicio contrato"
                        value={formData.userContractStartDate}
                        htmlFor= "user-contract-start"
                        variant="cafe"
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
                        variant="cafe"
                        onChange={handleChange}
                        error={errors.userPhone}
                    />

                     <Input 
                        name="userContractEndDate"
                        type="date"
                        label="Fecha fin contrato"
                        value={formData.userContractEndDate}
                        htmlFor= "user-contract-end"
                        variant="cafe"
                        onChange={handleChange}
                        error={errors.userContractEndDate}
                    />

                    <div className="col-2 flex justify-end">
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

                    <div className="flex absolute top-80 left-250 w-120">
                        <Button 
                       variant= "primary"
                        size="w"
                        type= "submit"
                        
                    >
                        Guardar cambios
                        </Button>

                    <div className="absolute bottom-40 rigth-10 ">
                        <Imageinput
                            value={formData.userImage}
                            onChange={(files) => 
                                setFormData((prev) => ({...prev, userImage: files}))
                            }
                            multiple={true}
                            variant="fifteenth"
                        />
                            {errors.userImage && (
                                <span className="text-red-400 text-sm"> {errors.userImage}</span>
                            )}
                    </div>
                        

                    </div>

                </div>{/** Actions */}
            </form>
            
                </div>
)
}