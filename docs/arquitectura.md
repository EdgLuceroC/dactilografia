# Arquitectura

## La idea

Es una aplicación de una sola página, sin backend obligatorio y sin estado remoto. Todo lo que importa —el conteo de palabras, el cronómetro, el historial— ocurre en el navegador de quien practica.

La decisión central es la separación entre **lógica y dibujo**:

- `src/lib/` y `src/juego/` son JavaScript puro. No importan React, no tocan el DOM, no leen variables de entorno (salvo el cliente de IA) y sus funciones son deterministas. Ahí vive todo lo que puede estar mal de una manera que importe: si una palabra cuenta o no, cuántos puntos vale un acierto, qué promedio se muestra.
- `src/components/` es React y nada más que React: recibe datos, dibuja, avisa de los eventos.

Esa frontera es la que hace que las pruebas valgan algo. No hay pruebas de interfaz, y no hacen falta: la parte que decide un puntaje se prueba sin montar un solo componente.

## Flujo de un simulacro

```
                escribe
                   │
                   ▼
        Simulacro (estado del intento)
        │                    │
        │ cada tecla         │ al entregar o al llegar a 0:00
        ▼                    ▼
  marcarTexto()          evaluar()
        │                    │
        ▼                    ▼
   HojaTexto            Resultado ──► useHistorial ──► almacenamiento
   (marcas)             (sello y errores)                (localStorage)
        │
        ▼
   Tablero (reloj y contador)
```

1. `Simulacro` guarda lo escrito y, en cada cambio, pide las marcas con `marcarTexto()`. La palabra que se está tipeando se excluye hasta que se cierra con un espacio: corregirla letra por letra la haría parpadear en rojo mientras se escribe.
2. El reloj corre en un `setInterval` de 200 ms, pero el tiempo se calcula con `Date.now()` contra el instante de inicio, no contando ticks. Una pestaña en segundo plano ralentiza los intervalos; así no regala segundos.
3. Al terminar —por tiempo o por "Entregar ahora"— `evaluar()` produce el resultado completo y `useHistorial` lo persiste.

## Estado duplicado: `useState` y refs

En `Simulacro` y en `Juego` varios valores viven a la vez en el estado de React y en una `ref`. No es descuido:

- El intervalo del reloj se crea una sola vez por intento. Si leyera el estado directamente, capturaría el valor del render en el que se creó. Las refs le dan siempre el valor actual sin recrear el intervalo en cada tecla.
- En el juego, la partida entera vive en una ref. Se actualiza veinte veces por segundo y no tiene sentido reconstruir el árbol de React por cada cambio de posición: un `setTick` por cuadro fuerza el redibujado, y el resto es mutación directa sobre un objeto plano.

## Persistencia

`src/lib/almacenamiento.js` expone `leer` y `guardar` asincrónicos. Usa `window.storage` si el entorno lo provee —así la misma base corre dentro de un artifact de Claude— y `localStorage` en cualquier navegador. Ante cualquier fallo (modo privado, almacenamiento bloqueado, JSON corrupto) devuelve el valor por defecto en vez de propagar el error: perder el historial es molesto, perder el simulacro en curso lo es más.

El historial se recorta a los últimos 60 intentos (`MAX_HISTORIAL`).

## La IA es un accesorio

`src/lib/ia.js` exporta `iaConfigurada`, que es simplemente si existe `VITE_IA_ENDPOINT`. Los componentes consultan esa bandera y esconden los botones correspondientes. No hay estado de carga a medias ni funciones rotas esperando una clave: sin endpoint, esos botones no existen.

Los prompts están en `src/lib/prompts.js`, separados de los componentes, porque se ajustan mucho más seguido que la interfaz.

## Dónde tocar para cambiar cosas

| Quiero...                           | Voy a...                                |
| ----------------------------------- | --------------------------------------- |
| Agregar un texto de práctica        | `src/data/textos.js`                    |
| Agregar palabras al juego           | `src/data/palabras.js`                  |
| Cambiar la meta o la duración       | `src/config.js`                         |
| Cambiar cómo se cuentan los errores | `src/lib/correccion.js` (y sus pruebas) |
| Cambiar la dificultad del juego     | `src/juego/motor.js`                    |
| Cambiar colores o tipografías       | `src/styles/tokens.css`                 |
| Cambiar lo que se le pide a la IA   | `src/lib/prompts.js`                    |
