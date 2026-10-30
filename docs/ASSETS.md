# Recursos y procedencia

## Portada de atardecer

`dist/assets/sunset-room.webp`: imagen original generada con la herramienta integrada de OpenAI el 25 de octubre de 2026. No es una fotografía de un inmueble o estudio real. Se convirtió a WebP con calidad 86 y se incluyó una descripción de procedencia EXIF. El PNG original se conserva fuera de los archivos servidos.

Prompt utilizado:

> Create an original cinematic architectural interior photograph for a retro interiors website hero, landscape 16:9. A quiet 1970s listening room at sunset, rich dark walnut wood panel walls, low burnt sienna / cognac velvet conversation sofa on the right, a small glowing amber mushroom lamp and walnut turntable cabinet on left, vinyl sleeves leaning casually below, large window partly out of frame on far right casting narrow long amber shafts across wood and dark rug. Lower half falls into very dark warm chocolate shadow. Rich blacks, burnt orange, deep burgundy, soft cream light, intimate golden-hour atmosphere, tasteful analog warmth, beautifully tactile upholstery and wood. Composition centered with generous calm dark negative space in middle for a short website heading overlay; room objects arranged near sides and bottom, camera straight-on at seated human eye level, photographic not cartoon or isometric, no people, NO text, NO letters, NO logos, NO watermark. Subtle film grain, elegant real interior photography, not glossy showroom, not bright pastel, not neon.

## Fotografías auténticas del catálogo

Las seis fotografías se descargaron de páginas que indicaban “Free to use under the Unsplash License”. Son fotografías de inspiración de objetos reales, independientes de los modelos conceptuales de Casa Groove. No se ofrecen productos ni se presenta una relación comercial con sus autores o fabricantes. Se conservan como JPG locales; se incluyeron autor, fuente y licencia en EXIF y créditos visibles enlazados a cada fotografía.

