// User regtister form para registrarn un usuario
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import {Input, Select, Checkbox, Button, FileInput, Imageinput} from "@/shared";
import { getDocumentTypes } from "@/services/selectServices";
import { getTypeUser } from "@/services/selectServices";
import {useNavigate } from "react-router-dom"
import { userSchema } from "../schemas/userSchema";
import authBg from "@/assets/icons/usuario.png";
import authicon from "@/assets/icons/usuario.png";



export default function UserRegisterForm(){
    // Estado del formulario

    const navigate = useNavigate();

    // Estado del error

    const [errors, setErrors] = useState({});   


    const [formData, setFormData] = useState({
        userName: "",
        userEmail: "",
        userEmailConfirm: "",
        userBusinessEmail: "",
        userPhone: "",
        userDocumentTypes: "",
        userType: "",
        userDocumentNumber: "",
        userPassword: "",
        userImage: [],
        userAddress:"",
        userContractStartDate:"",
        userContractEndDate:"",

        isStaff: false,
        isActive: false,
        isSuperUser: false,


    });


    
    const handleChange = (e) => {
        //Se obtiene el nombre del campo y su valor 

        const {name, value, type, checked} = e.target;

        setFormData((prev) => ({
            // Se copian todos los valores anterirores del estado
            ...prev,

            // Se actualiza unicamente lo que cambio

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
        // Evita que el formulario recargue la pagina
        e.preventDefault();
    

    // Validamos los datos del formulario contra el esquema Zod
    // safeParse No lanza excepcion, retorna un objeto controlado

    const result = userSchema.safeParse(formData)

    // Si la validacion falla
    if (!result.success){
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
    //Si la validacion pasa limpiamos errores previos
    setErrors({});

    try{
        alert("Usuario creado correctamente");
        navigate("/viewUser")
    } catch(error){
        console.log("Error: ", error.message)
        alert(error.message)
    }

};

    const [documentTypes, setDocumentTypes] = useState([])
    const [typesUser, setTypeUser] = useState([])
    
    
    
        useEffect(()=>{
            getDocumentTypes().then(setDocumentTypes);
        },[])

         useEffect(()=>{
            getTypeUser().then(setTypeUser);
        },[])


    return(
        
        <div className="grid items-center justify-center relative">

            {/** Panel oscuro detras de todo el formulario, para dar contraste sin cambiar el layout */}
           

            <div className="flex items-center justify-between absolute top-5 left-5 right-5">
                <div className="flex">
                    <img className="w-32 h-32" src={authBg } alt="usuario"/>
                    <h1 className="mx-auto my-12 ml-10 mt-22 text-title text-text-primary font-bold flex align-center underline">Creacion de usuarios</h1>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/home")}
                    className="text-text-primary hover:opacity-70 transition-opacity"
                    aria-label="Volver al inicio"
                >
                    <ArrowLeft className="w-12 h-12" />
                </button>
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
                        placeholder="Escribe tu contraseña"
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
                        Crear usuario
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