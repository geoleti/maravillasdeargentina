# Maravillas de Argentina
Página estática con panorámicas de Google Maps integradas en un iframe. Un botón Random cambia de destino sin salir del sitio. Sin filtros, buscador ni enlaces externos propios a Maps. Los controles, atribuciones y enlaces que Google incluye en su visor permanecen visibles.

## Selección inicial
14 panorámicas seleccionadas por Leti, con los identificadores y orientación extraídos de sus enlaces completos. Se reemplazó el catálogo de destinos candidatos.
Brazo Tristeza queda pendiente porque solo se recibió un enlace abreviado sin identificador resuelto. Los dos enlaces abreviados anteriores no se agregan como duplicados; se incorporaron los completos enviados posteriormente.

## Funcionamiento
Se usa el formato de inserción de Google Maps con pb e identificador de panorámica, sin clave API. Este formato depende de Google y puede cambiar. Si una imagen es retirada o no admite inserción, se debe obtener su enlace de Compartir / Insertar imagen.
places.json conserva el identificador, coordenadas y orientación original. Pitch se calcula como 90 menos el valor t del enlace.
Random recorre una bolsa mezclada antes de volver a sortear destinos; evita repetir inmediatamente el actual.
Se puede compartir la dirección ?lugar=id.

## Publicación
Settings → Pages → Deploy from a branch → main → /(root).
Sitio: https://geoleti.github.io/maravillasdeargentina/
Sin compilación ni dependencias.
