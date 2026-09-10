import { useEffect, useMemo, useRef, useState } from "react";
import HojaTexto from "./HojaTexto.jsx";
import Tablero from "./Tablero.jsx";
import Resultado from "./Resultado.jsx";
import { TEXTOS } from "../data/textos.js";
import { TEMAS_IA } from "../data/temas.js";
import { DURACION } from "../config.js";
import { evaluar, marcarTexto } from "../lib/correccion.js";
import { alAzar, tokenizar } from "../lib/texto.js";
import { iaConfigurada, pedirTexto } from "../lib/ia.js";
import { describirErrores, promptConsejo, promptTexto } from "../lib/prompts.js";

/** Palabras mínimas que debe traer un texto generado para aceptarlo. */
const MINIMO_PALABRAS_IA = 120;

/**
 * Simulacro cronometrado.
 *
 * El estado del intento vive por duplicado: en `useState` para dibujar y en
 * refs para poder leerlo desde el intervalo del reloj sin recrearlo en cada
 * tecla que se aprieta.
 */
export default function Simulacro({ historial, onResultado }) {
  const [actual, setActual] = useState(TEXTOS[0]);
  const [escrito, setEscrito] = useState("");
  const [estado, setEstado] = useState("listo"); // "listo" | "corriendo" | "terminado"
  const [restante, setRestante] = useState(DURACION);
  const [modo, setModo] = useState("marcas"); // "marcas" | "examen"
  const [resultado, setResultado] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [avisoIA, setAvisoIA] = useState("");
  const [consejo, setConsejo] = useState("");
  const [pidiendoConsejo, setPidiendoConsejo] = useState(false);

  const inicioRef = useRef(0);
  const escritoRef = useRef("");
  const actualRef = useRef(TEXTOS[0]);
  const estadoRef = useRef("listo");
  const areaRef = useRef(null);
  const hojaRef = useRef(null);
  const resRef = useRef(null);

  const terminar = (segundos) => {
    if (estadoRef.current !== "corriendo") return;
    estadoRef.current = "terminado";
    const r = { ...evaluar(actualRef.current.texto, escritoRef.current, segundos), texto: actualRef.current.nombre };
    setResultado(r);
    setEstado("terminado");
    setConsejo("");
    onResultado(r);
  };

  // El reloj se apoya en Date.now() y no en la cantidad de ticks, para que una
  // pestaña en segundo plano no regale segundos.
  useEffect(() => {
    if (estado !== "corriendo") return;
    const iv = setInterval(() => {
      const transcurrido = (Date.now() - inicioRef.current) / 1000;
      const r = Math.max(0, DURACION - transcurrido);
      setRestante(r);
      if (r <= 0) terminar(DURACION);
    }, 200);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  useEffect(() => {
    if (resultado && resRef.current) {
      const reducir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resRef.current.scrollIntoView({ behavior: reducir ? "auto" : "smooth", block: "start" });
    }
  }, [resultado]);

  const reiniciar = (texto = actualRef.current) => {
    actualRef.current = texto;
    setActual(texto);
    escritoRef.current = "";
    setEscrito("");
    estadoRef.current = "listo";
    setEstado("listo");
    setRestante(DURACION);
    setResultado(null);
    setConsejo("");
    if (hojaRef.current) hojaRef.current.scrollTop = 0;
    setTimeout(() => areaRef.current && areaRef.current.focus(), 0);
  };

  const onEscribir = (e) => {
    if (estadoRef.current === "terminado") return;
    const v = e.target.value;
    if (estadoRef.current === "listo" && v.trim().length > 0) {
      inicioRef.current = Date.now();
      estadoRef.current = "corriendo";
      setEstado("corriendo");
    }
    escritoRef.current = v;
    setEscrito(v);
  };

  const entregar = () => terminar((Date.now() - inicioRef.current) / 1000);

  const generarTexto = async (enfoque) => {
    setGenerando(true);
    setAvisoIA("");
    try {
      const bruto = await pedirTexto(promptTexto(alAzar(TEMAS_IA), enfoque));
      const limpio = bruto
        .replace(/^["«“]+|["»”]+$/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (tokenizar(limpio).length < MINIMO_PALABRAS_IA) throw new Error("Texto demasiado corto");
      reiniciar({
        id: "ia-" + Date.now(),
        nombre: enfoque ? "Texto sobre tus errores" : "Texto nuevo con IA",
        texto: limpio,
      });
    } catch {
      setAvisoIA("No se pudo generar el texto. Probá de nuevo o elegí uno de los textos incluidos.");
    } finally {
      setGenerando(false);
    }
  };

  const pedirConsejo = async () => {
    if (!resultado) return;
    setPidiendoConsejo(true);
    setConsejo("");
    try {
      const previos = historial
        .slice(-6, -1)
        .map((h) => h.correctas)
        .join(", ");
      const texto = await pedirTexto(promptConsejo(resultado, previos));
      setConsejo(texto.replace(/\*\*/g, "").trim());
    } catch {
      setConsejo("No se pudo obtener la devolución. Probá de nuevo en unos segundos.");
    } finally {
      setPidiendoConsejo(false);
    }
  };

  const tokens = useMemo(() => tokenizar(actual.texto), [actual]);
  const mostrarMarcas = modo === "marcas" || estado === "terminado";

  // La palabra que se está tipeando no se corrige hasta cerrarla con un espacio:
  // si no, parpadearía en rojo mientras se escribe.
  const vivo = useMemo(() => {
    if (!mostrarMarcas) return null;
    let esc = tokenizar(escrito);
    const enCurso = estado !== "terminado" && escrito.length > 0 && !/\s$/.test(escrito);
    if (enCurso) esc = esc.slice(0, -1);
    return marcarTexto(tokens, esc, estado !== "terminado");
  }, [escrito, tokens, mostrarMarcas, estado]);

  // La hoja acompaña a la palabra actual sin dejarla nunca pegada al borde.
  useEffect(() => {
    const c = hojaRef.current;
    if (!c) return;
    const el = c.querySelector(".actual");
    if (!el) return;
    const top = el.offsetTop;
    if (top > c.scrollTop + c.clientHeight - 70 || top < c.scrollTop + 10) c.scrollTop = Math.max(0, top - 60);
  }, [vivo]);

  const corriendo = estado === "corriendo";
  const correctasMostradas = estado === "terminado" && resultado ? resultado.correctas : vivo ? vivo.correctas : 0;

  const indicacion =
    estado === "listo"
      ? "Escribí acá. El reloj arranca con la primera letra."
      : estado === "corriendo"
        ? "Copiá el texto tal cual, con tildes, mayúsculas y puntuación."
        : "Intento entregado. En el texto quedaron marcados tus errores.";

  return (
    <div className="sim">
      <div className="col-principal">
        <div className="barra-textos" role="group" aria-label="Texto para practicar">
          {TEXTOS.map((t) => (
            <button
              key={t.id}
              className={"chip" + (actual.id === t.id ? " activo" : "")}
              disabled={corriendo || generando}
              onClick={() => reiniciar(t)}
            >
              {t.nombre}
            </button>
          ))}
          {iaConfigurada && (
            <button
              className={"chip" + (actual.id.startsWith("ia-") ? " activo" : "")}
              disabled={corriendo || generando}
              onClick={() => generarTexto(null)}
            >
              {generando ? "Generando texto…" : "Texto nuevo con IA"}
            </button>
          )}
        </div>

        {avisoIA && (
          <p className="aviso" role="alert">
            {avisoIA}
          </p>
        )}

        <HojaTexto ref={hojaRef} tokens={tokens} marcas={vivo ? vivo.marcas : null} texto={actual.texto} />

        <label className="etiqueta" htmlFor="area-escritura">
          {indicacion}
        </label>
        <textarea
          id="area-escritura"
          ref={areaRef}
          className="maquina"
          value={escrito}
          onChange={onEscribir}
          onPaste={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          readOnly={estado === "terminado"}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          placeholder="Empezá a copiar el texto…"
        />

        {resultado && (
          <div ref={resRef}>
            <Resultado
              r={resultado}
              consejo={consejo}
              pidiendo={pidiendoConsejo}
              generando={generando}
              onConsejo={pedirConsejo}
              onPracticarErrores={() => generarTexto(describirErrores(resultado))}
            />
          </div>
        )}
      </div>

      <Tablero
        restante={restante}
        estado={estado}
        modo={modo}
        onModo={setModo}
        correctas={correctasMostradas}
        onEntregar={entregar}
        onReiniciar={() => reiniciar()}
      />
    </div>
  );
}
