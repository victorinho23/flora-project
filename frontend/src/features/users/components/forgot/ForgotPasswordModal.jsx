// Ventana para recuperar la contraseña en 3 pasos: correo -> codigo de 6 numeros -> contraseña nueva
// a la izquierda un panel con los pasos, a la derecha el paso actual
import { useState, useEffect, useRef } from "react";
import { Mail, ShieldCheck, KeyRound, Check, X, ArrowLeft, RotateCw, Eye, EyeOff } from "lucide-react";
import { Input, Button } from "@/shared";
import { forgotPasswordSchema, resetPasswordSchema } from "../../schemas/userSchema";
import { SUPPORT_EMAIL } from "../DataPolicyModal";
import { requestRecoveryCode, verifyRecoveryCode, resetPassword } from "@/features/auth/services/authService";

// pasos del panel izquierdo
const STEPS = [
    { title: "Tu correo", sub: "Te enviamos un código", icon: Mail },
    { title: "Código", sub: "6 números, vence en 10 min", icon: ShieldCheck },
    { title: "Nueva contraseña", sub: "Exactamente 10 caracteres", icon: KeyRound },
];

// segundos que hay que esperar para pedir otro codigo
const RESEND_SECONDS = 60;

// pasa los errores del esquema a { campo: mensaje }
const toErrors = (result) => {
    const fieldErrors = {};
    result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] ??= issue.message;
    });
    return fieldErrors;
};

