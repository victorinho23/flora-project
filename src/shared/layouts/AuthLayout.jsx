import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import authBg from "@/assets/images/cafe.png";
// TODO: cambia esta ruta por la de tu logo real
import logo from "@/assets/icons/flora-icon.svg";
import { Input, Button, Select, Checkbox } from "@/shared";
import { getDocumentTypes } from "../../services/selectServices";
import { loginSchema } from "../schemas/userSchema";
import { ForgotPasswordModal } from "../../features/users";
import { showSuccesAlert, showCreateUserErrorAlert } from "@/shared/services/alertService";

export default function AuthLayout() {
    const navigate = useNavigate();

    // Estado para los tipos de documento
    const [documentTypes, setDocumentTypes] = useState([]);
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
        // Se obtiene el nombre del campo y su valor
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            // Se copian todos los valores anteriores del estado
            ...prev,
            // Se actualiza unicamente lo que cambio
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        // Evita que el formulario recargue la pagina
        e.preventDefault();

        // Validamos los datos del formulario contra el esquema Zod
        // safeParse no lanza excepcion, retorna un objeto controlado
        const result = loginSchema.safeParse(formData);

        // Si la validacion falla
        if (!result.success) {
            // Objeto donde almacenaremos los errores por campo
            const fieldErrors = {};

            // Recorremos cada error generado por Zod
            result.error.issues.forEach((issue) => {
                // issue.path[0] corresponde al nombre del campo
                // issue.message contiene el mensaje de error definido en el schema
                fieldErrors[issue.path[0]] = issue.message;
            });

            setErrors(fieldErrors);
            await showCreateUserErrorAlert({
                title: "Error al crear usuario",
                text: "Revisa los campos marcados en el formulario",
                timer: 3000,
            });
            return;
        }

        // Si la validacion pasa limpiamos errores previos
        setErrors({});

        // Activamos estado de envio (util para deshabilitar el boton)
        // setIsSubmmiting(true);

        try {
            // Llamamos al servicio frontend que consume la API
            // result.data contiene los datos ya validados por Zod
            // const response = await createUser(result.data)

            // Log informativo para desarrollo
            // console.log("Usuario creado", response);

            // Feedback basico al usuario
            await showSuccesAlert({
                title: "Usuario registrado",
                text: "El usuario fue registrado correctamente",
                timer: 3000,
            });

            // Navegamos directo a home tras el registro exitoso
            navigate("/home");
        } catch (error) {
            // Capturamos errores de red o errores lanzados por el service
            console.log("Error: ", error.message);
            await showCreateUserErrorAlert({
                text: error.message,
                timer: 3000,
            });
        } finally {
            // Pase lo que pase, desactivamos el estado de envio
            // setIsSubmmiting(false)
        }
    };

    // Uso del estado useEffect
    useEffect(() => {
        getDocumentTypes().then(setDocumentTypes);
    }, []);

    return (
        <>
            
            <div
                className="min-h-screen w-full flex justify-center items-center p-4 md:p-10"
                style={{
                    backgroundImage: `url(${authBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                
                <div
                    className="relative overflow-hidden w-full max-w-300 min-h-180 border border-white/70 rounded-[20px] shadow-[0_0_15px_white]"
                >
                    
                    <div
                        className="absolute inset-0 blur-md scale-110 b"
                        style={{
                            backgroundImage: `url(${authBg})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />

                    
                    <div className="absolute inset-0 bg-black/20" />

                    
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-180 p-8 md:p-14">

                        
                        <section className="flex flex-col">
                            <img
                                src={logo}
                                alt="Logo de Flora"
                                className="w-40 md:w-52"
                            />

                            <div className="hidden lg:flex flex-1 items-center justify-center">
                                <img
                                    src={authBg}
                                    alt=""
                                    className="w-full max-w-xl aspect-4/3 object-cover rounded-[20px]
                                               shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                                />
                            </div>
                        </section>

              
                        <section className="flex items-center justify-center lg:justify-end">
                            <form
                                className="w-full max-w-md flex flex-col items-center gap-4
                                           rounded-[16px] border border-white/30 bg-coffe/50
                                           backdrop-blur-md shadow-2xl px-8 py-10"
                                onSubmit={handleSubmit}
                            >
                                <h1 className="mb-4 text-title text-text-primary font-bold">
                                    Inicio de Sesión
                                </h1>

                                <Input
                                    name="userEmail"
                                    type="email"
                                    value={formData.userEmail}
                                    placeholder="Escribe tu Correo Electronico"
                                    htmlFor="user-email"
                                    variant="primary"
                                    onChange={handleChange}
                                    error={errors.userEmail}
                                />

                                <Input
                                    name="userPassword"
                                    type="password"
                                    placeholder="Escribe tu contraseña"
                                    htmlFor="user-password"
                                    variant="primary"
                                    value={formData.userPassword}
                                    onChange={handleChange}
                                    error={errors.userPassword}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="w-80 text-right text-white text-xs hover:underline -mt-2"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>

                                <Select
                                    label="Tipos de documento"
                                    name="userDocumentTypes"
                                    htmlFor="userDocumentTypes"
                                    variant = "fourteenth"
                                    options={documentTypes}
                                    value={formData.userDocumentTypes}
                                    onChange={handleChange}
                                    error={errors.userDocumentTypes}
                                />

                                <Input
                                    name="userDocumentNumber"
                                    type="text"
                                    placeholder="Escribe tu numero de documento"
                                    htmlFor="user-document-number"
                                    variant="primary"
                                    value={formData.userDocumentNumber}
                                    onChange={handleChange}
                                    error={errors.userDocumentNumber}
                                />

                                <Checkbox
                                    className="min-w-80 w-80 mt-2 text-white shrink-0"
                                    id="isActive"
                                    name="isActive"
                                    label="Al hacer click aceptas las condiciones de uso, la politica de privacidad y de cookies de Flora."
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    variant="primary"
                                />

                                <div className="mt-4">
                                    <Button variant="primary" size="mdl" type="submit">
                                        Continuar
                                    </Button>
                                </div>

                                <Outlet />
                            </form>
                        </section>
                    </div>
                </div>
            </div>

            {showForgotPassword && (
                <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
            )}
        </>
    );
}