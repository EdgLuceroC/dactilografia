import { describe, expect, it } from "vitest";
import { alinear, clasificar, evaluar, letrasFalladas, marcarTexto } from "./correccion.js";
import { tokenizar } from "./texto.js";

const TEXTO = "El Tribunal ordena correr traslado de la demanda por el término de ley.";

describe("alinear", () => {
  it("marca como correctas las palabras copiadas tal cual", () => {
    const ref = tokenizar(TEXTO);
    const { ops, fin } = alinear(ref, tokenizar("El Tribunal ordena"));
    expect(ops.every((o) => o.tipo === "ok")).toBe(true);
    expect(fin).toBe(3);
  });

  it("no penaliza el texto que todavía no se copió", () => {
    const ref = tokenizar(TEXTO);
    const { ops } = alinear(ref, tokenizar("El Tribunal"));
    expect(ops).toHaveLength(2);
  });

  it("detecta una palabra salteada sin arrastrar el error al resto", () => {
    const { ops } = alinear(tokenizar("correr traslado de la demanda"), tokenizar("correr de la demanda"));
    expect(ops.filter((o) => o.tipo === "del")).toHaveLength(1);
    expect(ops.filter((o) => o.tipo === "ok")).toHaveLength(4);
  });

  it("detecta una palabra de más", () => {
    const { ops } = alinear(tokenizar("correr traslado"), tokenizar("correr el traslado"));
    expect(ops.filter((o) => o.tipo === "ins")).toHaveLength(1);
  });
});

describe("clasificar", () => {
  it("distingue el error de tilde", () => {
    expect(clasificar("término", "termino")).toBe("tildes");
    expect(clasificar("señoría", "senoria")).toBe("tildes");
  });

  it("distingue el error de mayúscula", () => {
    expect(clasificar("Tribunal", "tribunal")).toBe("mayusculas");
  });

  it("distingue el error de puntuación", () => {
    expect(clasificar("ley.", "ley")).toBe("puntuacion");
  });

  it("cae en letras cambiadas cuando la palabra es otra", () => {
    expect(clasificar("traslado", "trasaldo")).toBe("letras");
  });

  it("prioriza la tilde cuando el error es de tilde y de mayúscula a la vez", () => {
    expect(clasificar("Minería", "mineria")).toBe("tildes");
  });
});

describe("letrasFalladas", () => {
  it("informa las letras que faltan en lo escrito", () => {
    expect(letrasFalladas("demanda", "demada")).toContain("n");
  });

  it("ignora los signos y los espacios", () => {
    expect(letrasFalladas("ley.", "ley")).toEqual([]);
  });
});

describe("evaluar", () => {
  it("cuenta solo las palabras escritas exactamente igual", () => {
    const r = evaluar(TEXTO, "El tribunal ordena correr traslado", 60);
    expect(r.escritas).toBe(5);
    expect(r.correctas).toBe(4);
    expect(r.errores.mayusculas).toBe(1);
  });

  it("calcula velocidad y precisión", () => {
    const r = evaluar(TEXTO, "El Tribunal ordena correr traslado de", 60);
    expect(r.ppm).toBe(6);
    expect(r.precision).toBe(100);
  });

  it("no divide por cero con un intento vacío", () => {
    const r = evaluar(TEXTO, "", 0);
    expect(r.escritas).toBe(0);
    expect(r.correctas).toBe(0);
    expect(r.precision).toBe(0);
    expect(r.aprobado).toBe(false);
  });

  it("aprueba a partir de las 100 palabras correctas", () => {
    const largo = Array.from({ length: 100 }, (_, i) => `palabra${i}`).join(" ");
    const r = evaluar(largo, largo, 240);
    expect(r.correctas).toBe(100);
    expect(r.aprobado).toBe(true);
  });

  it("guarda ejemplos de los errores cometidos", () => {
    const r = evaluar(TEXTO, "El tribunal ordena", 30);
    expect(r.ejemplos[0]).toEqual({ era: "Tribunal", escribiste: "tribunal" });
  });
});

describe("marcarTexto", () => {
  it("pinta lo copiado y señala la palabra que sigue", () => {
    const tokens = tokenizar(TEXTO);
    const { marcas, correctas } = marcarTexto(tokens, tokenizar("El Tribunal"), true);
    expect(marcas.slice(0, 2)).toEqual(["ok", "ok"]);
    expect(marcas[2]).toBe("actual");
    expect(correctas).toBe(2);
  });

  it("no señala nada cuando el intento ya terminó", () => {
    const tokens = tokenizar(TEXTO);
    const { marcas } = marcarTexto(tokens, tokenizar("El Tribunal"), false);
    expect(marcas).not.toContain("actual");
  });
});
