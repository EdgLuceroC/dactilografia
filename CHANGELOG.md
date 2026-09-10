# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Este proyecto sigue [versionado semántico](https://semver.org/lang/es/).

## [1.1.0] - 2026-09-10

### Agregado

- Seis textos de práctica nuevos, repartidos entre los fueros más frecuentes:
  sucesión, amparo de salud, cuota alimentaria, daños y perjuicios, servidumbre
  minera y desalojo. Son nueve en total.
- Navegación de las pestañas con las flechas, Inicio y Fin, según el patrón de
  pestañas de ARIA.

### Corregido

- La etiqueta "meta: 100" del gráfico se pisaba con el último intento cuando la
  marca andaba cerca de la meta; pasa al borde izquierdo.
- Las pestañas declaraban `role="tab"` pero el contenido no era un `tabpanel` ni
  estaba asociado a la pestaña que lo abre: un lector de pantalla anunciaba las
  pestañas sin poder decir qué controlaban.
- `actions/checkout` y `actions/setup-node` pasan a v5. GitHub saca Node 20 de
  los runners el 23 de septiembre de 2026 y los workflows dejarían de correr.

## [1.0.0] - 2026-09-10

Primera versión publicada. La aplicación pasó de ser un único archivo a un
proyecto Vite con la lógica separada de la interfaz y con pruebas.

### Agregado

- Simulacro cronometrado de 4 minutos con tres escritos judiciales incluidos.
- Corrección palabra por palabra con marcas en vivo sobre el texto.
- Modo examen, sin marcas ni contador.
- Diagnóstico por categoría de error y detección de las letras más falladas.
- Juego de palabras que caen, con niveles y récord persistente.
- Sección de progreso con gráfico de intentos, promedios y tabla de detalle.
- Generación de textos y devoluciones con IA, opcionales y desactivadas por
  defecto, con proxy serverless incluido en `api/ia.js`.
- 44 pruebas sobre corrección, normalización de texto, motor del juego y
  estadísticas.
- Documentación en `docs/`: arquitectura, algoritmo de corrección, IA y
  despliegue.
- Integración continua y publicación automática en GitHub Pages.

### Cambiado

- El almacenamiento usa `localStorage` cuando no hay una API externa, así la
  aplicación funciona en cualquier navegador y no solo dentro de un artifact.
- Los estilos dejaron de vivir en una cadena de texto dentro del JavaScript y
  pasaron a hojas de estilo por sección.
