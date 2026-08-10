// User register form para registrar un usuario
import { useState, useEffect } from "react";
import { ArrowLeft, User } from "lucide-react";
import {Input, Select, Button, Imageinput} from "@/shared";
import { getDocumentTypes } from "@/services/selectServices";
import { getTypeUser } from "@/services/selectServices";
import {useNavigate } from "react-router-dom"
import { userSchema } from "../schemas/userSchema";
import authicon from "@/assets/icons/usuario.png";


/**
 * Pequeño titulo de seccion reutilizable dentro del form.
 * Punto ambar (br-t500) + texto en mayusculas -> le da jerarquia visual
 * a cada grupo de campos sin necesidad de otro componente nuevo.
 */
function SectionTitle({ children }) {
    return (
        // FIX: el texto completo estaba en text-br-t400 (naranja/ambar), competia
        // demasiado. Ahora el texto es blanco (text-text-primary) y SOLO el punto
        // se queda ambar como acento -- suficiente para dar identidad de color
        // sin que el titulo entero se lea "naranja".
        <h2 className="flex items-center gap-2 text-caption font-label uppercase tracking-wider text-text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-bg-w shrink-0" />
            {children}
        </h2>
    );
}

export default function UserRegisterForm(){
    const navigate = useNavigate();

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
        <div className="min-h-screen w-full bg-cover bg-center bg-fixed">

            {/** Header */}
            <div className="w-full flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 bg-bg-bk/30 backdrop-blur-sm">

                {/* Icono de usuario + titulo agrupados, para que "justify-between"
                    siga funcionando contra el boton de volver del otro extremo */}
                <div className="flex items-center gap-3">
                    {/* FIX: circulo ambar -> blanco solido, con border-2 (antes 1px)
                        para que el borde resalte de verdad y no se pierda contra
                        el fondo oscuro del header */}
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-bg-w/10 border-2 border-bg-w/80 shrink-0">
                        <User className="w-5 h-5 text-bg-w" />
                    </span>
                    <h1 className="text-title text-text-primary font-bold underline drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                        Creacion de usuarios
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/home")}
                    className="text-text-primary hover:opacity-70 transition-opacity drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                    aria-label="Volver al inicio"
                >
                    <ArrowLeft className="w-8 h-8" />
                </button>
            </div>

            {/** Contenido */}
            <div className="flex justify-center px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-8xl bg-bg-bk/30 backdrop-blur-sm border-2 border-bd-w/35 shadow-2xl rounded-2xl p-6 sm:p-10 flex flex-col lg:flex-row gap-6 lg:gap-8"
                >

                    {/** Columna izquierda: datos del usuario, agrupados en secciones */}
                    <div className="flex flex-col gap-5 sm:gap-6 lg:flex-[2] lg:min-w-0">

                        <section className="flex flex-col gap-4 rounded-xl bg-bg-s950/40 border border-bd-w/25 p-4 sm:p-5">
                            <SectionTitle>Identificación</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-end">
                                <Input
                                    type="text"
                                    name="userName"
                                    label="Nombre"
                                    value={formData.userName}
                                    placeholder="Escribe tu nombre"
                                    htmlFor="user-name"
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

                                <Input
                                    name="userDocumentNumber"
                                    type="text"
                                    label="Numero de documento"
                                    value={formData.userDocumentNumber}
                                    placeholder="Escribe tu numero documento"
                                    htmlFor="user-document-number"
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
                        </section>

                        <section className="flex flex-col gap-4 rounded-xl bg-bg-s950/40 border border-bd-w/25 p-4 sm:p-5">
                            <SectionTitle>Contacto y acceso</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-end">
                                <Input
                                    name="userEmail"
                                    type="email"
                                    label="Correo electronico"
                                    value={formData.userEmail}
                                    placeholder="Escribe tu Correo Electronico"
                                    htmlFor="user-email"
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
                                    htmlFor="user-password"
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
                                    htmlFor="user-email-confirm"
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
                                    htmlFor="user-direction"
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
                                    htmlFor="user-business-email"
                                    variant="cafe"
                                    onChange={handleChange}
                                    error={errors.userBusinessEmail}
                                />

                                <Input
                                    name="userPhone"
                                    type="tel"
                                    label="Telefono"
                                    value={formData.userPhone}
                                    placeholder="Escribe tu numero de telefono"
                                    htmlFor="user-Phone"
                                    variant="cafe"
                                    onChange={handleChange}
                                    error={errors.userPhone}
                                />
                            </div>
                        </section>

                        <section className="flex flex-col gap-4 rounded-xl bg-bg-s950/40 border border-bd-w/25 p-4 sm:p-5">
                            <SectionTitle>Contrato</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-end">
                                <Input
                                    name="userContractStartDate"
                                    type="date"
                                    label="Fecha inicio contrato"
                                    value={formData.userContractStartDate}
                                    htmlFor="user-contract-start"
                                    variant="cafe"
                                    onChange={handleChange}
                                    error={errors.userContractStartDate}
                                />

                                <Input
                                    name="userContractEndDate"
                                    type="date"
                                    label="Fecha fin contrato"
                                    value={formData.userContractEndDate}
                                    htmlFor="user-contract-end"
                                    variant="cafe"
                                    onChange={handleChange}
                                    error={errors.userContractEndDate}
                                />
                            </div>

                            {/* El estado vive dentro de la seccion de contrato porque
                                conceptualmente es parte de la relacion contractual del
                                usuario, no un dato aislado flotando al final del form */}
                            <div className="pt-1">
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
                        </section>

                    </div>

                    {/** Columna derecha: imagen y acciones.
                        lg:sticky + lg:top-6 para que, en desktop, esta columna quede
                        alineada a la altura visible mientras se hace scroll por las
                        secciones largas de la izquierda -- comportamiento tipico de
                        "sidebar card" en formularios largos. */}
                    <div className="flex flex-col gap-5 sm:gap-6 lg:flex-1 lg:min-w-0 lg:sticky lg:top-6 lg:self-start justify-center items-center">

                        <section className="flex flex-col gap-4 rounded-xl bg-bg-s950/40 border border-bd-w/25 p-4 sm:p-5">
                            <SectionTitle>Foto de perfil</SectionTitle>

                            <div className="flex items-center justify-center bg-bg-s950/60 border border-bd-w/30 rounded-xl p-4">
                                <Imageinput
                                    value={formData.userImage}
                                    onChange={(files) =>
                                        setFormData((prev) => ({...prev, userImage: files}))
                                    }
                                    multiple={true}
                                    variant="fifteenth"
                                />
                            </div>
                            {errors.userImage && (
                                // FIX: "text-error text-" tenia una clase de tamaño
                                // incompleta (cortada a la mitad), invalida en CSS.
                                // Se completa a text-small, consistente con el resto
                                // de mensajes de error del formulario.
                                <span className="text-error text-small">{errors.userImage}</span>
                            )}
                        </section>

                    
                        <Button
                            variant="fifth"
                            size="lgg"
                            type="submit"
                        >
                            Crear usuario
                        </Button>

                    </div>

                </form>
            </div>

        </div>
    )
}