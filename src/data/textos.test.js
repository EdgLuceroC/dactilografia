import { describe, expect, it } from "vitest";
import { TEXTOS } from "./textos.js";
import { PALABRAS_JUEGO } from "./palabras.js";
import { tokenizar } from "../lib/texto.js";

/**
 * El contenido se edita a mano y se acepta por pull request, así que conviene
 * que las reglas del README las controle una prueba y no la buena memoria de
 * quien revisa.
 */

describe("textos de práctica", () => {
  it("tiene identificadores únicos", () => {
    const ids = TEXTOS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("tiene nombres únicos, que son lo que se ve en la tabla de progreso", () => {
    const nombres = TEXTOS.map((t) => t.nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it.each(TEXTOS.map((t) => [t.nombre, t]))("«%s» dura lo que dura la prueba", (_nombre, t) => {
    // Menos de 180 se copia entero antes de tiempo; más de 210 no se llega ni cerca.
    const palabras = tokenizar(t.texto).length;
    expect(palabras).toBeGreaterThanOrEqual(180);
    expect(palabras).toBeLessThanOrEqual(210);
  });

  it.each(TEXTOS.map((t) => [t.nombre, t]))("«%s» es un párrafo único y prolijo", (_nombre, t) => {
    expect(t.texto).not.toMatch(/[\n\r\t]/);
    expect(t.texto).not.toMatch(/ {2}/);
    expect(t.texto.trim()).toBe(t.texto);
    expect(t.texto).toMatch(/[.]$/);
  });

  it("usa tildes y mayúsculas, que es lo que se viene a practicar", () => {
    for (const t of TEXTOS) {
      expect(t.texto).toMatch(/[áéíóúñ]/);
      expect(t.texto).toMatch(/[A-ZÁÉÍÓÚÑ]/);
    }
  });

  it("no arranca con el prefijo reservado a los textos de la IA", () => {
    expect(TEXTOS.some((t) => t.id.startsWith("ia-"))).toBe(false);
  });
});

describe("palabras del juego", () => {
  it("no repite palabras", () => {
    expect(new Set(PALABRAS_JUEGO).size).toBe(PALABRAS_JUEGO.length);
  });

  it("son palabras sueltas, sin espacios ni puntuación", () => {
    for (const p of PALABRAS_JUEGO) {
      expect(p).toMatch(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+$/);
    }
  });
});
