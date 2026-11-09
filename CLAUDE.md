# Ápex — instrucciones para Claude

App estática (GitHub Pages: celis07.github.io/dosifica) con Supabase (proyecto pxttepssphezwptpgdvw) detrás.
Cada archivo de `js/` tiene arriba un comentario que explica qué hace; los archivos nuevos se cargan al final de `index.html` y envuelven funciones anteriores (renderHome, renderAthlete…).

## Reglas de trabajo
- Antes de cualquier cambio, decirle a Manuel qué se va a hacer y esperar su aprobación. Revisar como desarrollador senior: facilidad de uso, accesibilidad (usuario y fisio) y estética.
- En la app se dice "usuarios" y "usuarias", no "pacientes".
- Manda lo que escribe el fisio: la semana generada es solo un borrador.
- Al publicar: subir la versión del caché en `sw.js` (const V) y agregar los archivos nuevos a CORE / la lista de JS.

## Guía de Ápex (OBLIGATORIO)
`js/guia.js` es la guía para fisios de todas las funciones (Cuenta → Herramientas → Guía de Ápex).
**Cada cambio que agregue, quite o cambie una función visible actualiza `js/guia.js` en el mismo commit**
(la sección que corresponda y `GUIA_FECHA`). Si una función se elimina, se quita de la guía.
