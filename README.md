# Maravillas de Argentina

Sitio estático en castellano, pensado para GitHub Pages. Inspirado en la navegación aleatoria de Wonders of Street View, con identidad propia.

## Publicar
En **Settings → Pages**, seleccionar **Deploy from a branch**, rama **main**, carpeta **/(root)** y guardar.
La dirección prevista es https://geoleti.github.io/maravillasdeargentina/ . No está activa hasta habilitar Pages.

## Estado del catálogo
Los 16 lugares iniciales son **candidatos**, con coordenadas aproximadas y enlaces oficiales de Maps URLs. No se ha verificado la existencia ni el encuadre de una foto 360 en cada coordenada. Google puede mostrar una panorámica próxima o indicar que no hay cobertura. El fondo inicial es una ilustración, no una fotografía del destino.

Para una experiencia como Neal.fun, hay que seleccionar panorámicas concretas. El sitio ya admite sus enlaces de inserción; no inventa identificadores de fotos.

## Agregar una panorámica sin API
1. Abrir el lugar en Google Maps y seleccionar la foto 360 deseada.
2. Usar **Compartir o insertar imagen → Insertar imagen**, si Google ofrece esa opción.
3. Copiar solamente la URL del atributo src del iframe.
4. En places.json, ponerla en embedUrl y, tras comprobarla, cambiar verified360 a true.
Si Google no ofrece inserción para esa imagen, mantener el enlace externo o usar Maps Embed con una clave.

## Alternativa: Maps Embed
Completar googleMapsEmbedKey en config.js con una clave pública de Maps Embed API.
Restringir la clave al dominio https://geoleti.github.io/* y a Maps Embed API.
La API usa location o panoId; una coordenada no garantiza un encuadre exacto.
Documentación: https://developers.google.com/maps/documentation/embed/embedding-map
URLs: https://developers.google.com/maps/documentation/urls/get-started

## Editar destinos
Cada entrada de places.json incluye id único, name, province, region, lat, lng, description, embedUrl, panoId y verified360.
No modificar id una vez compartido. Los enlaces del sitio usan ?lugar=id.
Se pueden sumar lugares simplemente agregando entradas.
El sitio no guarda favoritos ni incluye filtros o buscadores.
Google recibe conexiones al abrir sus enlaces o cargar un visor integrado.

## Desarrollo
Sin dependencias, claves obligatorias ni proceso de compilación.
Servir por HTTP, por ejemplo con python -m http.server 8000.
Funciones: botón Random, destino inicial aleatorio, azar sin repetición inmediata, enlaces directos por lugar, pantalla completa y diseño móvil.

