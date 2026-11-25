// src/features/settings/services/scanService.js
// "escanear" el negocio desde la foto de un plano (mapa de evacuacion, croquis, captura de una app):
// 1. se endereza la foto con las 4 esquinas que marca el administrador
// 2. se buscan las lineas oscuras comparando cada punto con su alrededor (asi no importa si hay sombra)
// 3. se botan las letras, numeros e iconos (manchas pequeñas) y quedan las lineas largas: las paredes
// 4. lo verde (las salidas del mapa de evacuacion) se puede marcar como Entrada
// Todo pasa en el navegador: la foto no se sube a ningun lado y funciona sin internet

// abre la foto (archivo de la camara o de la galeria)
export function readPhoto(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("No se pudo leer la foto"));
        reader.readAsDataURL(file);
    });
}

export const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("La foto no se pudo abrir"));
    image.src = src;
});

// pasa la imagen a un canvas sin pasarse de cierto tamaño (fotos de 12 MP serian muy lentas)
function toCanvas(image, maxSide) {
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d", { willReadFrequently: true }).drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
}

// ---------- 1. enderezar la foto ----------

// resuelve un sistema de ecuaciones lineales (eliminacion de Gauss)
function solve(matrix, values) {
    const n = values.length;
    const a = matrix.map((row, index) => [...row, values[index]]);
    for (let col = 0; col < n; col++) {
        let pivot = col;
        for (let row = col + 1; row < n; row++) if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
        [a[col], a[pivot]] = [a[pivot], a[col]];
        for (let row = 0; row < n; row++) {
            if (row === col) continue;
            const factor = a[row][col] / a[col][col];
            for (let k = col; k <= n; k++) a[row][k] -= factor * a[col][k];
        }
    }
    return a.map((row, index) => row[n] / row[index]);
}

// homografia: dice a que punto de la foto corresponde cada punto (u, v) del cuadrado 0..1
// corners: [arriba-izquierda, arriba-derecha, abajo-derecha, abajo-izquierda] en pixeles de la foto
function homography(corners) {
    const square = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const rows = [];
    const values = [];
    square.forEach(([u, v], index) => {
        const [x, y] = corners[index];
        rows.push([u, v, 1, 0, 0, 0, -u * x, -v * x]);
        values.push(x);
        rows.push([0, 0, 0, u, v, 1, -u * y, -v * y]);
        values.push(y);
    });
    const [a, b, c, d, e, f, g, h] = solve(rows, values);
    return (u, v) => {
        const w = g * u + h * v + 1;
        return [(a * u + b * v + c) / w, (d * u + e * v + f) / w];
    };
}

const distance = ([x1, y1], [x2, y2]) => Math.hypot(x2 - x1, y2 - y1);

// endereza la foto: lo que esta dentro de las 4 esquinas queda como si se hubiera tomado desde arriba
// corners va en proporciones (0..1) de la foto, como los guarda la ventana de escanear
// devuelve la foto enderezada (dataURL) y su tamaño
export async function straightenPhoto(src, corners) {
    const image = await loadImage(src);
    const source = toCanvas(image, 2000);
    const { width: sw, height: sh } = source;
    const points = corners.map(([x, y]) => [x * sw, y * sh]);

    // el tamaño de la salida sale de lo que miden los lados en la foto
    const outW = Math.max(distance(points[0], points[1]), distance(points[3], points[2]));
    const outH = Math.max(distance(points[0], points[3]), distance(points[1], points[2]));
    const scale = Math.min(1, 1400 / Math.max(outW, outH));
    const width = Math.max(1, Math.round(outW * scale));
    const height = Math.max(1, Math.round(outH * scale));

    const map = homography(points);
    const input = source.getContext("2d").getImageData(0, 0, sw, sh).data;
    const output = new ImageData(width, height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const [fx, fy] = map((x + 0.5) / width, (y + 0.5) / height);
            const px = Math.min(sw - 1, Math.max(0, Math.round(fx)));
            const py = Math.min(sh - 1, Math.max(0, Math.round(fy)));
            const from = (py * sw + px) * 4;
            const to = (y * width + x) * 4;
            output.data[to] = input[from];
            output.data[to + 1] = input[from + 1];
            output.data[to + 2] = input[from + 2];
            output.data[to + 3] = 255;
        }
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").putImageData(output, 0, 0);
    return { src: canvas.toDataURL("image/jpeg", 0.85), width, height };
}

