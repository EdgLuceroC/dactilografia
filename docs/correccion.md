# Cómo se corrige un intento

Todo lo que se describe acá está en [`src/lib/correccion.js`](../src/lib/correccion.js) y probado en `src/lib/correccion.test.js`.

## El criterio del examen

Una palabra suma si está escrita **exactamente igual** que en el texto original. `término` no es `termino`, `Tribunal` no es `tribunal` y `ley.` no es `ley`. No hay puntaje parcial.

Eso vuelve al conteo aparentemente trivial y en realidad no lo es, por dos motivos.

## Problema 1: las palabras se corren

Comparar la palabra número _n_ de lo escrito contra la número _n_ del original funciona hasta que alguien saltea una. A partir de ahí, todo lo que sigue queda desfasado y se marcaría como error, aunque esté perfecto.

La solución es alinear las dos secuencias con **distancia de edición sobre palabras** (Levenshtein, con las palabras como unidad en lugar de las letras). Se llena la matriz `dp[i][j]` = mínima cantidad de operaciones para convertir las primeras `i` palabras del original en las primeras `j` de lo escrito, y después se recorre hacia atrás para recuperar qué pasó con cada una:

| Operación | Significado                         | Cuenta como          |
| --------- | ----------------------------------- | -------------------- |
| `ok`      | Coinciden carácter por carácter     | Palabra correcta     |
| `sub`     | Se escribió otra cosa en su lugar   | Error (se clasifica) |
| `del`     | La palabra del original no se copió | Palabra salteada     |
| `ins`     | Se escribió una palabra que no está | Palabra de más       |

Así, saltear una palabra cuesta exactamente una palabra, no todas las siguientes.

## Problema 2: el intento no llega al final

En cuatro minutos casi nadie copia el texto entero. Si se comparara contra el original completo, las 60 u 80 palabras que faltan aparecerían como salteadas y el diagnóstico sería inútil.

Por eso no se toma `dp[n][m]`, sino el prefijo del original que mejor coincide con lo escrito:

```js
let fin = 0;
for (let i = 0; i <= n; i++) if (dp[i][m] <= dp[fin][m]) fin = i;
```

`fin` es la posición hasta donde llegó la persona, y la reconstrucción del camino arranca ahí. El resto del texto simplemente no se evalúa. Con `<=` en la comparación se prefiere el prefijo más largo entre los empatados, que es el que corresponde a haber avanzado más.

`fin` cumple una segunda función: es la palabra que hay que resaltar como "la que sigue" mientras se escribe.

## Clasificar el error

Cuando una palabra no coincide, saber que "está mal" no sirve para practicar. `clasificar()` busca la explicación **más específica** que dé cuenta de la diferencia, y el orden importa:

```js
if (sinTildes(r) === sinTildes(e)) return "tildes"; // término / termino
if (r.toLowerCase() === e.toLowerCase()) return "mayusculas"; // Tribunal / tribunal
if (sinPuntuacion(r) === sinPuntuacion(e)) return "puntuacion"; // ley. / ley
if (normalizar(r) === normalizar(e)) return "tildes"; // Minería / mineria
return "letras"; // traslado / trasaldo
```

El cuarto caso es el que mezcla problemas: `Minería` escrito `mineria` falla por tilde **y** por mayúscula. Se imputa a las tildes porque es el error que más aparece en textos judiciales en español y el que conviene señalar primero.

`sinTildes` usa normalización Unicode NFD, que descompone `é` en `e` + acento y permite borrar el acento sin tabla de reemplazos. Como efecto secundario, `ñ` se descompone en `n` + virgulilla: por eso la categoría se llama "tildes y ñ".

## Las letras que se escapan

Para los errores de tipeo real (`traslado` → `trasaldo`), `letrasFalladas()` calcula la **subsecuencia común más larga** entre la palabra esperada y la escrita, y devuelve las letras del original que no entraron en esa subsecuencia. Acumuladas a lo largo del intento, salen las cinco teclas que más cuesta acertar.

## Velocidad y precisión

```
ppm       = palabras escritas / minutos transcurridos
precisión = palabras correctas / palabras escritas
correctas = operaciones "ok"          ← lo único que cuenta en el examen
```

La velocidad se calcula sobre lo **escrito** y no sobre lo correcto, a propósito: separar ambas cifras es lo que permite distinguir a quien tipea rápido y sucio de quien tipea prolijo y lento. El diagnóstico de las dos es distinto.

## Costo

La matriz es de `(n+1) × (m+1)` con `n` y `m` en el orden de las 200 palabras: unas 40.000 celdas, que se recalculan en cada tecla mientras se escribe. En la práctica lleva menos de un milisegundo y no se nota; si algún día los textos fueran mucho más largos, habría que recalcular solo el tramo afectado.
