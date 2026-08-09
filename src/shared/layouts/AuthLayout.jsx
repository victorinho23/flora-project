import {  useState, useEffect  } from "react";
import {Outlet, useNavigate } from "react-router-dom";
import authBg from "@/assets/images/cafe.png";
import {Input, 
    Button, 
    Select, 
    Checkbox} from "@/shared";
import {  getDocumentTypes  } from "../../services/selectServices";
import { loginSchema } from "../schemas/userSchema";
import { ForgotPasswordModal } from "../../features/users";



export default function AuthLayout(){

    // Estado para los tipos de documento
    const navigate = useNavigate();


    const [documentTypes, setDocumentTypes] = useState([])
    const [errors, setErrors] = useState({});   
    const [showForgotPassword, setShowForgotPassword] = useState(false);


    const [formData, setFormData] = useState({
        userEmail: "",
        userDocumentTypes: "",
        userDocumentNumber: "",
        userPassword: "",

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

    const result = loginSchema.safeParse(formData)

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
        alert("Usuario registrado correctamente");

        // Navegamos directo a home tras el registro exitoso
        navigate("/home")
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
                <div className="border border-1 border-white rounded-[8px]
                 w-200 h-180 shadow-[0_0_15px_white] backdrop-blur-lg bg-background-coffe/50" >
                    
            
                    <form className="flex flex-col items-center"
                    onSubmit={handleSubmit}
                    action=""
                    >
                         <h1 className="mx-auto mt-45 text-title text-text-primary font-bold">Registro de usuarios</h1>

                        <main className="flex flex-col gap-4 mb-10 items-center w-full">
                        
                    
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
                            type="text"
                            placeholder="Escribe tu numero de documento"
                            htmlFor= "user-document-number"
                            variant="fourth"
                            value={formData.userDocumentNumber}
                            onChange={handleChange}
                            error={errors.userDocumentNumber}

                        />

                        <Checkbox
                        className ="minw-80 w-80 mt-5 text-white shrink-0"
                        id="isActive"
                        name="isActive"
                        label= "Al hacer click aceptas las condiciones de uso, la politica de privacida y de cookies de Flora."
                        checked={formData.isActive}
                        onChange={handleChange} 
                        variant="primary"
                        />

                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="w-80 text-white text-sm text-br-t400 hover:text-br-t300 hover:underline mt-4 "
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                        


                        {/** Actions */}

                        <div className="flex gap-6 items-center justify-center mb-10 mt-5">
                            <Button
                                variant = "tertiary"
                                size ="mdl"
                                type = "submit"
                            >
                                Continuar
                            </Button>
                        </div>{/** Actions */}


                        {/**Implementacion de use effect */}

                    
                        <Outlet />
                 
                    </main>

                </form>
                
                

                </div>
                

            </div>

            {showForgotPassword && (
                <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
            )}
        </>
    );
}