// backend/src/config/reportFilters.js
// Funciones para limpiar los filtros de los reportes que llegan por la url (req.query)
// todo lo que llega por la url es texto, aqui se convierte y se revisa antes de ir a la base

// error con codigo http para que el controller responda bien
const httpError = (status, message) => Object.assign(new Error(message), { status });

// "1,2,3" -> [1, 2, 3]   (con isText los deja como texto, para ids como "P001")
export const parseIds = (value, isText = false) => {
    if (!value) return [];

    const ids = String(value).split(",").map((id) => id.trim()).filter(Boolean);

    if (isText) return ids;

    if (ids.some((id) => !/^\d+$/.test(id))) throw httpError(400, "Los registros seleccionados no son validos");
    return ids.map(Number);
};

// "true" -> true, "false" -> false, cualquier otra cosa -> undefined (sin filtro)
export const parseBoolean = (value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
};

// solo deja pasar los valores permitidos, si no viene nada no se filtra
export const parseOption = (value, allowed, label) => {
    if (!value) return undefined;
    if (!allowed.includes(value)) throw httpError(400, `${label} no es valido`);
    return value;
};

// numero entero positivo (mesa, mesero...)
export const parseNumber = (value, label) => {
    if (!value) return undefined;
    if (!/^\d+$/.test(String(value))) throw httpError(400, `${label} no es valido`);
    return Number(value);
};

// fecha con formato YYYY-MM-DD, que es como la manda el input type="date"
export const parseDate = (value, label) => {
    if (!value) return undefined;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(new Date(value).getTime())) {
        throw httpError(400, `${label} no es una fecha valida`);
    }
    return value;
};
