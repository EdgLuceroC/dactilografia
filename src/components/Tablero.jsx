import { META } from "../config.js";
import { formatoTiempo } from "../lib/texto.js";

/** Columna lateral: reloj, palabras correctas, modo y acciones del simulacro. */
export default function Tablero({ restante, estado, modo, onModo, correctas, onEntregar, onReiniciar }) {
  const corriendo = estado === "corriendo";
  const terminado = estado === "terminado";

  return (
    <aside className="tablero">
      <div className={"reloj" + (restante <= 30 && corriendo ? " urgente" : "")}>{formatoTiempo(restante)}</div>

      <div className="contador">
        {modo === "examen" && !terminado ? (
          <p>El contador queda oculto hasta que termines, como en la sede.</p>
        ) : (
          <>
            <p>
              <strong>{correctas}</strong> de {META} palabras correctas
            </p>
            <div className="barra" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (correctas / META) * 100)}%` }} />
            </div>
          </>
        )}
      </div>

      <fieldset className="modo" disabled={corriendo}>
        <legend>Modo</legend>
        <label>
          <input type="radio" name="modo" checked={modo === "marcas"} onChange={() => onModo("marcas")} /> Con marcas en
          el texto
        </label>
        <label>
          <input type="radio" name="modo" checked={modo === "examen"} onChange={() => onModo("examen")} /> Como en el
          examen, sin ayudas
        </label>
      </fieldset>

      <div className="acciones">
        {corriendo && (
          <button className="btn" onClick={onEntregar}>
            Entregar ahora
          </button>
        )}
        <button className="btn sec" onClick={onReiniciar}>
          {terminado ? "Otro intento con este texto" : "Reiniciar"}
        </button>
      </div>
    </aside>
  );
}
