# Estadísticas de Maravillas de Argentina
1. Abrir el proyecto de Supabase configurado en analytics-config.js.
2. En SQL Editor, ejecutar supabase/maravillas-analytics.sql. No modifica GeoData.
3. Visitar el recorrido y consultar estadisticas.html.

La clave incluida es publicable, nunca service_role. El SQL bloquea el acceso directo a la tabla y expone solo registro y agregados por funciones. El tablero es público.
No hay datos previos al inicio del registro. Los lugares mostrados cuentan selecciones del recorrido, no imágenes confirmadas: un iframe de otro dominio no permite comprobar que Google dibujó la panorámica.
Los visitantes son navegadores pseudónimos; borrar almacenamiento genera un visitante nuevo. Sesión: 30 minutos sin eventos. No se registra el tablero, desarrollo local, Do Not Track ni Global Privacy Control.
No se envían URLs completas de referencia, nombres, correos ni direcciones IP como campos de eventos. El proveedor de infraestructura puede procesar IP en sus registros operativos.
Como todo contador público sin autenticación, no garantiza excluir bots ni eventos artificiales.
La tabla de ranking conserva cada panorámica como destino independiente, incluso si comparte el nombre con otra.
