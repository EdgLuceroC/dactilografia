# Configurar la IA (opcional)

## Qué agrega y qué no

Sin ninguna configuración, la aplicación funciona completa: tres textos de práctica, cronómetro, corrección, diagnóstico, juego e historial. Nada de eso depende de la IA.

Con un endpoint configurado aparecen dos botones más:

- **Texto nuevo con IA**: genera un escrito judicial original de 180 a 210 palabras sobre un tema sorteado.
- **Pedir devolución** / **Practicar mis errores**: analiza el último intento y devuelve un diagnóstico escrito, o genera un texto que concentra justo los errores cometidos (si falla las tildes, un texto cargado de tildes).

Si `VITE_IA_ENDPOINT` no está definida, esos botones no se dibujan.

## Por qué hace falta un proxy

La API de Anthropic requiere una clave, y una clave en el navegador es una clave pública: cualquiera que abra las herramientas de desarrollo la ve, y el consumo se factura a quien la puso. **Nunca** pongas una clave en `VITE_*`, porque todo lo que empieza con ese prefijo termina dentro del JavaScript que se descarga.

El repositorio incluye [`api/ia.js`](../api/ia.js), una función serverless mínima que recibe el prompt, le agrega la clave del lado del servidor y devuelve el texto.

```
navegador ──POST {messages}──► /api/ia ──+ x-api-key──► api.anthropic.com
                                (servidor)
```

## Opción A · Vercel (la más directa)

`api/ia.js` ya tiene el formato que espera Vercel.

1. Importá el repositorio en [vercel.com](https://vercel.com).
2. En **Settings → Environment Variables** agregá:

   | Variable            | Valor                        | Ámbito   |
   | ------------------- | ---------------------------- | -------- |
   | `ANTHROPIC_API_KEY` | tu clave                     | servidor |
   | `VITE_IA_ENDPOINT`  | `/api/ia`                    | build    |
   | `IA_MODELO`         | `claude-sonnet-5` (opcional) | servidor |

3. Volvé a desplegar.

`ANTHROPIC_API_KEY` no lleva prefijo `VITE_`: por eso queda solo en el servidor.

## Opción B · Netlify

Misma idea, con otra firma. Copiá la lógica de `api/ia.js` a `netlify/functions/ia.js` adaptando el handler al formato de Netlify (`export async function handler(event)`, leyendo `event.body` y devolviendo `{ statusCode, body }`), y apuntá `VITE_IA_ENDPOINT` a `/.netlify/functions/ia`.

## Opción C · un proxy propio

`VITE_IA_ENDPOINT` puede apuntar a cualquier endpoint que acepte un `POST` con este cuerpo:

```json
{
  "model": "claude-sonnet-5",
  "max_tokens": 1000,
  "messages": [{ "role": "user", "content": "..." }]
}
```

y responda con la forma de la API de Anthropic (`{ "content": [{ "type": "text", "text": "..." }] }`) o con la forma corta `{ "texto": "..." }`. El cliente acepta las dos.

## Desarrollo local

Copiá `.env.example` a `.env` y completá lo que necesites. `.env` está en `.gitignore`.

```bash
cp .env.example .env
```

`vite dev` no ejecuta las funciones de `api/`. Para probar la IA en local, o usás `vercel dev`, o levantás un proxy propio y apuntás `VITE_IA_ENDPOINT` a esa dirección.

## Costo y límites

Cada texto generado y cada devolución son una llamada a la API, del orden de mil tokens de salida. La función incluye un tope de largo de prompt como defensa mínima, pero **no** tiene autenticación ni límite de frecuencia: si publicás el sitio con la IA activada, cualquiera que lo abra gasta tu cuota. Para un uso público conviene agregar límite por IP o dejar la IA apagada.

## Modelo

Por defecto se usa `claude-sonnet-5`, que se puede cambiar con `IA_MODELO` en el servidor. El modelo lo decide el servidor y no el cliente, así el navegador no puede pedir uno más caro.
