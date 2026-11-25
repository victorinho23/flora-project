// src/features/users/components/DataPolicyModal.jsx
// Politica de tratamiento de datos personales de Flora, en una ventana (es solo lectura)
// se abre desde el login, al crear un usuario y desde Mi perfil
import { ShieldCheck } from "lucide-react";
import { DetailModal } from "@/shared";

// correo al que se mandan consultas y reclamos sobre los datos
export const SUPPORT_EMAIL = "vcastrillon281@gmail.com";

// cada bloque de la politica: titulo y parrafos o lista
const SECTIONS = [
    {
        title: "1. Quién es el responsable",
        text: [
            `Flora (restaurante y café) es la responsable del tratamiento de los datos personales que se registran en este sistema. Para cualquier consulta o reclamo sobre tus datos puedes escribir a ${SUPPORT_EMAIL}.`,
            "Esta política sigue la Ley 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y toma como referencia la Política General de Seguridad de la Información y Protección de Datos Personales del SENA (Acuerdo 013 de 2019).",
        ],
    },
    {
        title: "2. Qué datos se guardan",
        list: [
            "Identificación: nombre completo, tipo y número de documento.",
            "Contacto: correo personal, correo empresarial, teléfonos y dirección.",
            "Datos laborales: rol (administrador, mesero, cocinero u otro), fechas de inicio y fin del contrato y estado de la cuenta.",
            "Foto de perfil (opcional).",
            "Uso del sistema: órdenes que atiende, cambios que hace o le hacen a su cuenta, intentos de inicio de sesión y solicitudes para recuperar la contraseña.",
        ],
        text: ["Flora no pide datos sensibles (salud, origen, creencias, datos biométricos ni similares)."],
    },
    {
        title: "3. Para qué se usan",
        list: [
            "Crear la cuenta, permitir el ingreso y asignar los permisos de cada persona.",
            "Registrar quién atiende cada orden y mesa, y quién hace cada cambio en el sistema (registro de cambios).",
            "Comunicarse con la persona por asuntos de su trabajo en el restaurante.",
            "Proteger las cuentas: bloquear accesos sospechosos y enviar el código para recuperar la contraseña.",
            "Generar los reportes internos del restaurante.",
        ],
        text: ["Los datos no se venden ni se comparten con terceros, salvo que una autoridad lo pida de acuerdo con la ley."],
    },
    {
        title: "4. Tus derechos como titular",
        list: [
            "Conocer, actualizar y corregir tus datos.",
            "Pedir prueba de la autorización que diste.",
            "Saber cómo se han usado tus datos.",
            "Presentar quejas ante la Superintendencia de Industria y Comercio.",
            "Revocar la autorización o pedir que se borren tus datos, cuando no exista un deber legal o contractual de conservarlos.",
            "Consultar tus datos gratis.",
        ],
    },
    {
        title: "5. Cómo se cuidan",
        list: [
            "Las contraseñas y los códigos de recuperación se guardan cifrados; nadie puede leerlos.",
            "Cada persona solo ve y hace lo que le permiten sus permisos.",
            "La sesión vence sola y la cuenta se bloquea si se equivocan varias veces con la contraseña.",
        ],
    },
    {
        title: "6. Consultas y reclamos",
        text: [
            `Escribe a ${SUPPORT_EMAIL} con tu nombre, documento y lo que necesitas. Las consultas se responden en máximo 10 días hábiles y los reclamos en máximo 15 días hábiles; si hace falta más tiempo se te avisa antes de que se cumpla el plazo.`,
            "Los datos se conservan mientras dure la relación laboral con el restaurante y el tiempo adicional que exija la ley.",
        ],
    },
];

export default function DataPolicyModal({ open, onClose }) {
    return (
        <DetailModal
            open={open}
            onClose={onClose}
            icon={ShieldCheck}
            title="Tratamiento de datos personales"
            subtitle="Cómo Flora usa y protege tus datos"
            size="max-w-3xl"
            bodyClassName="grid-cols-1"
        >
            <article className="flex flex-col gap-5 text-left">
                {SECTIONS.map((section) => (
                    <section key={section.title} className="flex flex-col gap-2">
                        <h3 className="text-m3-title-medium font-bold text-br-t950">{section.title}</h3>
                        {section.list && (
                            <ul className="list-disc pl-5 flex flex-col gap-1 text-m3-body-medium text-br-s900">
                                {section.list.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                        )}
                        {section.text?.map((paragraph) => (
                            <p key={paragraph} className="text-m3-body-medium text-br-s900">{paragraph}</p>
                        ))}
                    </section>
                ))}
            </article>
        </DetailModal>
    );
}
