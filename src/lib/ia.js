/**
 * Cliente de la IA (opcional).
 *
 * La aplicación es autosuficiente sin IA: hay nueve textos incluidos y toda la
 * corrección es local. La IA solo agrega textos nuevos y devoluciones escritas.
 *
 * El endpoint se configura con `VITE_IA_ENDPOINT` y recibe un cuerpo con la
 * forma de la API de Mensajes de Anthropic. Puede ser:
 *   - la función serverless de `api/ia.js`, que guarda la clave del lado del
 *     servidor (recomendado);
 *   - un proxy propio compatible con esa API.
 *
 * Si la variable no está definida, `iaConfigurada` es `false` y la interfaz
 * esconde los botones que dependen de la IA. Ver docs/ia.md.
 */

const ENDPOINT = import.meta.env.VITE_IA_ENDPOINT || "";
const MODELO = import.meta.env.VITE_IA_MODELO || "claude-sonnet-5";
const MAX_TOKENS = 1000;

/** ¿Hay un endpoint de IA configurado en este despliegue? */
export const iaConfigurada = Boolean(ENDPOINT);

/**
 * Envía un prompt y devuelve el texto plano de la respuesta.
 *
 * Acepta tanto la respuesta cruda de Anthropic (`{ content: [...] }`) como la
 * forma simplificada del proxy incluido (`{ texto: "..." }`).
 *
 * @param {string} prompt
 * @returns {Promise<string>}
 * @throws {Error} Si la IA no está configurada o la respuesta no es válida.
 */
export async function pedirTexto(prompt) {
  if (!iaConfigurada) throw new Error("IA no configurada");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: MAX_TOKENS,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();

  if (typeof data.texto === "string") return data.texto.trim();

  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
