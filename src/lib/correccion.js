/**
 * Corrección de un intento contra el texto original.
 *
 * El criterio del examen es simple y estricto: una palabra suma solo si está
 * escrita exactamente igual que en el texto, con su tilde, su mayúscula y su
 * puntuación. Para poder contar en esas condiciones hay que alinear lo escrito
 * con el original, porque una palabra salteada corre todo lo que sigue.
 *
 * Ver docs/correccion.md para el detalle del algoritmo.
 */

import { normalizar, sinPuntuacion, sinTildes, tokenizar } from "./texto.js";
import { META } from "../config.js";

/** Nombres legibles de cada categoría de error. */
export const ETIQUETAS_ERROR = {
  tildes: "Tildes y ñ",
  mayusculas: "Mayúsculas",
  puntuacion: "Puntuación",
  letras: "Letras cambiadas",
  omitidas: "Palabras salteadas",
  sobrantes: "Palabras de más",
};

/** Cantidad de ejemplos de error que se guardan por intento. */
const MAX_EJEMPLOS = 6;

/** Cantidad de letras problemáticas que se informan. */
const MAX_LETRAS = 5;

/**
 * Alinea las palabras escritas con las del texto original mediante distancia de
 * edición (Levenshtein por palabras).
 *
 * Como el intento casi nunca llega al final del texto, no se compara contra el
 * original completo: se busca el prefijo del original que mejor coincide con lo
 * escrito y se reconstruyen las operaciones sobre ese tramo.
 *
 * @param {string[]} ref Palabras del texto original.
 * @param {string[]} esc Palabras escritas.
 * @returns {{ops: Array, fin: number}} Operaciones y posición alcanzada en el original.
 */
export function alinear(ref, esc) {
  const n = ref.length;
  const m = esc.length;
  const dp = [];
  for (let i = 0; i <= n; i++) {
    dp.push(new Array(m + 1).fill(0));
    dp[i][0] = i;
  }
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const c = ref[i - 1] === esc[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + c);
    }
  }

  // Lo escrito se compara contra el tramo del texto que mejor coincide.
  let fin = 0;
  for (let i = 0; i <= n; i++) if (dp[i][m] <= dp[fin][m]) fin = i;

  const ops = [];
  let i = fin;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (ref[i - 1] === esc[j - 1] ? 0 : 1)) {
      ops.push({ tipo: ref[i - 1] === esc[j - 1] ? "ok" : "sub", r: i - 1, ref: ref[i - 1], esc: esc[j - 1] });
      i--;
      j--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      ops.push({ tipo: "ins", esc: esc[j - 1] });
      j--;
    } else {
      ops.push({ tipo: "del", r: i - 1, ref: ref[i - 1] });
      i--;
    }
  }
  ops.reverse();
  return { ops, fin };
}

/**
 * Determina por qué una palabra escrita no coincide con la esperada.
 *
 * @param {string} r Palabra del texto original.
 * @param {string} e Palabra escrita.
 * @returns {"tildes"|"mayusculas"|"puntuacion"|"letras"}
 */
export function clasificar(r, e) {
  if (sinTildes(r) === sinTildes(e)) return "tildes";
  if (r.toLowerCase() === e.toLowerCase()) return "mayusculas";
  if (sinPuntuacion(r) === sinPuntuacion(e)) return "puntuacion";
  if (normalizar(r) === normalizar(e)) return "tildes";
  return "letras";
}

/**
 * Letras de la palabra esperada que no aparecen en la escrita, según la
 * subsecuencia común más larga. Sirve para detectar teclas flojas.
 *
 * @param {string} esperada
 * @param {string} escrita
 * @returns {string[]}
 */
