// User register form para registrar un usuario
import { useState, useEffect } from "react";
import { User, IdCard, Contact, CalendarDays, ImagePlus } from "lucide-react";
import { Input, Select, Button, Imageinput, Navbar } from "@/shared";
import { getDocumentTypes } from "@/services/selectServices";
import { getTypeUser } from "@/services/selectServices";
import { useNavigate } from "react-router-dom"
import { userSchema } from "../schemas/userSchema";
import { showSuccesAlert, showCreateUserErrorAlert } from "@/shared/services/alertService";
import fotoFondo from "@/assets/images/fondo-users.png";
import { users } from "../data/users";


export default function UserRegisterForm(){
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});   

    const [formData, setFormData] = useState({
        userName: "",
        userEmail: "",
        userEmailConfirm: "",
        userBusinessEmail: "",
        userBusinessEmailConfirm: "",
        userPhone: "",
        userPhoneSecondary: "",
        userDocumentTypes: "",
        userType: "",
        userDocumentNumber: "",
        userPassword: "",
        userImage: [],
        userAddress:"",
        userContractStartDate:"",
        userContractEndDate:"",

        isStaff: false,
        isActive: true,
        isSuperUser: false,
    });

    const [showBusinessEmail, setShowBusinessEmail] = useState(false);
    const [showSecondaryPhone, setShowSecondaryPhone] = useState(false);

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked: value,
        }))
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
            await showCreateUserErrorAlert({
                title: "Error al crear usuario",
                text: "Revisa los campos marcados en el formulario",
                timer: 3000,
            });
            return;
        }

        // El correo y el documento deben ser unicos en el sistema
        const others = users.filter((item) => Boolean(item));
        const duplicateErrors = {};
        if (others.some((item) => item.useremail.toLowerCase() === result.data.userEmail.toLowerCase())) duplicateErrors.userEmail = "Este correo ya está registrado";
        if (others.some((item) => item.document_number === result.data.userDocumentNumber)) duplicateErrors.userDocumentNumber = "Este número de documento ya está en uso";
        if (Object.keys(duplicateErrors).length) {
            setErrors(duplicateErrors);
            return;
        }

        setErrors({});

        try{
            await showSuccesAlert({
                title: "Usuario creado",
                text: "El usuario fue creado correctamente",
                timer: 3000,
            });
            navigate("/viewUser")
        } catch(error){
            console.log("Error: ", error.message)
            await showCreateUserErrorAlert({
                text: error.message,
                timer: 3000,
            })
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
            <Navbar
                variant="banda"
                image={fotoFondo}
                icon={User}
                title="Creación de usuario"
                onBack={() => navigate("/home")}
                actions={
                    <>
                        <Button variant="crema" size="sm" type="button" onClick={() => navigate("/userList")}>
                            Ver listado
                        </Button>
                    </>
                }
            />

            {/** Contenido */}
            <div className="flex justify-center px-4 sm:px-8 py-6 xl:py-4 bajo:xl:py-3">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-8xl grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start gap-6 bajo:gap-4 [&_.w-80]:w-full"
                >
                    <div className="border border-bd-s100 border-t-[5px] border-t-bd-t800 rounded-[1.25rem] bg-bg-w bg-linear-180 from-bg-w to-bg-p50 shadow-[0_26px_50px_-28px_color-mix(in_srgb,var(--color-bg-s950)_55%,transparent)] p-5 sm:p-6 bajo:sm:p-5 grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-6 bajo:gap-y-4 xl:items-start">
                        <div className="flex flex-col gap-5 bajo:gap-3 xl:col-start-1 xl:row-start-1">
                            <h2 className="self-stretch flex items-center gap-2 text-base md:text-lg font-bold text-br-s950 border-b border-bd-s100 pb-2">
                                <span className="w-7 h-7 rounded-full grid place-items-center text-sm font-bold shrink-0 bg-bg-s950 text-bg-w">{1}</span>
                                <IdCard className="w-5 h-5 shrink-0 text-br-t900" />
                                Identificación
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 bajo:gap-3 items-end">
                                <Input
                                    type="text"
                                    name="userName"
                                    label="Nombre"
                                    value={formData.userName}
                                    placeholder="Escribe tu nombre"
                                    htmlFor="user-name"
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
                                    htmlFor="user-document-number"
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
                            </div>
                        </div>

                        <div className="flex flex-col gap-5 bajo:gap-3 xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:border-l xl:border-bd-s100 xl:pl-8">
                            <h2 className="self-stretch flex items-center gap-2 text-base md:text-lg font-bold text-br-s950 border-b border-bd-s100 pb-2">
                                <span className="w-7 h-7 rounded-full grid place-items-center text-sm font-bold shrink-0 bg-bg-s950 text-bg-w">{2}</span>
                                <Contact className="w-5 h-5 shrink-0 text-br-t900" />
                                Contacto y acceso
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:[&>div]:col-span-2 gap-4 bajo:gap-3 items-end">
                                <Input
                                    name="userEmail"
                                    type="email"
                                    label="Correo electronico"
                                    value={formData.userEmail}
                                    placeholder="Escribe tu Correo Electronico"
                                    htmlFor="user-email"
                                    variant="latte"
                                    onChange={handleChange}
                                    error={errors.userEmail}
                                />

                                <Input
                                    name="userEmailConfirm"
                                    type="email"
                                    label="Confirmar correo electronico"
                                    value={formData.userEmailConfirm}
                                    placeholder="Confirma tu correo electronico"
                                    htmlFor="user-email-confirm"
                                    variant="latte"
                                    onChange={handleChange}
                                    error={errors.userEmailConfirm}
                                />

                                <Input
                                    name="userPassword"
                                    type="password"
                                    label="Contraseña"
                                    value={formData.userPassword}
                                    placeholder="Escribe tu contraseña"
                                    htmlFor="user-password"
                                    variant="latte"
                                    onChange={handleChange}
                                    error={errors.userPassword}
                                />

                                <Input
                                    name="userAddress"
                                    type="text"
                                    label="Direccion"
                                    value={formData.userAddress}
                                    placeholder="Direccion"
                                    htmlFor="user-direction"
                                    variant="latte"
                                    onChange={handleChange}
                                    error={errors.userAddress}
                                />

                                <Input
                                    name="userPhone"
                                    type="tel"
                                    label="Telefono"
                                    value={formData.userPhone}
                                    placeholder="Escribe tu numero de telefono"
                                    htmlFor="user-Phone"
                                    variant="latte"
                                    onChange={handleChange}
                                    error={errors.userPhone}
                                />

                                {showSecondaryPhone ? (
                                    <Input
                                        name="userPhoneSecondary"
                                        type="tel"
                                        label="Telefono secundario"
                                        value={formData.userPhoneSecondary}
                                        placeholder="Escribe un segundo numero de telefono"
                                        htmlFor="user-phone-secondary"
                                        variant="latte"
                                        onChange={handleChange}
                                        error={errors.userPhoneSecondary}
                                    />
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={() => setShowSecondaryPhone(true)}
                                        className="w-full h-12 rounded-md bg-[var(--color-white)] text-[var(--color-secundary-900)] border border-[var(--color-secundary-400)] flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                                    >
                                        Teléfono secundario
                                    </Button>
                                )}

                                {showBusinessEmail ? (
                                    <>
                                        <Input
                                            name="userBusinessEmail"
                                            type="email"
                                            label="Correo empresarial"
                                            value={formData.userBusinessEmail}
                                            placeholder="Correo empresarial"
                                            htmlFor="user-business-email"
                                            variant="latte"
                                            onChange={handleChange}
                                            error={errors.userBusinessEmail}
                                        />

                                        <Input
                                            name="userBusinessEmailConfirm"
                                            type="email"
                                            label="Confirmar correo empresarial"
                                            value={formData.userBusinessEmailConfirm}
                                            placeholder="Confirma el correo empresarial"
                                            htmlFor="user-business-email-confirm"
                                            variant="latte"
                                            onChange={handleChange}
                                            error={errors.userBusinessEmailConfirm}
                                        />
                                    </>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={() => setShowBusinessEmail(true)}
                                        className="w-full h-12 rounded-md bg-[var(--color-white)] text-[var(--color-secundary-900)] border border-[var(--color-secundary-400)] flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                                    >
                                        Correo empresarial
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-5 bajo:gap-3 xl:col-start-1 xl:row-start-2">
                            <h2 className="self-stretch flex items-center gap-2 text-base md:text-lg font-bold text-br-s950 border-b border-bd-s100 pb-2">
                                <span className="w-7 h-7 rounded-full grid place-items-center text-sm font-bold shrink-0 bg-bg-s950 text-bg-w">{3}</span>
                                <CalendarDays className="w-5 h-5 shrink-0 text-br-t900" />
                                Temporalidad del Contrato
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bajo:gap-3 items-end">
                                <Input
                                    name="userContractStartDate"
                                    type="date"
                                    label="Fecha inicio contrato"
                                    value={formData.userContractStartDate}
                                    htmlFor="user-contract-start"
                                    variant="latte"
                                    onChange={handleChange}
                                    error={errors.userContractStartDate}
                                />

                                {formData.userType !== "ADMIN" && (
                                    <Input
                                        name="userContractEndDate"
                                        type="date"
                                        label="Fecha fin contrato"
                                        value={formData.userContractEndDate}
                                        htmlFor="user-contract-end"
                                        variant="latte"
                                        onChange={handleChange}
                                        error={errors.userContractEndDate}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">

                        <div className="flex flex-col gap-4 bajo:gap-3 rounded-2xl bg-bg-s950 bg-linear-120 from-bg-s950 via-bg-s800 via-55% to-bg-t950 p-5 bajo:p-4 shadow-xl items-center w-full">
                            <h2 className="self-stretch flex items-center gap-2 text-base md:text-lg font-bold text-bg-w border-b border-bd-w/20 pb-2">
                                <span className="w-7 h-7 rounded-full grid place-items-center text-sm font-bold shrink-0 bg-bg-w text-br-s950">{4}</span>
                                <ImagePlus className="w-5 h-5 shrink-0 text-br-t100" />
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

                            <p className="text-sm text-bg-w text-center">Tamaño máximo: 2 MB</p>

                            {errors.userImage && (
                                <span className="inline-block rounded bg-red-50 px-2 py-0.5 text-red-900 font-medium text-small">{errors.userImage}</span>
                            )}

                            <Button
                                variant="caramelo"
                                size="lgg"
                                type="submit"
                            >
                                Crear usuario
                            </Button>
                        </div>

                    </div>

                </form>
            </div>

        </div>
    )
}