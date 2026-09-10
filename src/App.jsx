import { useState } from "react";
import Simulacro from "./components/Simulacro.jsx";
import Juego from "./components/Juego.jsx";
import Progreso from "./components/Progreso.jsx";
import { useHistorial } from "./hooks/useHistorial.js";
import { URL_PODER_JUDICIAL } from "./config.js";

const PESTANAS = [
  ["simulacro", "Simulacro de examen"],
  ["juego", "Juego de palabras"],
  ["progreso", "Mi progreso"],
];

export default function App() {
  const [pestana, setPestana] = useState("simulacro");
  const { historial, agregar, borrar } = useHistorial();

  return (
    <div className="app">
      <div className="contenedor">
        <header className="encabezado">
          <h1>Práctica de dactilografía</h1>
          <p>
            Entrenamiento para la primera prueba del concurso de ingreso al Poder Judicial de San Juan, donde hay que
            copiar sin errores 100 palabras de un texto jurídico en 4 minutos.
          </p>
        </header>

        <nav className="pestanas" role="tablist" aria-label="Secciones">
          {PESTANAS.map(([id, nombre]) => (
            <button
              key={id}
              role="tab"
              aria-selected={pestana === id}
              className="pestana"
              onClick={() => setPestana(id)}
            >
              {nombre}
            </button>
          ))}
        </nav>

        <main className="carpeta">
          {pestana === "simulacro" && <Simulacro historial={historial} onResultado={agregar} />}
          {pestana === "juego" && <Juego />}
          {pestana === "progreso" && (
            <Progreso historial={historial} onBorrar={borrar} irASimulacro={() => setPestana("simulacro")} />
          )}
        </main>

        <footer className="pie">
          <p>
            El conteo sigue el criterio del examen (valen las palabras bien escritas, no las tipeadas), pero es una
            estimación, y los textos de esta práctica no son los del concurso. Tu día y horario para rendir figuran en{" "}
            <a href={URL_PODER_JUDICIAL} target="_blank" rel="noreferrer">
              el sitio del Poder Judicial
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
