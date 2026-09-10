# Contribuir

Gracias por el interés. Este proyecto lo usa gente que está por rendir un concurso, así que la prioridad es que lo que ya funciona siga funcionando.

## Lo más útil que podés aportar

- **Textos de práctica nuevos.** Escritos judiciales de 180 a 210 palabras, en un solo párrafo, con puntuación y tildes impecables. Van en `src/data/textos.js`.
- **Vocabulario para el juego.** Palabras del ámbito judicial, sobre todo con tilde, ñ o mayúscula inicial. Van en `src/data/palabras.js`.
- **Correcciones al conteo.** Si encontrás un caso donde la aplicación cuenta distinto que el criterio del examen, abrí un issue con el texto original y lo que se escribió: es el tipo de error que más importa.

> Los textos deben ser **originales y ficticios**. No incluyas escritos reales, nombres de personas, ni material del concurso.

## Poner el proyecto a andar

```bash
npm install
npm run dev
```

Node 20 o superior.

## Antes de abrir un pull request

```bash
npm run lint
npm test
npm run format
```

Los tres tienen que pasar limpio. Si tocaste `src/lib/` o `src/juego/`, agregá o ajustá las pruebas correspondientes: esa es la parte que decide un puntaje y no se cambia sin cobertura.

## Estilo

- **El código y los comentarios van en español**, como el resto del proyecto.
- Prettier decide el formato; no discutas con él, corré `npm run format`.
- Los comentarios explican **por qué**, no qué. Si hace falta explicar qué hace una línea, probablemente convenga reescribirla.
- Lógica sin React en `src/lib/` y `src/juego/`; los componentes solo dibujan.

## Mensajes de commit

En español, en imperativo, cortos:

```
Agrega un texto de práctica sobre sucesiones
Corrige el conteo cuando se saltea la última palabra
```

## Reportar un problema

Usá las plantillas de issue. Para un error de conteo, incluí siempre el texto original, lo que se escribió y lo que esperabas que contara: sin eso no se puede reproducir.
