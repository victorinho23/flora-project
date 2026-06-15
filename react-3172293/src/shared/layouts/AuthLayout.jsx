import {  useState, useEffect  } from "react";
import {Outlet, useNavigate } from "react-router-dom";
import authBg from "@/assets/images/cafe.png";
import {Input, 
    Button, 
    Select, 
    Checkbox} from "@/shared";
import {  getDocumentTypes  } from "../../services/selectServices";
import { userSchema } from "../schemas/userSchema";



export default function AuthLayout(){

    // Estado para los tipos de documento
    const navigate = useNavigate();


    const [documentTypes, setDocumentTypes] = useState([])
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
    
    
    
        useEffect(()=>{
            getDocumentTypes().then(setDocumentTypes);
        },[])
    // Uso del estado useEffect

    

    return(
        <>
            <div
                className="min-h-screen w-full flex justify-center items-center"
                style ={{
                    backgroundImage: `url(${authBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
            }}
            >
                <form className="grid bg-background-coffe w-200 h-180"
                    onSubmit={handleSubmit}
                    action=""
                    >
                         <h1 className="mx-auto mt-45 text-title text-text-primary font-bold">Registro de usuarios</h1>

                        <main className="grid gap-4 mx-auto mb-10 justify-center align-center">
                        
                    
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
                            placeholder="Escribe tu contraseña"
                            htmlFor= "user-password"
                            variant="fourth"
                            value={formData.userPassword}
                            onChange={handleChange}
                            error={errors.userPassword}

                        />

                        <Select 
                            label="Tipos de documento"
                            name="userDocumentTypes"
                            htmlFor="userDocumentTypes"
                            options={documentTypes}
                            value={formData.userDocumentTypes}
                            onChange={handleChange}
                            error={errors.userDocumentTypes}
                        />

                        <Input 
                            name="userDocumentNumber"
                            type="Documento"
                            placeholder="Escribe tu numero de documento"
                            htmlFor= "user-document-number"
                            variant="fourth"
                            value={formData.userDocumentNumber}
                            onChange={handleChange}
                            error={errors.userDocumentNumber}

                        />

                        <Checkbox
                        id="isActive"
                        name="isActive"
                        label= "esta activo"
                        checked={formData.isActive}
                        onChange={handleChange} 
            
                        />


                        {/** Actions */}

                        <div className="flex gap-6 items-center justify-center mb-10">
                            <Button
                                variant = "tertiary"
                                size ="md"
                                type = "submit"
                                onClick={()=> console.log("Se oprimio el boton")}
                                onSubmit={handleSubmit}
                            >
                                Continuar
                            </Button>
                        </div>{/** Actions */}


                        {/**Implementacion de use effect */}

                    
                        <Outlet />
                 
                    </main>

                </form>
                
                


            </div>
        </>
    );
}