| Archivo | Autor | Fuente |
|---|---|---|
| `catalog/lamp.jpg` | Andy Bob | [Lámpara blanca junto a libros](https://unsplash.com/photos/a-glowing-lamp-sits-next-to-a-vase-and-books--Gem15xQAE4) |
| `catalog/pendant.jpg` | Brennan Burling | [Lámparas de filamento suspendidas](https://unsplash.com/photos/brown-wooden-pendant-lamp-xn602Ft9HJQ) |
| `catalog/poster.jpg` | Jonah Townsley | [Cuadros y gráfica vintage](https://unsplash.com/photos/a-collection-of-framed-art-and-a-HbSZg8ktp7I) |
| `catalog/sofa.jpg` | Phillip Goldsberry | [Sofá verde de tela](https://unsplash.com/photos/green-fabric-sofa-fZuleEfeA1Q) |
| `catalog/vinyl.jpg` | Brett Jordan | [Disco de vinilo](https://unsplash.com/photos/vinyl-record-on-white-table-P_LEitbpCPg) |
| `catalog/turntable.jpg` | Alexandr Popadin | [Tocadiscos antiguo de madera](https://unsplash.com/photos/antique-record-player-with-wooden-cabinet-5h8AtwI0CDI) |

Licencia verificada: [Unsplash License](https://unsplash.com/license). Detalle legible por máquina en `dist/assets/catalog/credits.json`. El encuadre se realiza con CSS; las fotos no fueron generadas ni recreadas con IA. Un tratamiento CSS discreto reduce saturación y brillo para mantener la continuidad del ambiente.

## Gráfica y objetos

Geometrías originales en `room.js` y `objects.js`. Las texturas de madera, tela, etiquetas y pósteres se dibujan con Canvas; las vistas identificadas como 3D son renders locales de esos objetos, regenerados al cambiar la iluminación. Día/noche e interruptores cambian estos modelos, no las fotografías. Las carátulas y marcas de los modelos son ficticias. Los círculos del fondo musical son geometría CSS que representa discos.

## Música

Tres ambientes originales sintetizados en `music.js` con Web Audio: Hora dorada, Sin prisa y Lado B. Progresiones armónicas y melodías definidas en código; no se incorporan grabaciones de terceros. El audio necesita una interacción del usuario y se pausa cuando la página se oculta.

## Dependencias

Three.js 0.180.0, MIT; Inter, Shrikhand y Bodoni Moda, SIL Open Font License. Copias locales y licencias en `dist/assets`. Ninguno de estos recursos necesita un CDN para funcionar en la página publicada.


## Ampliación del catálogo · 26 de octubre de 2026

Dieciocho fotografías reales adicionales completan un catálogo de 24 inspiraciones. WebP de hasta 900 px, 866.692 bytes en conjunto; procedencia y créditos EXIF incluidos. Los nombres son editoriales de CASA GROOVE y no identifican modelos comerciales ni ediciones musicales.

| Archivo en `catalog/expanded/` | Fotografía | Fuente |
|---|---|---|
| `art-gallery.webp` | Jonny Caspari | [Original](https://unsplash.com/photos/assorted-color-framed-paintings-on-the-wall-KuudDjBHIlA) |
| `art-studio.webp` | Amris Mendoza | [Original](https://unsplash.com/photos/a-poster-on-a-wall-VFMtQToqI04) |
| `art-paris.webp` | Charlotte Fosdike | [Original](https://unsplash.com/photos/a-bunch-of-posters-on-the-wall-of-a-building-crw8I3Bzp4Q) |
| `art-river.webp` | Alexander Lunyov | [Original](https://unsplash.com/photos/framed-painting-of-a-river-scene-above-a-lamp-nfbXRLeKXOE) |
| `vinyl-stack.webp` | Ryan Waldman | [Original](https://unsplash.com/photos/a-stack-of-vinyl-records-on-a-table-ONOEf8J-mDE) |
| `vinyl-crate.webp` | Cord Allman | [Original](https://unsplash.com/photos/a-hand-sifting-through-a-box-of-vinyl-records-cPT15-coAFc) |
| `vinyl-spin.webp` | Dmitry Spravko | [Original](https://unsplash.com/photos/a-vinyl-record-spinning-on-a-turntable-in-low-light-DIGeBP4UEVk) |
| `turntable-red.webp` | Alice Kotlyarenko | [Original](https://unsplash.com/photos/a-turntable-sitting-on-top-of-a-table-next-to-a-lamp-nOyJzEmlRz4) |
| `turntable-portable.webp` | Mick Haupt | [Original](https://unsplash.com/photos/open-turntable-zohyTq85mRE) |
| `turntable-tea.webp` | Moritz | [Original](https://unsplash.com/photos/vintage-record-player-with-vinyl-records-and-cup-CdF3MGRyOc4) |
| `chair-reading.webp` | Clay Banks | [Original](https://unsplash.com/photos/a-chair-and-a-small-table-in-a-room-Y9iAaT2my2I) |
| `chair-wood.webp` | Clay Banks | [Original](https://unsplash.com/photos/a-chair-and-a-potted-plant-in-a-room-CqQYuru1gxo) |
| `sideboard-sun.webp` | Julia / Beazy (Elvira Nisman) | [Original](https://unsplash.com/photos/minimalist-living-room-with-wooden-sideboard-aX1TTOuq83M) |
| `table-lounge.webp` | Andrea Davis | [Original](https://unsplash.com/photos/brown-wooden-coffee-table-beside-blue-couch-hfCS5un07f8) |
| `lamp-pleated.webp` | ANGIE BAONGOC | [Original](https://unsplash.com/photos/a-vintage-lamp-with-a-pleated-shade-illuminates-a-room-QHt6Bqn06oo) |
| `lamp-diner.webp` | WEB AGENCY / LEEROY | [Original](https://unsplash.com/photos/brown-desk-lamp-turned-on-tnKoPaEFsdE) |
| `lamp-floor.webp` | Andy Bob | [Original](https://unsplash.com/photos/modern-black-floor-lamp-in-a-living-room-setting-pNoNEUGK0ls) |
| `lamp-pendant.webp` | Igor Starkov | [Original](https://unsplash.com/photos/turned-on-pendant-lamp-osSjwCjVMIg) |

Metadatos completos (URL de imagen, licencia, dimensiones y SHA-256): `dist/assets/catalog/expanded/credits.json`. Se mantiene la distinción entre fotografías de inspiración, imagen conceptual de portada y seis modelos ilustrativos. Los créditos acompañan también las imágenes incluidas en la descarga personal de la selección.
