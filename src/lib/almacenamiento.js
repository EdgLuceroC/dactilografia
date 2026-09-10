/**
 * Persistencia local del historial y del récord del juego.
 *
 * Todo queda en el navegador de la persona: no hay servidor ni cuentas.
 * Si el entorno expone `window.storage` (por ejemplo, un artifact de Claude)
 * se usa esa API; si no, `localStorage`. Cualquier fallo devuelve el valor por
 * defecto en lugar de romper la aplicación: perder el historial es molesto,
 * pero perder el simulacro en curso lo es más.
 */

const tieneStorageExterno = () => typeof window !== "undefined" && Boolean(window.storage);

const tieneLocalStorage = () => {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
};

/**
 * @param {string} clave
 * @param {*} porDefecto Valor devuelto si no hay nada guardado o si falla la lectura.
 * @returns {Promise<*>}
 */
export async function leer(clave, porDefecto) {
  try {
    if (tieneStorageExterno()) {
      const r = await window.storage.get(clave, false);
      return r ? JSON.parse(r.value) : porDefecto;
    }
    if (tieneLocalStorage()) {
      const crudo = window.localStorage.getItem(clave);
      return crudo ? JSON.parse(crudo) : porDefecto;
    }
  } catch {
    // Datos corruptos o almacenamiento bloqueado: se sigue con el valor por defecto.
  }
  return porDefecto;
}

/**
 * @param {string} clave
 * @param {*} valor Debe ser serializable a JSON.
 * @returns {Promise<void>}
 */
export async function guardar(clave, valor) {
  try {
    if (tieneStorageExterno()) {
      await window.storage.set(clave, JSON.stringify(valor), false);
      return;
    }
    if (tieneLocalStorage()) {
      window.localStorage.setItem(clave, JSON.stringify(valor));
    }
  } catch (e) {
    console.error("No se pudo guardar", clave, e);
  }
}
