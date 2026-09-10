import { describe, expect, it } from "vitest";
import { resumirHistorial } from "./estadisticas.js";

const sinErrores = { tildes: 0, mayusculas: 0, puntuacion: 0, letras: 0, omitidas: 0, sobrantes: 0 };

/** Intento mínimo con lo que mira el resumen. */
const intento = (correctas, errores = {}) => ({
  fecha: Date.now(),
  correctas,
  aprobado: correctas >= 100,
  errores: { ...sinErrores, ...errores },
});

describe("resumirHistorial", () => {
  it("devuelve null si todavía no hay intentos", () => {
    expect(resumirHistorial([])).toBeNull();
  });

  it("resume mejor marca, promedio reciente y aprobados", () => {
    const r = resumirHistorial([intento(60), intento(104), intento(80)]);
    expect(r.total).toBe(3);
    expect(r.mejor).toBe(104);
    expect(r.promedio).toBe(81);
    expect(r.aprobados).toBe(1);
  });

  it("promedia solo los últimos cinco intentos", () => {
    const historial = [intento(0), intento(0), ...Array.from({ length: 5 }, () => intento(90))];
    expect(resumirHistorial(historial).promedio).toBe(90);
  });

  it("identifica la categoría de error dominante", () => {
    const historial = [intento(70, { tildes: 4, puntuacion: 1 }), intento(75, { tildes: 3 })];
    expect(resumirHistorial(historial).principal[0]).toBe("tildes");
  });

  it("grafica como máximo los últimos veinte intentos", () => {
    const historial = Array.from({ length: 25 }, (_, i) => intento(i));
    const r = resumirHistorial(historial);
    expect(r.ultimos).toHaveLength(20);
    expect(r.ultimos[19].correctas).toBe(24);
  });
});
