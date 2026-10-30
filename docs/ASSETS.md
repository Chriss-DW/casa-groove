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
