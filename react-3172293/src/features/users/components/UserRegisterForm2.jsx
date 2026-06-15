// User regtister form para registrarn un usuario
import { useState, useEffect } from "react";
import {Input, Select, Checkbox, Button} from "@/shared";
import { getDocumentTypes } from "@/services/selectServices";
import {useNavigate } from "react-router-dom"
import { userSchema } from "../schemas/userSchema";

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
            <h1 className="mx-auto my-12 text-title font-bold">Registro de usuarios</h1>

            <form className="grid"
                action=""
                onSubmit={handleSubmit}
                        >
               
                <Input 
                label="Nombre"
                name="userName"
                type="text"
                value={formData.userName}
                placeholder="Escribe tu nombre"
                htmlFor= "user-name"
                variant="secondary"
                onChange={handleChange}
                error={errors.userName}

                />

                <Input 
                label="Correo"
                name="userEmail"
                type="email"
                value={formData.userEmail}
                placeholder="Escribe tu Correo Electronico"
                htmlFor= "user-email"
                variant="secondary"
                onChange={handleChange}
                error={errors.userEmail}


                />
                <Input 
                    label="Telefono"
                    name="userPhone"
                    type="tel"
                    value={formData.userPhone}
                    placeholder="Escribe tu numero de telefono"
                    htmlFor= "user-Phone"
                    variant="secondary"
                    onChange={handleChange}
                    error={errors.userPhone}


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
    
                <Input 
                    label="Documento"
                    name="userDocumentNumber"
                    type="text"
                    value={formData.userDocumentNumber}
                    placeholder="Escribe tu numero documento"
                    htmlFor= "user-document-number"
                    variant="secondary"
                    onChange={handleChange}
                    error={errors.userDocumentNumber}
                />
    
                <Input 
                    label="Contraseña"
                    name="userPassword"
                    type="password"
                    value={formData.userPassword}
                    placeholder="Escribe tu contraseña"
                    htmlFor= "user-password"
                    variant="secondary"
                    onChange={handleChange}
                    error={errors.userPassword}

        
                />

                <div className="grid gap-4  my-8">
                    <Checkbox 
                    id="isSuperUser"
                    name="isSuperUser"
                    label= "es super usuario"
                    checked={formData.isSuperUser}
                    onChange={handleChange} 
                 /> 
                <Checkbox
                    id="isStaff"
                    name="isStaff"
                    label= "es staff"
                    checked={formData.isStaff}
                    onChange={handleChange} 
                
                /> 
                <Checkbox
                    id="isActive"
                    name="isActive"
                    label= "esta activo"
                    checked={formData.isActive}
                    onChange={handleChange} 
    
                />
                </div>
    
                
    
                <div className="flex gap-6 items-center">
                    <Button
                        variant = "secondary"
                        size ="sm"
                        type = "submit"
                        onClick={()=> console.log("Se oprimio el boton")}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant= "primary"
                        size="w"
                        type= "submit"
                        onClick={()=> console.log("Se oprimio el boton")}
                    >
                        Guardar
                    </Button>
                </div>{/** Actions */}
        
            </form>
            
            
            
                   

        </div>


 
)
}


