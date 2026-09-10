/**
 * Prompts para la IA: generación de textos de práctica y devolución al alumno.
 * Se mantienen separados de la interfaz para poder ajustarlos sin tocar React.
 */

import { META } from "../config.js";

/**
 * Describe, en lenguaje natural, qué debería contener un texto para que la
 * persona practique justo los errores que viene cometiendo.
 *
 * @param {import("./correccion.js").Resultado} r
 * @returns {string}
 */
export function describirErrores(r) {
  const partes = [];
  if (r.errores.tildes) partes.push("muchas palabras con tilde y con ñ");
  if (r.errores.mayusculas) partes.push("varios nombres de organismos con mayúscula inicial");
  if (r.errores.puntuacion) partes.push("muchas comas, puntos y punto y coma");
  if (r.topLetras.length) partes.push(`palabras que contengan las letras ${r.topLetras.join(", ")}`);

  const pals = r.ejemplos.map((e) => e.era.replace(/[.,;:]/g, "")).slice(0, 5);
  if (pals.length) partes.push(`y que repita estas palabras: ${pals.join(", ")}`);

  return partes.length ? partes.join("; ") : "palabras largas y técnicas, con tildes";
}

/**
 * Pide un texto jurídico original para practicar.
 *
 * @param {string} tema    Tema del escrito (ver src/data/temas.js).
 * @param {string|null} enfoque Indicación extra sobre qué reforzar.
 * @returns {string}
 */
export function promptTexto(tema, enfoque) {
  return `Escribí un texto jurídico original, en español de Argentina, de entre 180 y 210 palabras, con el estilo formal de un escrito judicial o de una resolución de un tribunal de la provincia de San Juan. Tema: ${tema}. ${
    enfoque ? `Como es un texto de práctica de mecanografía, incluí ${enfoque}.` : ""
  } Usá tildes, mayúsculas y puntuación impecables, oraciones largas típicas del lenguaje judicial y vocabulario técnico. Sin nombres de personas reales, sin títulos, sin comillas y sin listas: un solo párrafo. Respondé únicamente con el texto.`;
}

/**
 * Pide una devolución sobre el último simulacro.
 *
 * @param {import("./correccion.js").Resultado} r
 * @param {string} previos Palabras correctas de los intentos anteriores, separadas por comas.
 * @returns {string}
 */
export function promptConsejo(r, previos) {
  const e = r.errores;
  const ejemplos = r.ejemplos.map((x) => `escribió "${x.escribiste}" en lugar de "${x.era}"`).join("; ");

  return `Sos un entrenador de mecanografía. La persona se prepara para el examen de ingreso al Poder Judicial de San Juan (Argentina), donde tiene que copiar correctamente ${META} palabras de un texto jurídico en 4 minutos, en una computadora con teclado QWERTY. Solo cuentan las palabras escritas sin ningún error.

Resultado de su último simulacro:
- Palabras correctas: ${r.correctas} (meta: ${META})
- Palabras escritas: ${r.escritas}
- Precisión: ${r.precision}%
- Velocidad: ${r.ppm} palabras por minuto
- Errores: tildes y ñ ${e.tildes}, mayúsculas ${e.mayusculas}, puntuación ${e.puntuacion}, letras cambiadas ${e.letras}, palabras salteadas ${e.omitidas}, palabras de más ${e.sobrantes}
- Letras que más falla: ${r.topLetras.join(", ") || "ninguna en particular"}
- Ejemplos: ${ejemplos || "sin errores"}
- Palabras correctas en los intentos anteriores: ${previos || "es su primer intento"}

Escribí en español rioplatense, con voseo, en tono cálido y directo. Empezá con un diagnóstico de dos oraciones (si su problema principal es la velocidad o la precisión), seguí con tres consejos concretos para los próximos días y cerrá con un ejercicio de 10 minutos. Máximo 170 palabras. Texto plano, sin markdown, sin asteriscos y sin títulos, en párrafos cortos separados por una línea en blanco.`;
}