export function letrasFalladas(esperada, escrita) {
  const A = [...esperada.toLowerCase()];
  const B = [...escrita.toLowerCase()];
  const L = Array.from({ length: A.length + 1 }, () => new Array(B.length + 1).fill(0));
  for (let i = 1; i <= A.length; i++)
    for (let j = 1; j <= B.length; j++)
      L[i][j] = A[i - 1] === B[j - 1] ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]);

  const fallas = [];
  let i = A.length;
  let j = B.length;
  while (i > 0) {
    if (j > 0 && A[i - 1] === B[j - 1]) {
      i--;
      j--;
    } else if (j > 0 && L[i][j - 1] >= L[i - 1][j]) {
      j--;
    } else {
      fallas.push(A[i - 1]);
      i--;
    }
  }
  return fallas.filter((c) => /[a-zñ]/.test(c));
}

/**
 * @typedef {Object} Resultado
 * @property {number} fecha        Marca de tiempo del intento.
 * @property {number} correctas    Palabras que cuentan para el examen.
 * @property {number} escritas     Palabras tipeadas.
 * @property {number} ppm          Palabras por minuto (sobre lo tipeado).
 * @property {number} precision    Porcentaje de palabras correctas sobre las tipeadas.
 * @property {Object} errores      Cantidad de errores por categoría.
 * @property {string[]} topLetras  Letras que más se escapan.
 * @property {Array} ejemplos      Muestras de "escribiste X y era Y".
 * @property {boolean} aprobado    Si llegó a la meta.
 * @property {number} segundos     Duración real del intento.
 */

/**
 * Evalúa un intento completo.
 *
 * @param {string} refTexto Texto original.
 * @param {string} escrito  Lo que tipeó la persona.
 * @param {number} segundos Duración del intento.
 * @returns {Resultado}
 */
export function evaluar(refTexto, escrito, segundos) {
  const ref = tokenizar(refTexto);
  const esc = tokenizar(escrito);
  const { ops } = alinear(ref, esc);

  const errores = { tildes: 0, mayusculas: 0, puntuacion: 0, letras: 0, omitidas: 0, sobrantes: 0 };
  const letras = {};
  const ejemplos = [];
  let correctas = 0;

  for (const op of ops) {
    if (op.tipo === "ok") {
      correctas++;
    } else if (op.tipo === "ins") {
      errores.sobrantes++;
    } else if (op.tipo === "del") {
      errores.omitidas++;
    } else {
      const cat = clasificar(op.ref, op.esc);
      errores[cat]++;
      if (cat === "letras") {
        letrasFalladas(op.ref, op.esc).forEach((c) => (letras[c] = (letras[c] || 0) + 1));
      }
      if (ejemplos.length < MAX_EJEMPLOS) ejemplos.push({ era: op.ref, escribiste: op.esc });
    }
  }

  const topLetras = Object.entries(letras)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_LETRAS)
    .map(([c]) => c);

  const minutos = Math.max(segundos, 1) / 60;

  return {
    fecha: Date.now(),
    correctas,
    escritas: esc.length,
    ppm: Math.round(esc.length / minutos),
    precision: esc.length ? Math.round((correctas * 100) / esc.length) : 0,
    errores,
    topLetras,
    ejemplos,
    aprobado: correctas >= META,
    segundos,
  };
}

/**
 * Marcas por palabra del texto original, para pintar el avance en pantalla.
 *
 * @param {string[]} tokens Palabras del texto original.
 * @param {string[]} esc    Palabras escritas ya confirmadas.
 * @param {boolean} marcarActual Si se resalta la palabra que sigue.
 * @returns {{marcas: string[], correctas: number}}
 */
export function marcarTexto(tokens, esc, marcarActual) {
  const { ops, fin } = alinear(tokens, esc);
  const marcas = new Array(tokens.length).fill("");
  let correctas = 0;

  for (const op of ops) {
    if (op.tipo === "ok") {
      marcas[op.r] = "ok";
      correctas++;
    } else if (op.tipo === "sub") {
      marcas[op.r] = "err";
    } else if (op.tipo === "del") {
      marcas[op.r] = "omit";
    }
  }
  if (marcarActual && fin < tokens.length) marcas[fin] = "actual";

  return { marcas, correctas };
}