// revisa un cuadro alrededor de cada punto: "any" = hay al menos un 1 (dilatar), "all" = todos son 1 (erosionar)
// con la tabla de sumas cada cuadro sale en 4 operaciones
function squareFilter(mask, width, height, radius, mode) {
    const integral = new Int32Array((width + 1) * (height + 1));
    for (let y = 1; y <= height; y++) {
        let row = 0;
        for (let x = 1; x <= width; x++) {
            row += mask[(y - 1) * width + x - 1];
            integral[y * (width + 1) + x] = integral[(y - 1) * (width + 1) + x] + row;
        }
    }
    const out = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
        const y1 = Math.max(0, y - radius);
        const y2 = Math.min(height, y + radius + 1);
        for (let x = 0; x < width; x++) {
            const x1 = Math.max(0, x - radius);
            const x2 = Math.min(width, x + radius + 1);
            const count = integral[y2 * (width + 1) + x2] - integral[y1 * (width + 1) + x2] - integral[y2 * (width + 1) + x1] + integral[y1 * (width + 1) + x1];
            out[y * width + x] = mode === "any" ? (count > 0 ? 1 : 0) : (count === (x2 - x1) * (y2 - y1) ? 1 : 0);
        }
    }
    return out;
}

// busca sola las 4 esquinas de la hoja del plano dentro de la foto:
// la hoja es lo claro y grande; se toma la mancha clara mas grande y sus 4 puntas
// (arriba-izq = la menor x+y, abajo-der = la mayor x+y, arriba-der = la mayor x-y, abajo-izq = la menor x-y)
// devuelve las esquinas en proporciones 0..1, o null si no encuentra una hoja clara
export async function detectCorners(src) {
    const image = await loadImage(src);
    const canvas = toCanvas(image, 500);
    const { width, height } = canvas;
    const { data } = canvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, width, height);

    // brillo de cada punto y umbral de Otsu para separar la hoja (clara) del fondo
    const gray = new Uint8Array(width * height);
    const histogram = new Array(256).fill(0);
    for (let index = 0; index < gray.length; index++) {
        const value = Math.round(0.299 * data[index * 4] + 0.587 * data[index * 4 + 1] + 0.114 * data[index * 4 + 2]);
        gray[index] = value;
        histogram[value]++;
    }
    let sum = 0;
    for (let value = 0; value < 256; value++) sum += value * histogram[value];
    let sumBack = 0, weightBack = 0, best = 0, threshold = 128;
    for (let value = 0; value < 256; value++) {
        weightBack += histogram[value];
        if (!weightBack) continue;
        const weightFore = gray.length - weightBack;
        if (!weightFore) break;
        sumBack += value * histogram[value];
        const between = weightBack * weightFore * (sumBack / weightBack - (sum - sumBack) / weightFore) ** 2;
        if (between > best) {
            best = between;
            threshold = value;
        }
    }

    // las paredes y letras dibujadas en la hoja la parten en pedazos; se "cierran" (dilatar y luego erosionar)
    // para que la hoja quede como una sola mancha clara
    const bright = new Uint8Array(width * height);
    for (let index = 0; index < gray.length; index++) bright[index] = gray[index] > threshold ? 1 : 0;
    const radius = Math.max(2, Math.round(Math.max(width, height) * 0.02));
    const closed = squareFilter(squareFilter(bright, width, height, radius, "any"), width, height, radius, "all");

    // mancha clara mas grande (los puntos claros pegados entre si)
    const seen = new Uint8Array(width * height);
    const stack = new Int32Array(width * height);
    let biggest = null;
    for (let start = 0; start < gray.length; start++) {
        if (seen[start] || !closed[start]) continue;
        let top = 0;
        stack[top++] = start;
        seen[start] = 1;
        const blob = { size: 0, tl: [0, 0, Infinity], br: [0, 0, -Infinity], tr: [0, 0, -Infinity], bl: [0, 0, Infinity] };
        while (top) {
            const index = stack[--top];
            const x = index % width;
            const y = (index - x) / width;
            blob.size++;
            if (x + y < blob.tl[2]) blob.tl = [x, y, x + y];
            if (x + y > blob.br[2]) blob.br = [x, y, x + y];
            if (x - y > blob.tr[2]) blob.tr = [x, y, x - y];
            if (x - y < blob.bl[2]) blob.bl = [x, y, x - y];
            const near = [x > 0 && index - 1, x < width - 1 && index + 1, y > 0 && index - width, y < height - 1 && index + width];
            for (const next of near) {
                if (next !== false && !seen[next] && closed[next]) {
                    seen[next] = 1;
                    stack[top++] = next;
                }
            }
        }
        if (!biggest || blob.size > biggest.size) biggest = blob;
    }

    // si la mancha es muy pequeña no hay una hoja clara (ej. foto muy oscura): se deja que la persona las marque
    if (!biggest || biggest.size < width * height * 0.12) return null;
    const corners = [biggest.tl, biggest.tr, biggest.br, biggest.bl].map(([x, y]) => [x / (width - 1), y / (height - 1)]);
    // las 4 puntas tienen que formar un cuadro de buen tamaño (si no, la deteccion no sirvio)
    const area = Math.abs(corners.reduce((total, [x1, y1], index) => {
        const [x2, y2] = corners[(index + 1) % 4];
        return total + x1 * y2 - x2 * y1;
    }, 0)) / 2;
    return area >= 0.1 ? corners : null;
}