export default function ForgotPasswordModal({ onClose }) {
    const [step, setStep] = useState(0); // 0: correo, 1: codigo, 2: contraseña, 3: listo
    const [email, setEmail] = useState("");
    const [digits, setDigits] = useState(["", "", "", "", "", ""]);
    const [resetToken, setResetToken] = useState("");
    const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [wait, setWait] = useState(0);
    const digitRefs = useRef([]);
    const panelRef = useRef(null);

    // cuenta regresiva para volver a pedir el codigo
    useEffect(() => {
        if (wait <= 0) return;
        const timer = setTimeout(() => setWait(wait - 1), 1000);
        return () => clearTimeout(timer);
    }, [wait]);

    // al cambiar de paso el foco va al primer campo; con Escape se cierra
    useEffect(() => {
        panelRef.current?.querySelector("input")?.focus();
    }, [step]);
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // ----- paso 1: pedir el codigo -----
    const sendCode = async (e) => {
        e?.preventDefault();
        const result = forgotPasswordSchema.safeParse({ email });
        if (!result.success) return setErrors({ email: "Escribe un correo válido" });
        setErrors({});
        setLoading(true);
        try {
            await requestRecoveryCode(email.trim());
            setDigits(["", "", "", "", "", ""]);
            setWait(RESEND_SECONDS);
            setStep(1);
        } catch (error) {
            setErrors({ email: error.message });
        } finally {
            setLoading(false);
        }
    };

    // ----- paso 2: el codigo en 6 cajitas -----
    const setDigit = (index, value) => {
        const clean = value.replace(/\D/g, "");
        // si pegan el codigo completo se reparte en las cajitas
        if (clean.length > 1) {
            const next = clean.slice(0, 6).split("");
            setDigits([...next, ...Array(6 - next.length).fill("")]);
            digitRefs.current[Math.min(next.length, 5)]?.focus();
            return;
        }
        setDigits((prev) => prev.map((digit, i) => (i === index ? clean : digit)));
        if (clean && index < 5) digitRefs.current[index + 1]?.focus();
    };
    const onDigitKey = (index, e) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) digitRefs.current[index - 1]?.focus();
        if (e.key === "ArrowLeft" && index > 0) digitRefs.current[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < 5) digitRefs.current[index + 1]?.focus();
    };
    const checkCode = async (e) => {
        e.preventDefault();
        const code = digits.join("");
        if (code.length < 6) return setErrors({ code: "Escribe los 6 números del código" });
        setErrors({});
        setLoading(true);
        try {
            const data = await verifyRecoveryCode(email.trim(), code);
            setResetToken(data.resetToken);
            setStep(2);
        } catch (error) {
            setErrors({ code: error.message });
            // si el codigo ya no sirve se limpian las cajitas
            if (error.status === 429 || /venció|nuevo/.test(error.message)) setDigits(["", "", "", "", "", ""]);
        } finally {
            setLoading(false);
        }
    };

    // ----- paso 3: contraseña nueva -----
    const savePassword = async (e) => {
        e.preventDefault();
        const result = resetPasswordSchema.safeParse(passwords);
        if (!result.success) return setErrors(toErrors(result));
        setErrors({});
        setLoading(true);
        try {
            await resetPassword(resetToken, passwords.newPassword);
            setStep(3);
        } catch (error) {
            setErrors({ [error.field ?? "newPassword"]: error.message });
        } finally {
            setLoading(false);
        }
    };

    const titles = [
        ["¿Olvidaste tu contraseña?", "Escribe el correo con el que entras a Flora y te enviamos un código."],
        ["Revisa tu correo", <>Escribe el código de 6 números que enviamos a <b className="text-br-s950">{email}</b>.</>],
        ["Crea tu nueva contraseña", "Debe tener exactamente 10 caracteres, con mayúscula, minúscula, número y símbolo."],
        ["¡Listo!", "Tu contraseña se cambió. Ya puedes iniciar sesión con la nueva."],
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* fondo oscuro: tocarlo cierra */}
            <div className="absolute inset-0 bg-bg-s950/60 backdrop-blur-sm" onClick={onClose} />

            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="recovery-title"
                className="relative w-full max-w-3xl flex flex-col sm:flex-row bg-bg-w rounded-m3-xl shadow-m3-5 overflow-hidden"
            >
                {/* ===== panel izquierdo con los pasos ===== */}
                <aside className="relative sm:w-64 shrink-0 flex flex-col gap-6 p-6 sm:p-7 overflow-hidden bg-linear-170 from-bg-t50 to-bg-p50 border-b sm:border-b-0 sm:border-r border-bd-t300">
                    {/* mancha de luz que baja con cada paso */}
                    <span aria-hidden="true" className="pointer-events-none absolute -left-16 w-56 h-56 rounded-m3-full bg-bg-t300/50 blur-3xl transition-all duration-700 ease-out" style={{ top: `${step * 22 - 10}%` }} />
                    <div className="relative">
                        <span className="text-m3-label-large font-bold uppercase tracking-wider text-br-t900">Flora</span>
                        <p className="text-m3-title-large font-bold text-br-s950">Recuperar acceso</p>
                    </div>
                    <ol className="relative flex sm:flex-col gap-4 sm:gap-5">
                        {STEPS.map((item, index) => {
                            const done = index < step;
                            const now = index === step;
                            return (
                                <li key={item.title} className="flex items-center gap-3 min-w-0" aria-current={now ? "step" : undefined}>
                                    <span className={`w-10 h-10 shrink-0 rounded-m3-md border grid place-items-center transition-colors duration-300 ${done ? "bg-m3-success border-transparent text-bg-w" : now ? "bg-bg-t800 border-transparent text-bg-w ring-4 ring-bg-t300/50" : "bg-bg-w border-bd-t300 text-br-t900"}`}>
                                        {done ? <Check size={18} /> : <item.icon size={18} />}
                                    </span>
                                    <span className="hidden sm:flex flex-col min-w-0">
                                        <span className={`text-m3-title-small font-bold ${done || now ? "text-br-s950" : "text-br-s800"}`}>{item.title}</span>
                                        <span className="text-m3-body-small text-br-s800">{item.sub}</span>
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                    <p className="relative hidden sm:block mt-auto text-m3-body-small text-br-s800">
                        Si no te llega el correo, revisa la carpeta de spam o escribe a soporte:{" "}
                        <a href={`mailto:${SUPPORT_EMAIL}?subject=Soporte%20Flora`} className="font-semibold text-br-t900 underline break-all">{SUPPORT_EMAIL}</a>
                    </p>
                </aside>

                {/* ===== paso actual ===== */}
                <section className="relative flex-1 min-w-0 flex flex-col gap-6 p-6 sm:p-9">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="m3-state absolute top-4 right-4 w-10 h-10 rounded-m3-full grid place-items-center text-br-s800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col gap-1.5 pr-10">
                        <h2 id="recovery-title" className="text-m3-headline-small font-bold text-br-s950">{titles[step][0]}</h2>
                        <p className="text-m3-body-medium text-br-s800">{titles[step][1]}</p>
                    </div>

                    {step === 0 && (
                        <form onSubmit={sendCode} noValidate className="flex flex-col items-start gap-6 [&_.w-80]:w-full">
                            <Input
                                type="email"
                                name="email"
                                label="Correo electrónico"
                                placeholder="tucorreo@ejemplo.com"
                                htmlFor="recovery-email"
                                variant="latte"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={errors.email}
                            />
                            <Button variant="espresso" size="md" type="submit" disabled={loading}>
                                <Mail size={18} />
                                {loading ? "Enviando..." : "Enviar código"}
                            </Button>
                        </form>
                    )}

                    {step === 1 && (
                        <form onSubmit={checkCode} noValidate className="flex flex-col gap-5">
                            <fieldset className="flex flex-col gap-2">
                                <legend className="sr-only">Código de 6 números</legend>
                                <div className="flex gap-2 sm:gap-3">
                                    {digits.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (digitRefs.current[index] = el)}
                                            value={digit}
                                            onChange={(e) => setDigit(index, e.target.value)}
                                            onKeyDown={(e) => onDigitKey(index, e)}
                                            onFocus={(e) => e.target.select()}
                                            inputMode="numeric"
                                            autoComplete={index === 0 ? "one-time-code" : "off"}
                                            maxLength={6}
                                            aria-label={`Número ${index + 1} del código`}
                                            className={`w-11 h-14 sm:w-13 sm:h-16 rounded-m3-md border-2 bg-bg-w text-center text-m3-headline-small font-bold text-br-t950 shadow-m3-1 transition-colors focus:outline-none focus:border-bd-t800 focus:ring-4 focus:ring-bg-t300/40 ${errors.code ? "border-m3-error" : digit ? "border-bd-t800" : "border-bd-s400"}`}
                                        />
                                    ))}
                                </div>
                                {errors.code && <span className="text-m3-body-small font-semibold text-m3-error">{errors.code}</span>}
                            </fieldset>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button variant="espresso" size="md" type="submit" disabled={loading}>
                                    <ShieldCheck size={18} />
                                    {loading ? "Revisando..." : "Verificar código"}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => sendCode()}
                                    disabled={wait > 0 || loading}
                                    className="m3-state inline-flex items-center gap-1.5 h-10 px-3 rounded-m3-full text-m3-label-large font-semibold text-br-t900 disabled:text-br-s500 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-focus"
                                >
                                    <RotateCw size={16} />
                                    {wait > 0 ? `Reenviar en ${wait} s` : "Reenviar código"}
                                </button>
                            </div>
                            <button type="button" onClick={() => { setErrors({}); setStep(0); }} className="self-start inline-flex items-center gap-1.5 text-m3-body-medium text-br-s800 hover:text-br-t900">
                                <ArrowLeft size={16} />
                                Cambiar el correo
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={savePassword} noValidate className="flex flex-col items-start gap-5 [&_.w-80]:w-full">
                            <div className="relative w-full">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="newPassword"
                                    label="Nueva contraseña"
                                    placeholder="Exactamente 10 caracteres"
                                    htmlFor="new-password"
                                    variant="latte"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                                    error={errors.newPassword}
                                />
                                {/* ojito para ver lo que se escribe */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    className="absolute right-2 top-7 w-9 h-9 rounded-m3-full grid place-items-center text-br-s800 hover:text-br-t900"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                label="Confirma la contraseña"
                                placeholder="Escríbela otra vez"
                                htmlFor="confirm-password"
                                variant="latte"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                error={errors.confirmPassword}
                            />
                            <Button variant="espresso" size="md" type="submit" disabled={loading}>
                                <KeyRound size={18} />
                                {loading ? "Guardando..." : "Guardar contraseña"}
                            </Button>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col items-start gap-5">
                            <span className="w-16 h-16 rounded-m3-full bg-m3-success-container text-m3-success grid place-items-center">
                                <Check size={32} />
                            </span>
                            <Button variant="espresso" size="md" type="button" onClick={onClose}>
                                Ir a iniciar sesión
                            </Button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
