// src/features/settings/services/scanService.js
// "escanear" el negocio: con la foto de un plano o croquis se buscan las lineas oscuras
// y se marcan como paredes en la cuadricula del mapa. Todo pasa en el navegador, no se sube la foto.

// abre la foto (archivo de la camara o de la galeria) y la deja lista para dibujar
export function readPhoto(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("No se pudo leer la foto"));
        reader.readAsDataURL(file);
    });
}

const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("La foto no se pudo abrir"));
    image.src = src;
});

// umbral de Otsu: el punto que mejor separa lo oscuro (lineas) de lo claro (papel o piso)
// asi funciona igual con fotos oscuras o muy iluminadas
function otsu(histogram, total) {
    let sum = 0;
    for (let value = 0; value < 256; value++) sum += value * histogram[value];
    let sumBack = 0;
    let weightBack = 0;
    let best = 0;
    let threshold = 128;
    for (let value = 0; value < 256; value++) {
        weightBack += histogram[value];
        if (!weightBack) continue;
        const weightFore = total - weightBack;
        if (!weightFore) break;
        sumBack += value * histogram[value];
        const meanBack = sumBack / weightBack;
        const meanFore = (sum - sumBack) / weightFore;
        const between = weightBack * weightFore * (meanBack - meanFore) ** 2;
        if (between > best) {
            best = between;
            threshold = value;
        }
    }
    return threshold;
}

// cuanto de cada celda tiene que ser oscuro para contarla como pared
export const SENSITIVITY = {
    baja: 0.45,
    media: 0.3,
    alta: 0.18,
};

// devuelve las celdas ("x,y") donde la foto tiene lineas oscuras
// la foto se estira al tamaño de la cuadricula (por eso conviene que columnas/filas se parezcan a la forma del plano)
export async function detectWalls(src, cols, rows, sensitivity = "media") {
    const image = await loadImage(src);
    // cada celda se revisa con 10x10 puntos
    const size = 10;
    const canvas = document.createElement("canvas");
    canvas.width = cols * size;
    canvas.height = rows * size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);

    // brillo de cada punto y su histograma para sacar el umbral
    const light = new Uint8Array(canvas.width * canvas.height);
    const histogram = new Array(256).fill(0);
    for (let index = 0; index < light.length; index++) {
        const value = Math.round(0.299 * data[index * 4] + 0.587 * data[index * 4 + 1] + 0.114 * data[index * 4 + 2]);
        light[index] = value;
        histogram[value]++;
    }
    const threshold = otsu(histogram, light.length);
    const needed = SENSITIVITY[sensitivity] ?? SENSITIVITY.media;

    const walls = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let dark = 0;
            for (let py = 0; py < size; py++) {
                for (let px = 0; px < size; px++) {
                    if (light[(y * size + py) * canvas.width + x * size + px] <= threshold) dark++;
                }
            }
            if (dark / (size * size) >= needed) walls.push(`${x},${y}`);
        }
    }
    return walls;
}

// columnas y filas que mas se parecen a la forma de la foto, dentro de los limites del mapa
export async function suggestSize(src) {
    const image = await loadImage(src);
    const ratio = image.width / image.height;
    let cols = 20;
    let rows = Math.round(cols / ratio);
    if (rows > 20) {
        rows = 20;
        cols = Math.round(rows * ratio);
    }
    return {
        cols: Math.min(30, Math.max(8, cols)),
        rows: Math.min(20, Math.max(6, rows)),
    };
}
