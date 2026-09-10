# Registro de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Este proyecto sigue [versionado semántico](https://semver.org/lang/es/).

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