// ---------- 2 y 3. paredes ----------

// umbral adaptativo (Bradley): un punto es "linea" si es bastante mas oscuro que el promedio de su alrededor
// con la tabla de sumas (integral) el promedio de cualquier cuadro sale en 4 operaciones
function darkMask(gray, width, height) {
    const integral = new Float64Array((width + 1) * (height + 1));
    for (let y = 1; y <= height; y++) {
        let row = 0;
        for (let x = 1; x <= width; x++) {
            row += gray[(y - 1) * width + x - 1];
            integral[y * (width + 1) + x] = integral[(y - 1) * (width + 1) + x] + row;
        }
    }
    const half = Math.max(4, Math.round(Math.max(width, height) / 32));
    const mask = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
        const y1 = Math.max(0, y - half);
        const y2 = Math.min(height, y + half + 1);
        for (let x = 0; x < width; x++) {
            const x1 = Math.max(0, x - half);
            const x2 = Math.min(width, x + half + 1);
            const count = (x2 - x1) * (y2 - y1);
            const sum = integral[y2 * (width + 1) + x2] - integral[y1 * (width + 1) + x2] - integral[y2 * (width + 1) + x1] + integral[y1 * (width + 1) + x1];
            // 15% mas oscuro que su alrededor y no muy claro (asi el papel con sombra no cuenta)
            if (gray[y * width + x] * count < sum * 0.85 && gray[y * width + x] < 170) mask[y * width + x] = 1;
        }
    }
    return mask;
}

// separa las manchas oscuras pegadas (componentes) y deja solo las que parecen paredes:
// lineas largas, o largas y delgadas. Las letras, numeros e iconos son manchas pequeñas y se botan
function keepWalls(mask, width, height) {
    const label = new Int32Array(width * height).fill(-1);
    const walls = new Uint8Array(width * height);
    const stack = new Int32Array(width * height);
    const longSide = Math.max(width, height);
    const pixels = [];

    for (let start = 0; start < mask.length; start++) {
        if (!mask[start] || label[start] !== -1) continue;
        let top = 0;
        stack[top++] = start;
        label[start] = start;
        pixels.length = 0;
        let minX = width, maxX = 0, minY = height, maxY = 0;
        while (top) {
            const index = stack[--top];
            pixels.push(index);
            const x = index % width;
            const y = (index - x) / width;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            // vecinos de los 4 lados
            if (x > 0 && mask[index - 1] && label[index - 1] === -1) { label[index - 1] = start; stack[top++] = index - 1; }
            if (x < width - 1 && mask[index + 1] && label[index + 1] === -1) { label[index + 1] = start; stack[top++] = index + 1; }
            if (y > 0 && mask[index - width] && label[index - width] === -1) { label[index - width] = start; stack[top++] = index - width; }
            if (y < height - 1 && mask[index + width] && label[index + width] === -1) { label[index + width] = start; stack[top++] = index + width; }
        }
        const boxW = maxX - minX + 1;
        const boxH = maxY - minY + 1;
        const big = Math.max(boxW, boxH);
        const thin = big / Math.max(1, Math.min(boxW, boxH));
        // pared: mide al menos el 8% del plano, o el 4% si es una linea delgada (4 veces mas larga que ancha)
        if (big >= longSide * 0.08 || (big >= longSide * 0.04 && thin >= 4)) {
            for (const index of pixels) walls[index] = 1;
        }
    }
    return walls;
}

// ---------- 4. salidas verdes ----------

// verde de los mapas de evacuacion (señales de salida y rutas): tono entre 90° y 170°, color fuerte
function greenMask(data, width, height) {
    const mask = new Uint8Array(width * height);
    for (let index = 0; index < width * height; index++) {
        const r = data[index * 4] / 255;
        const g = data[index * 4 + 1] / 255;
        const b = data[index * 4 + 2] / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (max !== g || max < 0.3 || max - min < 0.25 || (max - min) / max < 0.35) continue;
        const hue = 60 * ((b - r) / (max - min)) + 120;
        if (hue >= 90 && hue <= 170) mask[index] = 1;
    }
    return mask;
}

