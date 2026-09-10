import { META } from "../config.js";
import { ETIQUETAS_ERROR } from "../lib/correccion.js";
import { iaConfigurada } from "../lib/ia.js";

/** Sello aprobado / no alcanza, desglose de errores y accesos a la IA. */
export default function Resultado({ r, consejo, pidiendo, generando, onConsejo, onPracticarErrores }) {
  const filas = Object.entries(r.errores).filter(([, n]) => n > 0);
  const max = Math.max(1, ...filas.map(([, n]) => n));
  const diferencia = r.correctas - META;

  const titular =
    diferencia > 0
      ? `Superaste la meta por ${diferencia} ${diferencia === 1 ? "palabra" : "palabras"}.`
      : diferencia === 0
        ? "Llegaste justo a la meta."
        : `Te faltaron ${-diferencia} palabras correctas para llegar a ${META}.`;

  return (
    <section className="resultado" aria-live="polite">
      <div className="res-sello">
        <div className={"sello " + (r.aprobado ? "si" : "no")}>
          <span className="sello-t">{r.aprobado ? "APROBADO" : "NO ALCANZA"}</span>
          <span className="sello-n">{r.correctas} palabras correctas</span>
        </div>
      </div>

      <div className="res-detalle">
        <h2>{titular}</h2>
        <p className="res-datos">
          Escribiste {r.escritas} palabras en {Math.round(r.segundos)} segundos, a {r.ppm} palabras por minuto, con{" "}
          {r.precision}% de precisión.
        </p>

        {filas.length > 0 ? (
          <>
            <h3>Dónde se perdieron palabras</h3>
            <div className="errores">
              {filas.map(([k, n]) => (
                <div className="fila" key={k}>
                  <span>{ETIQUETAS_ERROR[k]}</span>
                  <span className="pista">
                    <span style={{ width: `${(n / max) * 100}%` }} />
                  </span>
                  <span className="num">{n}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>No hubo errores en lo que escribiste. El próximo paso es ganar velocidad.</p>
        )}

        {r.ejemplos.length > 0 && (
          <>
            <h3>Algunos errores</h3>
            <ul className="ejemplos">
              {r.ejemplos.map((e, i) => (
                <li key={i}>
                  Escribiste <s>{e.escribiste}</s> y era <strong>{e.era}</strong>
                </li>
              ))}
            </ul>
          </>
        )}

        {r.topLetras.length > 0 && <p className="res-datos">Letras que más se te escapan: {r.topLetras.join(", ")}.</p>}

        {iaConfigurada && (
          <div className="acciones en-fila">
            <button className="btn" onClick={onConsejo} disabled={pidiendo}>
              {pidiendo ? "Analizando tu intento…" : "Pedir devolución a la IA"}
            </button>
            <button className="btn sec" onClick={onPracticarErrores} disabled={generando}>
              {generando ? "Generando texto…" : "Practicar mis errores con un texto nuevo"}
            </button>
          </div>
        )}

        {consejo && <div className="consejo">{consejo}</div>}
      </div>
    </section>
  );
}
