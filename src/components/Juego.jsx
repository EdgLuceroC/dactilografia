import { useEffect, useRef, useState } from "react";
import { avanzar, intentarPalabra, nuevoJuego, PASO_MS } from "../juego/motor.js";
import { useRecord } from "../hooks/useRecord.js";

/**
 * Juego de palabras que caen.
 *
 * La partida vive en una ref y no en el estado de React: se actualiza sesenta
 * veces por minuto y no tiene sentido reconstruir el árbol por cada cambio de
 * posición. `setTick` fuerza el redibujado una vez por cuadro.
 */
export default function Juego() {
  const juego = useRef(nuevoJuego());
  const [, setTick] = useState(0);
  const [entrada, setEntrada] = useState("");
  const [fallo, setFallo] = useState(false);
  const inputRef = useRef(null);
  const { record, registrar } = useRecord();

  useEffect(() => {
    const iv = setInterval(() => {
      const s = juego.current;
      if (s.estado !== "jugando") return;
      const termino = avanzar(s, performance.now());
      if (termino) s.nuevoRecord = registrar(s.puntos);
      setTick((t) => t + 1);
    }, PASO_MS);
    return () => clearInterval(iv);
  }, [registrar]);

  const empezar = () => {
    juego.current = { ...nuevoJuego(), estado: "jugando", ultimo: performance.now() - 5000 };
    setEntrada("");
    setTick((t) => t + 1);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  };

  const intentar = (valor) => {
    setEntrada("");
    if (!intentarPalabra(juego.current, valor) && valor.trim()) {
      setFallo(true);
      setTimeout(() => setFallo(false), 350);
    }
    setTick((x) => x + 1);
  };

  // El espacio confirma la palabra, igual que al escribir de corrido.
  const onCambio = (e) => {
    const v = e.target.value;
    if (/\s$/.test(v)) intentar(v);
    else setEntrada(v);
  };

  const s = juego.current;
  const prefijo = entrada.trim();

  return (
    <div className="juego">
      <p className="intro-juego">
        Las palabras caen desde arriba. Escribí cada una tal cual, con su tilde o su mayúscula, y apretá espacio para
        borrarla antes de que toque el piso. Cada 8 aciertos sube la velocidad.
      </p>

      <div className="hud">
        <span>
          Puntos <strong>{s.puntos}</strong>
        </span>
        <span>
          Nivel <strong>{s.nivel}</strong>
        </span>
        <span>
          Vidas <strong>{s.vidas}</strong>
        </span>
        <span>
          Récord <strong>{record}</strong>
        </span>
      </div>

      <div className="cancha">
        {s.palabras.map((p) => (
          <span
            key={p.id}
            className={"cae" + (prefijo && p.texto.startsWith(prefijo) ? " coincide" : "")}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {p.texto}
          </span>
        ))}

        {s.estado !== "jugando" && (
          <div className="velo">
            {s.estado === "fin" ? (
              <>
                <p className="velo-t">{s.nuevoRecord ? "¡Nuevo récord!" : "Fin del juego"}</p>
                <p>
                  Hiciste {s.puntos} puntos con {s.aciertos} {s.aciertos === 1 ? "palabra" : "palabras"}.
                </p>
              </>
            ) : (
              <p className="velo-t">Poné las manos en el teclado y arrancá cuando quieras.</p>
            )}
            <button className="btn" onClick={empezar}>
              {s.estado === "fin" ? "Jugar de nuevo" : "Empezar"}
            </button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        className={"entrada-juego" + (fallo ? " fallo" : "")}
        value={entrada}
        onChange={onCambio}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            intentar(entrada);
          }
        }}
        disabled={s.estado !== "jugando"}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        aria-label="Escribí la palabra"
        placeholder={s.estado === "jugando" ? "Escribí la palabra y apretá espacio" : ""}
      />
    </div>
  );
}
