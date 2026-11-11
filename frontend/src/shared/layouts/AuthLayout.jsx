import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import authBg from "@/assets/images/cafe.png";
import logo from "@/assets/icons/flora-icon.svg";
import { Input, Button, Checkbox } from "@/shared";
import { loginSchema } from "../schemas/userSchema";
import { ForgotPasswordModal } from "../../features/users";
import { showSuccesAlert, showCreateUserErrorAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/cafe.png";
import { login } from "@/features/auth/services/authService";
import { logout } from "@/features/auth/services/logoutService";

export default function AuthLayout() {
    const navigate = useNavigate();

    // Estado para los tipos de documento
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
                title: "No se pudo iniciar sesión",
                text: "Revisa los campos marcados en el formulario",
                timer: 3000,
            });
            return;
        }

        // Si la validacion pasa limpiamos errores previos
        setErrors({});

        try {
            // El backend revisa el correo, la contraseña, si la cuenta esta activa
            // y los intentos fallidos (a los 3 bloquea la cuenta 15 minutos)
            const data = await login(result.data);

            // guardamos el token y los datos del usuario en la sesion
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("user", JSON.stringify(data.user));

            // Feedback basico al usuario
            await showSuccesAlert({
                title: "Bienvenido",
                text: `Inicio de sesión exitoso, hola ${data.user.name}`,
                timer: 3000,
            });

            // Navegamos directo a home
            navigate("/home");
        } catch (error) {
            // Capturamos errores de red o errores que manda el backend
            console.log("Error: ", error.message);
            await showCreateUserErrorAlert({
                title: error.status === 423 ? "Cuenta bloqueada" : "No se pudo iniciar sesión",
                text: error.message,
                timer: 4000,
            });
        }
    };

    // Uso del estado useEffect
  
    // Si se vuelve al login se cierra la sesion que hubiera abierta
    useEffect(() => {
        logout();
    }, []);

    return (
        <>
            
            <div
                className="min-h-screen w-full flex justify-center items-center p-4 md:p-10 bg-bg-s950 bg-cover bg-center bg-fixed bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-bg-s950)_80%,transparent)_0%,color-mix(in_srgb,var(--color-bg-s900)_62%,transparent)_55%,color-mix(in_srgb,var(--color-bg-t950)_72%,transparent)_100%),var(--foto)]" style={{ "--foto": `url(${fotoFondo})` }}
            >
                
                <div
                    className="relative overflow-hidden w-full max-w-300 min-h-180 rounded-[28px] bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950 shadow-[0_30px_60px_-28px_color-mix(in_srgb,var(--color-bg-s950)_80%,transparent)]"
                >
                    
                    
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-180 p-5 sm:p-8 md:p-14">

                        
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

              
                        <section className="flex items-center justify-center lg:justify-end mt-20">
                            <form
                                className="w-full max-w-md flex flex-col items-center gap-4
                                           rounded-[20px] bg-bg-w shadow-2xl px-5 sm:px-8 py-10 [&_.w-80]:w-full [&_.w-80]:max-w-80"
                                onSubmit={handleSubmit}
                            >
                                <h1 className="mb-4 text-title text-br-s950 font-bold">
                                    Inicio de Sesión
                                </h1>

                                <Input
                                    name="userEmail"
                                    type="email"
                                    value={formData.userEmail}
                                    placeholder="Escribe tu Correo Electronico"
                                    htmlFor="user-email"
                                    variant="latte"
                                    onChange={handleChange}
                                    error={errors.userEmail}
                                />

                                <Input
                                    name="userPassword"
                                    type="password"
                                    placeholder="Escribe tu contraseña"
                                    htmlFor="user-password"
                                    variant="latte"
                                    value={formData.userPassword}
                                    onChange={handleChange}
                                    error={errors.userPassword}
                                />

                                <Button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="w-80 text-right text-br-t900 text-sm font-semibold hover:underline -mt-2"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Button>


                               <Checkbox
                                    className="w-full max-w-80 mt-2 shrink-0"
                                    id="isActive"
                                    name="isActive"
                                    label="Al hacer click aceptas las condiciones de uso, la politica de privacidad y de cookies de Flora."
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    variant="latte"
                                    error={errors.isActive}
                                />

                                <div className="mt-4">
                                    <Button variant="espresso" size="mdl" type="submit"
                                    >
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