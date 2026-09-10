# Despliegue

`npm run build` deja en `dist/` un sitio estático: HTML, CSS y JavaScript. No necesita servidor de aplicaciones ni base de datos.

La única pieza que sí necesita un servidor es el proxy de IA, y es opcional (ver [ia.md](ia.md)).

| Destino           | Sitio | Proxy de IA | Notas                         |
| ----------------- | :---: | :---------: | ----------------------------- |
| GitHub Pages      |  Sí   |     No      | Flujo de trabajo ya incluido  |
| Vercel            |  Sí   |     Sí      | `api/ia.js` funciona tal cual |
| Netlify           |  Sí   |     Sí      | Hay que adaptar la función    |
| Cualquier hosting |  Sí   |     No      | Subir el contenido de `dist/` |

## GitHub Pages

El repositorio trae `.github/workflows/deploy-pages.yml`, que compila y publica en cada push a `main`.

1. En **Settings → Pages**, elegí **Source: GitHub Actions**.
2. Hacé push a `main`.

Queda en `https://edgluceroc.github.io/dactilografia/`.

El flujo compila con `BASE_PATH=/dactilografia/`, porque el sitio no vive en la raíz del dominio. Si cambiás el nombre del repositorio, cambiá esa variable en el workflow.

Pages sirve archivos estáticos y nada más: la IA queda desactivada, que es el comportamiento por defecto.

## Vercel

1. **Add New → Project** e importá el repositorio.
2. Vercel detecta Vite solo: build `npm run build`, salida `dist`.
3. Si querés la IA, configurá las variables de [ia.md](ia.md).

`BASE_PATH` no hace falta: el sitio vive en la raíz del dominio.

## Netlify

- Build: `npm run build`
- Publish: `dist`

Para la IA hay que portar `api/ia.js` a `netlify/functions/`, como se explica en [ia.md](ia.md).

## Hosting propio

```bash
npm run build
# subir el contenido de dist/ al servidor
```

Si el sitio no queda en la raíz del dominio, compilá con la ruta correspondiente:

```bash
BASE_PATH=/practica/ npm run build
```

Al ser una única página sin rutas internas, no hace falta redirigir nada hacia `index.html`.
