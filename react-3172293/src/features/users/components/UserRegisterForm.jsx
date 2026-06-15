// User regtister form para registrarn un usuario
import { useState, useEffect } from "react";
import {Input, Select, Checkbox, Button} from "@/shared";
import { getDocumentTypes } from "@/services/selectServices";
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
        userPhone: "",
        userDocumentType: "",
        userDocumentNumber: "",
        userPassword: "",
        userImage: [],

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

    // const handleNameChange = (e) => {
    //     const value = e.target.value.trim();

    //     if (value === ""){
    //         console.log("El nombre no puede estar vacio")
    //     }
            
    // };

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

    // Activamos estado de envio(util para desahablitar el boton)
    // setIsSubmmiting(true);

    try{
        // Llamamos al servicio frontend que consume la API
        // result.data contiene los datos ya validados por Zod
        // const response = await createUser(result.data)

        // Log informativo para desarrollo
        // console.log("Usuario creado", response);

        // feedback basico al usuario
        alert("Usuario creado correctamente");

        // Navegamos la vista anterior
        //navigate(-1) equivale a volver atras
        navigate(-1)
    } catch(error){

        //Capturanmos errores de red o errores lanzados por el service
        console.log("Error: ", error.message)
        
        alert(error.message)

    } finally{
        // Pase lo que pase, desactivamos el estado de envio

    // setIsSubmmiting(false)
    }

};

    const [documentTypes, setDocumentTypes] = useState([])
    
    
    
        useEffect(()=>{
            getDocumentTypes().then(setDocumentTypes);
        },[])


    return(
        
        <div className="grid items-center justify-center">

            <div className="flex absolute top-5 left-5">
                <img className="w-32 h-32" src={authBg } alt="usuario"/>
                <h1 className="mx-auto my-12 ml-10 mt-22 text-title text-text-primary font-bold flex align-center underline">Creacion de usuarios</h1>
            </div>

            <form 
                action=""
                className=""
                onSubmit={handleSubmit}
                
            >
               <div className="flex gap-6 mt-50 absolute top-0 left-46">
                    <Input 
                        type="text"
                        name="userName"
                        value={formData.userName}
                        placeholder="Escribe tu nombre"
                        htmlFor= "user-name"
                        variant="fourth"
                        onChange={handleChange}
                        error={errors.userName}
                    />

                    <Select 
                        name="userDocumentTypes"
                        value={formData.userDocumentTypes}
                        htmlFor="userDocumentTypes"
                        options={documentTypes}
                        onChange={handleChange}
                        error={errors.userDocumentTypes}
                    />


                </div>

                <div className="grid gap-4 absolute top-65 left-46">
                    <Input 
                    name="userDocumentNumber"
                    type="text"
                    value={formData.userDocumentNumber}
                    placeholder="Escribe tu numero documento"
                    htmlFor= "user-document-number"
                    variant="fourth"
                    onChange={handleChange}
                    error={errors.userDocumentNumber}
                />

                    <Select 
                        label="Tipos de documento"
                        name="userDocumentTypes"
                        value={formData.userDocumentTypes}
                        htmlFor="userDocumentTypes"
                        options={documentTypes}
                        onChange={handleChange}
                        error={errors.userDocumentTypes}
                    />
                </div>
        

                <div className="grid grid-cols-2 absolute top-150 left-45 gap-6 ">
                
                    <Input 
                        name="userEmail"
                        type="email"
                        value={formData.userEmail}
                        placeholder="Escribe tu Correo Electronico"
                        htmlFor= "user-email"
                        variant="fourth"
                        onChange={handleChange}
                        error={errors.userEmail}
                    />

                    <Input 
                        name="userPassword"
                        type="password"
                        value={formData.userPassword}
                        placeholder="Escribe tu contraseña"
                        htmlFor= "user-password"
                        variant="fourth"
                        onChange={handleChange}
                        error={errors.userPassword}
                    />
                    
                    <Input 
                        name="userEmail"
                        type="email"
                        value={formData.userEmail}
                        placeholder="Confirma tu correo electronico"
                        htmlFor= "user-email"
                        variant="fourth"
                        onChange={handleChange}
                        error={errors.userEmail}
                    />

                    <Input 
                        name="userDirection"
                        type="direction"
                        value={formData.Direction}
                        placeholder="Direccion"
                        htmlFor= "user-direction"
                        variant="fourth"
                        onChange={handleChange}
                        error={errors.userDirection}
                    />

                    <Input 
                        name="userEmail"
                        type="email"
                        value={formData.userEmail}
                        placeholder="Correo empresarial"
                        htmlFor= "user-email"
                        variant="fourth"
                        onChange={handleChange}
                        error={errors.userEmail}
                    />

                    <Input 
                        name="userEmail"
                        type="email"
                        value={formData.userEmail}
                        placeholder="Fecha inicio contrato"
                        htmlFor= "user-email"
                        variant="fourth"
                        onChange={handleChange}
                        error={errors.userEmail}
                    />

                   
    
                    <Input 
                        name="userPhone"
                        type="tel"
                        value={formData.userPhone}
                        placeholder="Escribe tu numero de telefono"
                        htmlFor= "user-Phone"
                        variant="fourth"
                        onChange={handleChange}
                        error={errors.userPhone}
                    />

                     <Input 
                        name="userEmail"
                        type="email"
                        value={formData.userEmail}
                        placeholder="Fecha fin contrato"
                        htmlFor= "user-email"
                        variant="fourth"
                        onChange={handleChange}
                        error={errors.userEmail}
                    />

                    <div className="col-2 flex justify-end">
                        <Button 
                       
                       variant= "primary"
                        size="lgg"
                        type= "button"
                        onClick={()=> console.log("Se oprimio el boton")}
                       
                    >
                        
                        <img className= "w-4 h-4 text-end filter" src={authicon} alt="" />
                        Estado Activo
                        
                        </Button>

                    </div>

                    <div className="flex absolute top-68 left-250 w-115">
                        <Button 
                       variant= "primary"
                        size="w"
                        type= "button"
                        onClick={()=> console.log("Se oprimio el boton")}
                       
                    >
                        Crear usuario
                        
                        </Button>

                    </div>

                    
                

                

                </div>{/** Actions */}
            </form>
            
                </div>
                
        


 
)
}