// analiza la foto (ya enderezada) una sola vez; despues cambiar la sensibilidad o el tamaño es instantaneo
export async function analyzePhoto(src) {
    const image = await loadImage(src);
    const canvas = toCanvas(image, 1200);
    const { width, height } = canvas;
    const { data } = canvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, width, height);
    const gray = new Uint8Array(width * height);
    for (let index = 0; index < gray.length; index++) {
        gray[index] = Math.round(0.299 * data[index * 4] + 0.587 * data[index * 4 + 1] + 0.114 * data[index * 4 + 2]);
    }
    return {
        width,
        height,
        walls: keepWalls(darkMask(gray, width, height), width, height),
        green: greenMask(data, width, height),
    };
}

// cuanto de cada celda tiene que tener linea para contarla como pared (de menos a mas sensible)
export const SENSITIVITY = [
    { value: "1", label: "Muy baja (solo paredes gruesas)", share: 0.35 },
    { value: "2", label: "Baja", share: 0.22 },
    { value: "3", label: "Media", share: 0.12 },
    { value: "4", label: "Alta", share: 0.07 },
    { value: "5", label: "Muy alta (líneas delgadas)", share: 0.035 },
];

// cuanto de cada celda tiene cada mascara (0..1)
function cellShares(mask, width, height, cols, rows) {
    const sums = new Float64Array(cols * rows);
    const counts = new Float64Array(cols * rows);
    for (let y = 0; y < height; y++) {
        const cy = Math.min(rows - 1, Math.floor((y * rows) / height));
        for (let x = 0; x < width; x++) {
            const cell = cy * cols + Math.min(cols - 1, Math.floor((x * cols) / width));
            counts[cell]++;
            if (mask[y * width + x]) sums[cell]++;
        }
    }
    return Array.from(sums, (sum, index) => sum / Math.max(1, counts[index]));
}

// pasa el analisis a celdas del mapa: { walls: ["x,y"], exits: ["x,y"] }
// y arregla lo tipico: rellena huecos de una celda en una pared recta y bota celdas sueltas sin vecinas
export function cellsFromAnalysis(analysis, cols, rows, level = "3", withExits = true) {
    const { width, height } = analysis;
    const needed = (SENSITIVITY.find((item) => item.value === level) ?? SENSITIVITY[2]).share;
    const wallShare = cellShares(analysis.walls, width, height, cols, rows);
    const marked = wallShare.map((share) => share >= needed);
    const on = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && marked[y * cols + x];

    // una pared que cae justo en el borde entre dos celdas marca las dos y queda gruesa:
    // si dos celdas vecinas son pared pero la linea no sigue de lado, se deja solo la que tiene mas linea
    const grid = marked.slice();
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const here = y * cols + x;
            if (!marked[here]) continue;
            // pareja de lado (pared vertical gruesa)
            if (on(x + 1, y) && !on(x - 1, y) && !on(x + 2, y)) {
                grid[wallShare[here] >= wallShare[here + 1] ? here + 1 : here] = false;
            }
            // pareja arriba-abajo (pared horizontal gruesa)
            if (on(x, y + 1) && !on(x, y - 1) && !on(x, y + 2)) {
                grid[wallShare[here] >= wallShare[here + cols] ? here + cols : here] = false;
            }
        }
    }
    const at = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && grid[y * cols + x];

    // huecos de una celda entre dos paredes en la misma fila o columna (pared recta cortada)
    const filled = grid.slice();
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y * cols + x]) continue;
            if ((at(x - 1, y) && at(x + 1, y)) || (at(x, y - 1) && at(x, y + 1))) filled[y * cols + x] = true;
        }
    }
    // celdas sueltas: sin ninguna pared alrededor (ni en diagonal) casi siempre son ruido
    const walls = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (!filled[y * cols + x]) continue;
            let neighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if ((dx || dy) && x + dx >= 0 && y + dy >= 0 && x + dx < cols && y + dy < rows && filled[(y + dy) * cols + x + dx]) neighbors++;
                }
            }
            if (neighbors) walls.push(`${x},${y}`);
        }
    }

    // salidas: en los mapas de evacuacion la salida verde va encima de la pared (es la puerta),
    // asi que donde hay bastante verde la celda queda como Entrada y deja de ser pared
    const exits = [];
    if (withExits) {
        const greenShare = cellShares(analysis.green, width, height, cols, rows);
        greenShare.forEach((share, index) => {
            if (share >= 0.15) exits.push(`${index % cols},${Math.floor(index / cols)}`);
        });
    }
    const exitSet = new Set(exits);
    return { walls: walls.filter((key) => !exitSet.has(key)), exits };
}

// columnas y filas que mas se parecen a la forma de la foto, dentro de los limites del mapa
export function suggestSize(width, height) {
    const ratio = width / height;
    let cols = 24;
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
