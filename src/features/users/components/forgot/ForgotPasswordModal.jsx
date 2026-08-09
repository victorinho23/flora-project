import { useState } from "react";
import { Input, Button } from "@/shared";
import { forgotPasswordSchema, verifyTokenSchema, resetPasswordSchema } from "../../schemas/userSchema";

const MOCK_TOKEN = "123456"; // simula el token que llegaría por correo

export default function ForgotPasswordModal({ onClose }) {
    const [step, setStep] = useState(1); // 1: correo, 2: token, 3: nueva contraseña
    const [formData, setFormData] = useState({
        email: "",
        token: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSendEmail = (e) => {
        e.preventDefault();

        const result = forgotPasswordSchema.safeParse({ email: formData.email });
        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        alert(`Se ha enviado un correo de restablecimiento a ${formData.email}\n(simulado — token de prueba: ${MOCK_TOKEN})`);
        setStep(2);
    };

    const handleVerifyToken = (e) => {
        e.preventDefault();

        const result = verifyTokenSchema.safeParse({ token: formData.token });
        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setStep(3);
    };

    const handleResetPassword = (e) => {
        e.preventDefault();

        const result = resetPasswordSchema.safeParse({
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
        });
        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        alert("Contraseña actualizada correctamente");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

            {/** Fondo oscuro clickeable para cerrar */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/** Card del modal */}
            <div className="relative w-full max-w-md bg-fc-g950/95 backdrop-blur-xl border border-bd-w/10 rounded-2xl shadow-2xl p-8">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-bg-w/60 hover:text-bg-w text-xl leading-none"
                    aria-label="Cerrar"
                >
                    ✕
                </button>

                <h2 className="text-title text-bg-w font-bold mb-1">Recuperar contraseña</h2>
                <p className="text-caption text-bg-w/50 mb-6">
                    {step === 1 && "Ingresa tu correo para recibir un enlace"}
                    {step === 2 && "Ingresa el código que enviamos a tu correo"}
                    {step === 3 && "Crea tu nueva contraseña"}
                </p>

                {/** Indicador de pasos */}
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                s <= step ? "bg-br-t500" : "bg-bd-w/15"
                            }`}
                        />
                    ))}
                </div>

                {step === 1 && (
                    <form onSubmit={handleSendEmail} className="flex flex-col gap-6 justify-center items-center">
                        <Input
                            type="email"
                            name="email"
                            label="Correo electrónico"
                            placeholder="tucorreo@ejemplo.com"
                            htmlFor="recovery-email"
                            variant="cafe"
                            size="lg"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                        />
                        <Button variant="primary" size="lgg" type="submit">
                            Enviar enlace
                        </Button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyToken} className="flex flex-col gap-6 items-center ">
                        <Input
                            type="text"
                            name="token"
                            label="Código de verificación"
                            placeholder="Ingresa el código"
                            htmlFor="token"
                            variant="cafe"
                            size="lg"
                            value={formData.token}
                            onChange={handleChange}
                            error={errors.token}
                        />
                        <Button variant="primary" size="lgg" type="submit">
                            Verificar código
                        </Button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="flex flex-col gap-6 items-center">
                        <Input
                            type="password"
                            name="newPassword"
                            label="Nueva contraseña"
                            placeholder="Escribe tu nueva contraseña"
                            htmlFor="new-password"
                            variant="cafe"
                            size="lg"
                            value={formData.newPassword}
                            onChange={handleChange}
                            error={errors.newPassword}
                        />
                        <Input
                            type="password"
                            name="confirmPassword"
                            label="Confirma tu nueva contraseña"
                            placeholder="Repite la contraseña"
                            htmlFor="confirm-password"
                            variant="cafe"
                            size="lg"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                        />
                        <Button variant="primary" size="lgg" type="submit">
                            Actualizar contraseña
                        </Button>
                    </form>
                )}

            </div>
        </div>
    );
}