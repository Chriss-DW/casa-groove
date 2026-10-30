# Trabajar en CASA GROOVE

Cada commit debe explicar una mejora concreta y dejar un cambio que pueda revisarse.

1. Actualizá `main` y creá una rama `codex/descripcion-del-cambio`.
2. Realizá una mejora acotada. Si cambia el catálogo, editá su contenido fuente y regeneralo.
3. Ejecutá `node --test scripts/selection.test.mjs` y `node scripts/check-site.mjs`. Para cambios visuales, revisá escritorio y móvil.
4. Revisá `git diff` y agrupá los archivos por propósito antes de confirmar.
5. Usá mensajes como `feat(catalogo): agregar una nueva colección`, `fix(seleccion): conservar las notas al recargar` o `docs: explicar los controles de la sala`.
6. Subí la rama a GitHub y revisá el resultado antes de integrarlo en `main`.

Las fechas reflejan cuándo se confirma el trabajo. El historial muestra avances reales; no necesita commits vacíos ni fragmentar cambios inseparables.

Conservá los créditos y las licencias de las fotografías, fuentes y bibliotecas. La publicación del alojamiento se realiza por separado de los commits.
