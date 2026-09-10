/** Resúmenes del historial de simulacros. */

/** Intentos que se dibujan en el gráfico. */
export const VENTANA_GRAFICO = 20;

/** Intentos que se promedian para hablar de "los últimos". */
export const VENTANA_PROMEDIO = 5;

/** Intentos que se miran para detectar el error dominante. */
export const VENTANA_ERRORES = 10;

/**
 * @typedef {Object} Resumen
 * @property {number} total      Cantidad de simulacros guardados.
 * @property {number} mejor      Mejor marca de palabras correctas.
 * @property {number} promedio   Promedio de los últimos intentos.
 * @property {number} recientes  Cuántos intentos entraron en ese promedio.
 * @property {number} aprobados  Intentos que llegaron a la meta.
 * @property {[string, number]|null} principal Categoría de error dominante y su cantidad.
 * @property {object[]} ultimos  Intentos a graficar, del más viejo al más nuevo.
 */

/**
 * @param {object[]} historial
 * @returns {Resumen|null} `null` si todavía no hay intentos.
 */
export function resumirHistorial(historial) {
  if (!historial.length) return null;

  const ultimos = historial.slice(-VENTANA_GRAFICO);
  const recientes = historial.slice(-VENTANA_PROMEDIO);

  const totales = {};
  historial.slice(-VENTANA_ERRORES).forEach((h) => {
    Object.entries(h.errores).forEach(([k, n]) => (totales[k] = (totales[k] || 0) + n));
  });
  const principal = Object.entries(totales).sort((a, b) => b[1] - a[1])[0] || null;

  return {
    total: historial.length,
    mejor: Math.max(...historial.map((h) => h.correctas)),
    promedio: Math.round(recientes.reduce((a, h) => a + h.correctas, 0) / recientes.length),
    recientes: recientes.length,
    aprobados: historial.filter((h) => h.aprobado).length,
    principal,
    ultimos,
  };
}
