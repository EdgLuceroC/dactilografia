import { useCallback, useEffect, useState } from "react";
import { guardar, leer } from "../lib/almacenamiento.js";
import { CLAVES, MAX_HISTORIAL } from "../config.js";

/**
 * Historial de simulacros, persistido en el navegador.
 *
 * @returns {{historial: object[], agregar: (r: object) => void, borrar: () => void}}
 */
export function useHistorial() {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    leer(CLAVES.historial, []).then((h) => setHistorial(Array.isArray(h) ? h : []));
  }, []);

  const agregar = useCallback((resultado) => {
    setHistorial((prev) => {
      const nuevo = [...prev, resultado].slice(-MAX_HISTORIAL);
      guardar(CLAVES.historial, nuevo);
      return nuevo;
    });
  }, []);

  const borrar = useCallback(() => {
    setHistorial([]);
    guardar(CLAVES.historial, []);
  }, []);

  return { historial, agregar, borrar };
}
