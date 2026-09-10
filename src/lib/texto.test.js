import { describe, expect, it } from "vitest";
import { formatoTiempo, normalizar, sinPuntuacion, sinTildes, tokenizar } from "./texto.js";

describe("tokenizar", () => {
  it("separa por espacios, saltos de línea y tabulaciones", () => {
    expect(tokenizar("  El   Tribunal\nordena\ttraslado ")).toEqual(["El", "Tribunal", "ordena", "traslado"]);
  });

  it("devuelve una lista vacía si no hay nada escrito", () => {
    expect(tokenizar("   ")).toEqual([]);
  });
});

describe("sinTildes", () => {
  it("quita tildes y diéresis", () => {
    expect(sinTildes("término")).toBe("termino");
    expect(sinTildes("antigüedad")).toBe("antiguedad");
  });
});

describe("sinPuntuacion", () => {
  it("quita los signos usuales de un escrito judicial", () => {
    expect(sinPuntuacion("ley;")).toBe("ley");
    expect(sinPuntuacion("«fojas»")).toBe("fojas");
  });
});

describe("normalizar", () => {
  it("iguala palabras que solo difieren en tilde, signo o mayúscula", () => {
    expect(normalizar("Señoría,")).toBe(normalizar("senoria"));
  });
});

describe("formatoTiempo", () => {
  it("formatea como reloj de examen", () => {
    expect(formatoTiempo(240)).toBe("4:00");
    expect(formatoTiempo(59.2)).toBe("1:00");
    expect(formatoTiempo(9)).toBe("0:09");
  });

  it("nunca muestra tiempo negativo", () => {
    expect(formatoTiempo(-3)).toBe("0:00");
  });
});
