/** Utilidades de normalización y formato de texto. */

/** Separa un texto en palabras, ignorando espacios repetidos y saltos de línea. */
export const tokenizar = (s) => s.trim().split(/\s+/).filter(Boolean);

/** Quita tildes y diéresis, conservando el resto de los caracteres (la ñ pasa a n). */
export const sinTildes = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Quita los signos de puntuación más frecuentes en un escrito judicial. */
export const sinPuntuacion = (s) => s.replace(/[.,;:¿?¡!()"«»“”'-]/g, "");

/** Normalización total: sin tildes, sin puntuación y en minúsculas. */
export const normalizar = (s) => sinPuntuacion(sinTildes(s)).toLowerCase();

/** Formatea segundos como m:ss, redondeando hacia arriba (como un reloj de examen). */
export function formatoTiempo(seg) {
  const s = Math.ceil(Math.max(0, seg));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Elige un elemento al azar de una lista. */
export const alAzar = (lista) => lista[Math.floor(Math.random() * lista.length)];
