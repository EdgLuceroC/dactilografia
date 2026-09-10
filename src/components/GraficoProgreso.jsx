import { META } from "../config.js";

const W = 640;
const H = 220;
const PX = 36;
const PY = 26;

/** Palabras correctas por intento, con la línea de la meta como referencia. */
export default function GraficoProgreso({ intentos }) {
  const maxY = Math.max(140, ...intentos.map((h) => h.correctas));
  const X = (i) => (intentos.length === 1 ? W / 2 : PX + (i * (W - 2 * PX)) / (intentos.length - 1));
  const Y = (v) => H - PY - (v * (H - 2 * PY)) / maxY;
  const puntos = intentos.map((h, i) => `${X(i)},${Y(h.correctas)}`).join(" ");

  return (
    <figure className="grafico">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Palabras correctas por intento">
        <line x1={PX} x2={W - PX} y1={H - PY} y2={H - PY} className="eje" />
        <line x1={PX} x2={W - PX} y1={Y(META)} y2={Y(META)} className="meta" />
        <text x={W - PX} y={Y(META) - 6} textAnchor="end" className="meta-t">
          meta: {META}
        </text>

        {intentos.length > 1 && <polyline points={puntos} className="linea" />}

        {intentos.map((h, i) => (
          <g key={h.fecha + "-" + i}>
            <circle cx={X(i)} cy={Y(h.correctas)} r="5" className={h.aprobado ? "p-si" : "p-no"} />
            <text x={X(i)} y={Y(h.correctas) - 10} textAnchor="middle" className="p-t">
              {h.correctas}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>Palabras correctas en tus últimos {intentos.length} intentos.</figcaption>
    </figure>
  );
}
