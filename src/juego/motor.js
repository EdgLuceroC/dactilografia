/**
 * Motor del juego de palabras que caen.
 *
 * Está separado de React a propósito: es lógica pura y determinista (salvo el
 * sorteo de palabras, que se puede inyectar), así que se puede probar sin DOM.
 * El componente solo dibuja el estado y le avisa al motor cada cuadro.
 */

import { PALABRAS_JUEGO } from "../data/palabras.js";
import { alAzar } from "../lib/texto.js";

/** Milisegundos entre cuadros. */
export const PASO_MS = 50;

/** Vidas con las que arranca una partida. */
export const VIDAS = 3;

/** Aciertos necesarios para subir de nivel. */
export const ACIERTOS_POR_NIVEL = 8;

/** Altura (en % de la cancha) a la que una palabra se considera caída. */
export const PISO = 90;

/** Estado inicial de una partida. */
export function nuevoJuego() {
  return {
    palabras: [],
    puntos: 0,
    vidas: VIDAS,
    aciertos: 0,
    nivel: 1,
    estado: "inicio", // "inicio" | "jugando" | "fin"
    ultimo: 0,
    id: 0,
    nuevoRecord: false,
  };
}

/** Velocidad de caída, en % de la cancha por cuadro. */
export const velocidadDe = (nivel) => (4.5 + (nivel - 1) * 1.3) * 0.05;

/** Milisegundos entre apariciones de palabras. */
export const cadenciaDe = (nivel) => Math.max(750, 2300 - (nivel - 1) * 170);

/**
 * Agrega una palabra nueva en una posición horizontal al azar, evitando repetir
 * una que ya esté en pantalla.
 *
 * @param {object} s Estado de la partida (se muta).
 * @param {() => string} sortear Fuente de palabras, inyectable para las pruebas.
 */
export function agregarPalabra(s, sortear = () => alAzar(PALABRAS_JUEGO)) {
  const enPantalla = new Set(s.palabras.map((p) => p.texto));
  let texto;
  let intentos = 0;
  do {
    texto = sortear();
    intentos++;
  } while (enPantalla.has(texto) && intentos < 10);

  s.id += 1;
  s.palabras.push({ id: s.id, texto, x: 3 + Math.random() * 62, y: -6 });
}

/**
 * Avanza la partida un cuadro: aparecen palabras, caen las que hay, se pierden
 * vidas por las que tocan el piso y, si no quedan, termina el juego.
 *
 * @param {object} s Estado de la partida (se muta).
 * @param {number} ahora Marca de tiempo en milisegundos.
 * @param {() => string} [sortear]
 * @returns {boolean} `true` si la partida terminó en este cuadro.
 */
export function avanzar(s, ahora, sortear) {
  if (s.estado !== "jugando") return false;

  if (ahora - s.ultimo > cadenciaDe(s.nivel) || s.palabras.length === 0) {
    agregarPalabra(s, sortear);
    s.ultimo = ahora;
  }

  const velocidad = velocidadDe(s.nivel);
  for (const p of s.palabras) p.y += velocidad;

  const caidas = s.palabras.filter((p) => p.y >= PISO).length;
  if (caidas) {
    s.vidas -= caidas;
    s.palabras = s.palabras.filter((p) => p.y < PISO);
  }

  if (s.vidas <= 0) {
    s.vidas = 0;
    s.estado = "fin";
    return true;
  }
  return false;
}

/**
 * Procesa una palabra tipeada. Si coincide, se borra la más baja (la más
 * urgente) y suma puntos según su largo y el nivel.
 *
 * @param {object} s Estado de la partida (se muta).
 * @param {string} valor Lo que escribió la persona.
 * @returns {boolean} `true` si acertó.
 */
export function intentarPalabra(s, valor) {
  const t = valor.trim();
  if (!t || s.estado !== "jugando") return false;

  const coinciden = s.palabras.filter((p) => p.texto === t);
  if (!coinciden.length) return false;

  const p = coinciden.reduce((a, b) => (a.y > b.y ? a : b));
  s.palabras = s.palabras.filter((x) => x.id !== p.id);
  s.puntos += t.length * s.nivel;
  s.aciertos += 1;
  if (s.aciertos % ACIERTOS_POR_NIVEL === 0) s.nivel += 1;
  return true;
}
