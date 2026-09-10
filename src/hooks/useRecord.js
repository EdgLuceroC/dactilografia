import { useCallback, useEffect, useRef, useState } from "react";
import { guardar, leer } from "../lib/almacenamiento.js";
import { CLAVES } from "../config.js";

/**
 * Récord del juego de palabras.
 *
 * Además del valor para dibujar, expone `registrar`, que guarda una marca solo
 * si supera al récord anterior. Se usa desde dentro de un intervalo, por eso el
 * valor vive también en una ref: así no hace falta reiniciar el bucle del juego.
 *
 * @returns {{record: number, registrar: (puntos: number) => boolean}}
 */
export function useRecord() {
  const [record, setRecord] = useState(0);
  const recordRef = useRef(0);

  useEffect(() => {
    leer(CLAVES.record, 0).then((v) => {
      const n = Number(v) || 0;
      recordRef.current = n;
      setRecord(n);
    });
  }, []);

  const registrar = useCallback((puntos) => {
    if (puntos <= recordRef.current) return false;
    recordRef.current = puntos;
    setRecord(puntos);
    guardar(CLAVES.record, puntos);
    return true;
  }, []);

  return { record, registrar };
}
