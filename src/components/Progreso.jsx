import { useState } from "react";
import GraficoProgreso from "./GraficoProgreso.jsx";
import TablaIntentos from "./TablaIntentos.jsx";
import { ETIQUETAS_ERROR } from "../lib/correccion.js";
import { resumirHistorial } from "../lib/estadisticas.js";
import { META } from "../config.js";

/** Intentos que se listan en la tabla. */
const VENTANA_TABLA = 8;

/** Evolución de los simulacros: resumen, gráfico y detalle. */
export default function Progreso({ historial, onBorrar, irASimulacro }) {
  const [confirmar, setConfirmar] = useState(false);
  const resumen = resumirHistorial(historial);

  if (!resumen) {
    return (
      <div className="vacio">
        <p>
          Todavía no hay simulacros guardados. Cuando termines el primero, acá vas a ver cuántas palabras correctas
          lográs en cada intento y qué tipo de error se repite.
        </p>
        <button className="btn" onClick={irASimulacro}>
          Hacer un simulacro
        </button>
      </div>
    );
  }

  const { total, mejor, promedio, recientes, aprobados, principal, ultimos } = resumen;

  return (
    <div className="progreso">
      <p className="resumen-texto">
        Hiciste <strong>{total}</strong> {total === 1 ? "simulacro" : "simulacros"}. Tu mejor marca es{" "}
        <strong>{mejor}</strong> palabras correctas y en los últimos {recientes} promediás <strong>{promedio}</strong>.
        Llegaste a {META} en <strong>{aprobados}</strong> {aprobados === 1 ? "intento" : "intentos"}.
      </p>

      {principal && principal[1] > 0 && (
        <p className="resumen-texto">
          En tus últimos intentos, lo que más palabras te hace perder es:{" "}
          <strong>{ETIQUETAS_ERROR[principal[0]].toLowerCase()}</strong>.
        </p>
      )}

      <GraficoProgreso intentos={ultimos} />

      <TablaIntentos intentos={historial.slice(-VENTANA_TABLA).reverse()} />

      <button
        className="btn sec"
        onClick={() => {
          if (confirmar) {
            onBorrar();
            setConfirmar(false);
          } else {
            setConfirmar(true);
          }
        }}
      >
        {confirmar ? "Confirmar: borrar todo el historial" : "Borrar historial"}
      </button>
    </div>
  );
}
