/**
 * Parámetros del examen y claves de almacenamiento.
 *
 * La prueba de dactilografía del concurso de ingreso al Poder Judicial de
 * San Juan exige copiar 100 palabras sin errores en 4 minutos.
 */

/** Palabras correctas necesarias para aprobar. */
export const META = 100;

/** Duración del simulacro, en segundos. */
export const DURACION = 240;

/** Cantidad máxima de intentos que se conservan en el historial. */
export const MAX_HISTORIAL = 60;

/** Claves usadas en el almacenamiento local. */
export const CLAVES = {
  historial: "dactilo-historial",
  record: "dactilo-record-juego",
};

/** Página oficial con el cronograma de la prueba. */
export const URL_PODER_JUDICIAL = "https://www.jussanjuan.gov.ar/ingreso2026/dactilografia/";
