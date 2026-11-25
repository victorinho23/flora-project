// backend/src/middlewares/rateLimit.middleware.js
// limita cuantas veces se puede llamar una ruta desde el mismo equipo (IP) en un tiempo
// sirve para el login: el bloqueo por cuenta ya existe, esto frena a quien prueba muchos correos distintos

export const rateLimit = ({ max, windowMinutes, message }) => {
    // ip -> { count, resetAt }. Map = buscar la ip es directo, no recorre nada
    const hits = new Map();
    const windowMs = windowMinutes * 60 * 1000;

    // cada ventana se limpian las ip viejas para que el Map no crezca sin fin
    setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of hits) if (entry.resetAt <= now) hits.delete(ip);
    }, windowMs).unref();

    return (req, res, next) => {
        const now = Date.now();
        const ip = req.ip;
        const entry = hits.get(ip);

        if (!entry || entry.resetAt <= now) {
            hits.set(ip, { count: 1, resetAt: now + windowMs });
            return next();
        }

        entry.count += 1;
        if (entry.count > max) {
            const minutes = Math.ceil((entry.resetAt - now) / 60000);
            res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
            return res.status(429).json({ error: `${message} Intenta de nuevo en ${minutes} minuto(s).` });
        }
        next();
    };
};
