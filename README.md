# Maravillas de Argentina
Página  con panorámicas de Google Maps integradas en un iframe. Un botón Random cambia de destino sin salir del sitio. Sin filtros, buscador ni enlaces externos propios a Maps. Los controles, atribuciones y enlaces que Google incluye en su visor permanecen visibles.

## Selección inicial
Panorámicas seleccionadas, con los identificadores y orientación extraídos de sus enlaces completos. 

## Funcionamiento
Se usa el formato de inserción de Google Maps con pb e identificador de panorámica, sin clave API. Este formato depende de Google y puede cambiar. Si una imagen es retirada o no admite inserción, se debe obtener su enlace de Compartir / Insertar imagen.
places.json conserva el identificador, coordenadas y orientación original. Pitch de cámara se calcula como 90 menos el valor t del enlace; el formato pb usa el signo contrario.
Random recorre una bolsa mezclada antes de volver a sortear destinos; evita repetir inmediatamente el actual.
Se puede compartir la dirección ?lugar=id.

## Publicación
Settings → Pages → Deploy from a branch → main → /(root).
Sitio: https://geoleti.github.io/maravillasdeargentina/
Sin compilación ni dependencias.
