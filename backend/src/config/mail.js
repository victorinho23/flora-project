// backend/src/config/mail.js
// manda correos con nodemailer usando los datos SMTP del .env
// si no hay SMTP configurado (por ejemplo en desarrollo) el correo se muestra en la consola,
// asi se puede probar todo sin tener una cuenta de correo lista

let transporter = null;

const smtpReady = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

// se crea una sola vez y se reutiliza
async function getTransporter() {
    if (transporter) return transporter;
    const { default: nodemailer } = await import("nodemailer");
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        // el puerto 465 usa conexion segura desde el inicio, el 587 la sube despues
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    return transporter;
}

export async function sendMail({ to, subject, html, text }) {
    if (!smtpReady()) {
        console.log(`\n[correo sin SMTP] Para: ${[].concat(to).join(", ")}\nAsunto: ${subject}\n${text}\n`);
        return;
    }

    const mailer = await getTransporter();
    await mailer.sendMail({
        from: process.env.MAIL_FROM || `Flora <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text,
    });
}
