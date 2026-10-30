# Verificación

El catálogo se verificó localmente durante su desarrollo: 24 fotografías cargadas, cinco categorías, búsquedas, recorridos editoriales, guardar y quitar, notas Unicode tras recargar, vaciar y deshacer, detalle y retorno de foco, modelos e iluminación. Se comprobó una descarga HTML con fotografías incrustadas, créditos y nota.

Se revisaron escritorio a 1440 px, móvil a 390 px y un ancho de 309 px sin desbordamiento horizontal observado. La revisión independiente del catálogo cerró las correcciones de foco y motivos por pareja. Esto no constituye una certificación de accesibilidad integral ni una suite completa de navegadores.

Las pruebas de estado se ejecutan con node --test scripts/selection.test.mjs. Cubren validación, persistencia, datos incompatibles conservados, cuota, Unicode, vaciar y restaurar y actualización entre pestañas. node scripts/check-site.mjs comprueba sintaxis, recursos y referencias del HTML.

El almacenamiento es local a cada origen y navegador. Si no está disponible, se informa y se mantiene la selección en memoria. La sala y los modelos requieren WebGL; el audio necesita Web Audio y una acción del visitante.
