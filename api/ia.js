/**
 * Proxy hacia la API de Mensajes de Anthropic.
 *
 * Existe por una sola razón: la clave no puede vivir en el navegador. El
 * cliente (src/lib/ia.js) manda el prompt, esta función le agrega la clave que
 * está en las variables de entorno del servidor y devuelve el texto plano.
 *
 * Formato de función serverless de Vercel (`/api/ia`). Para Netlify, Cloudflare
 * u otro proveedor hay que adaptar la firma; la lógica es la misma. Ver docs/ia.md.
 *
 * Variables de entorno:
 *   ANTHROPIC_API_KEY  (obligatoria) clave de la API.
 *   IA_MODELO          (opcional) modelo a usar; por defecto claude-sonnet-5.
 *   IA_MAX_TOKENS      (opcional) tope de tokens de la respuesta.
 */

const API = "https://api.anthropic.com/v1/messages";
const VERSION = "2023-06-01";
const MODELO_POR_DEFECTO = "claude-sonnet-5";
const MAX_TOKENS_POR_DEFECTO = 1000;

/** Tope defensivo: los prompts de la aplicación son mucho más cortos. */
const MAX_LARGO_PROMPT = 8000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  const clave = process.env.ANTHROPIC_API_KEY;
  if (!clave) {
    return res.status(500).json({ error: "Falta ANTHROPIC_API_KEY en el servidor" });
  }

  const cuerpo = typeof req.body === "string" ? safeParse(req.body) : req.body;
  const mensajes = cuerpo && Array.isArray(cuerpo.messages) ? cuerpo.messages : null;

  if (!mensajes || !mensajes.length) {
    return res.status(400).json({ error: "Falta el campo messages" });
  }

  const largo = mensajes.reduce((n, m) => n + String(m.content || "").length, 0);
  if (largo > MAX_LARGO_PROMPT) {
    return res.status(413).json({ error: "Prompt demasiado largo" });
  }

  try {
    const upstream = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": clave,
        "anthropic-version": VERSION,
      },
      body: JSON.stringify({
        // El modelo lo decide el servidor: el cliente solo sugiere.
        model: process.env.IA_MODELO || MODELO_POR_DEFECTO,
        max_tokens: Number(process.env.IA_MAX_TOKENS) || MAX_TOKENS_POR_DEFECTO,
        messages: mensajes,
      }),
    });

    if (!upstream.ok) {
      const detalle = await upstream.text();
      console.error("Error de la API de Anthropic:", upstream.status, detalle);
      return res.status(502).json({ error: "La IA no respondió correctamente" });
    }

    const data = await upstream.json();
    const texto = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return res.status(200).json({ texto });
  } catch (e) {
    console.error("Fallo al llamar a la IA:", e);
    return res.status(502).json({ error: "No se pudo contactar a la IA" });
  }
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
