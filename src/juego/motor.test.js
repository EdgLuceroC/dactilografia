import { describe, expect, it } from "vitest";
import {
  ACIERTOS_POR_NIVEL,
  agregarPalabra,
  avanzar,
  cadenciaDe,
  intentarPalabra,
  nuevoJuego,
  PISO,
  velocidadDe,
} from "./motor.js";

/** Partida en curso con las palabras que se le indiquen. */
function partida(palabras = [], extra = {}) {
  return {
    ...nuevoJuego(),
    estado: "jugando",
    ultimo: 1000,
    id: palabras.length,
    palabras: palabras.map((p, i) => ({ id: i + 1, texto: p.texto, x: 10, y: p.y })),
    ...extra,
  };
}

describe("nuevoJuego", () => {
  it("arranca con tres vidas, sin puntos y sin empezar", () => {
    const s = nuevoJuego();
    expect(s.vidas).toBe(3);
    expect(s.puntos).toBe(0);
    expect(s.nivel).toBe(1);
    expect(s.estado).toBe("inicio");
  });
});

describe("dificultad", () => {
  it("acelera al subir de nivel", () => {
    expect(velocidadDe(2)).toBeGreaterThan(velocidadDe(1));
    expect(cadenciaDe(2)).toBeLessThan(cadenciaDe(1));
  });

  it("no baja de un piso de cadencia, para que siga siendo jugable", () => {
    expect(cadenciaDe(99)).toBe(750);
  });
});

describe("agregarPalabra", () => {
  it("evita repetir una palabra que ya está en pantalla", () => {
    const s = partida([{ texto: "embargo", y: 10 }]);
    const cola = ["embargo", "embargo", "cédula"];
    agregarPalabra(s, () => cola.shift());
    expect(s.palabras.map((p) => p.texto)).toEqual(["embargo", "cédula"]);
  });

  it("las suelta arriba de la cancha", () => {
    const s = partida();
    agregarPalabra(s, () => "fojas");
    expect(s.palabras[0].y).toBeLessThan(0);
  });
});

describe("intentarPalabra", () => {
  it("borra la palabra más baja cuando hay repetidas y suma puntos", () => {
    const s = partida([
      { texto: "fojas", y: 10 },
      { texto: "fojas", y: 70 },
    ]);
    expect(intentarPalabra(s, "fojas ")).toBe(true);
    expect(s.palabras).toHaveLength(1);
    expect(s.palabras[0].y).toBe(10);
    expect(s.puntos).toBe(5);
  });

  it("no acierta si falta la tilde", () => {
    const s = partida([{ texto: "cédula", y: 10 }]);
    expect(intentarPalabra(s, "cedula")).toBe(false);
    expect(s.palabras).toHaveLength(1);
    expect(s.puntos).toBe(0);
  });

  it("sube de nivel cada ocho aciertos", () => {
    const s = partida([], { aciertos: ACIERTOS_POR_NIVEL - 1 });
    s.palabras = [{ id: 1, texto: "fojas", x: 0, y: 0 }];
    intentarPalabra(s, "fojas");
    expect(s.nivel).toBe(2);
  });

  it("ignora lo tipeado si la partida no está en curso", () => {
    const s = { ...partida([{ texto: "fojas", y: 10 }]), estado: "fin" };
    expect(intentarPalabra(s, "fojas")).toBe(false);
  });
});

describe("avanzar", () => {
  it("hace caer las palabras en pantalla", () => {
    const s = partida([{ texto: "fojas", y: 10 }]);
    avanzar(s, s.ultimo, () => "otra");
    expect(s.palabras[0].y).toBeCloseTo(10 + velocidadDe(1));
  });

  it("suelta una palabra nueva cuando la cancha queda vacía", () => {
    const s = partida();
    avanzar(s, s.ultimo, () => "fojas");
    expect(s.palabras).toHaveLength(1);
  });

  it("cobra una vida por cada palabra que toca el piso", () => {
    const s = partida([
      { texto: "fojas", y: PISO },
      { texto: "cédula", y: 10 },
    ]);
    avanzar(s, s.ultimo, () => "otra");
    expect(s.vidas).toBe(2);
    expect(s.palabras.map((p) => p.texto)).toEqual(["cédula"]);
  });

  it("termina la partida cuando se acaban las vidas", () => {
    const s = partida([{ texto: "fojas", y: PISO }], { vidas: 1 });
    expect(avanzar(s, s.ultimo, () => "otra")).toBe(true);
    expect(s.estado).toBe("fin");
    expect(s.vidas).toBe(0);
  });

  it("no hace nada si la partida no empezó", () => {
    const s = nuevoJuego();
    expect(avanzar(s, 0, () => "fojas")).toBe(false);
    expect(s.palabras).toHaveLength(0);
  });
});
