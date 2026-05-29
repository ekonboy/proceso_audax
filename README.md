<p align="center">
  <img src="assets/logo/logo5.png" alt="Logo del proyecto" width="110">
</p>

<h1 align="center">Buscador de Wikipedia</h1>

<p align="center">
  Aplicación web en <strong>HTML5</strong>, <strong>CSS3</strong>, <strong>JavaScript</strong>, <strong>PHP</strong> y <strong>SQLite</strong> para buscar términos en Wikipedia y guardar el historial localmente.
</p>

<p align="center">
  <strong>Demo:</strong> <a href="https://vistarapida.es/proceso_audax">vistarapida.es/proceso_audax</a>
  ·
  <strong>Autor:</strong> <a href="https://vistarapida.es">Gabii Rese</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111111" alt="JavaScript">
  <img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP">
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/API-Wikipedia-d0ff71?style=flat-square&labelColor=141c2b" alt="API Wikipedia">
  <img src="https://img.shields.io/badge/UI-Modo%20oscuro-6f1cba?style=flat-square&labelColor=141c2b" alt="Modo oscuro">
  <img src="https://img.shields.io/badge/Seguridad-Consultas%20preparadas-d0ff71?style=flat-square&labelColor=141c2b" alt="Consultas preparadas">
  <img src="https://img.shields.io/badge/UX-SweetAlert-6f1cba?style=flat-square&labelColor=141c2b" alt="SweetAlert">
</p>

## ✨ Descripción

Este proyecto permite introducir un término, consultar la API pública de Wikipedia en español y mostrar los resultados en la misma pantalla. Además, cada búsqueda se guarda en una base de datos SQLite mediante PHP y consultas preparadas con PDO.

La aplicación está pensada como una prueba técnica pequeña, pero con detalles de producto: modo oscuro, fuentes personalizadas, favicon, logo, estados de carga, historial persistente, endpoint de salud y confirmaciones visuales.

## 🚀 Funcionalidades

| Área | Detalle |
| --- | --- |
| 🔎 Búsqueda | Consulta términos contra la API pública de Wikipedia. |
| 🎯 Búsqueda exacta | Switch opcional para buscar frases exactas y reducir resultados colaterales. |
| 📄 Resultados | Muestra título, resumen, enlace externo y miniatura cuando Wikipedia la proporciona. |
| 🖼️ Resultado destacado | El primer resultado muestra una imagen ampliada en un lateral. |
| ☰ Panel técnico | Menú hamburguesa que carga desde PHP una explicación de arquitectura, API y seguridad. |
| 👤 Autor | Footer y bloque de autor con enlaces a portfolio, GitHub y LinkedIn. |
| 🎛️ Límite configurable | Permite elegir 10, 20 o 50 resultados. |
| 🕘 Historial clicable | Guarda búsquedas en SQLite y permite repetir una búsqueda con un clic. |
| 🧹 Limpieza segura | Limpia historial, resultados y última búsqueda tras confirmar con SweetAlert. |
| ⬆️ Botón Subir | Aparece automáticamente al seleccionar más de 20 resultados. |
| 💾 Persistencia de preferencias | Recuerda la última búsqueda, el límite elegido y la búsqueda exacta con `localStorage`. |
| 🩺 Health check | Incluye `api/health.php` para comprobar PHP, PDO y SQLite. |
| 🌙 Interfaz | Modo oscuro, logo, favicon, fuentes propias y microanimaciones. |
| 🔐 Seguridad | Validación en backend, consultas preparadas y escapado de HTML dinámico. |

## 🧱 Tecnologías

- **HTML5** para la estructura semántica.
- **CSS3** para el diseño responsive, modo oscuro y animaciones.
- **JavaScript vanilla** para eventos, llamadas `fetch`, renderizado y `localStorage`.
- **PHP** para endpoints de API y conexión a base de datos.
- **SQLite** como base de datos SQL ligera basada en archivo.
- **PDO** para conexión segura y consultas preparadas.
- **SweetAlert2** para confirmaciones visuales.
- **Wikipedia API** como fuente externa de resultados.

## 👤 Autor

Proyecto realizado por **Gabii Rese**.

- Portfolio: [vistarapida.es](https://vistarapida.es)
- Demo online: [vistarapida.es/proceso_audax](https://vistarapida.es/proceso_audax)
- GitHub: [github.com/ekonboy](https://github.com/ekonboy)
- LinkedIn: [linkedin.com/in/gabiirese](https://www.linkedin.com/in/gabiirese/)

## 🧠 Criterio de desarrollo

El proyecto aplica principios habituales de desarrollo pragmático:

- **KISS**: se mantiene una arquitectura sencilla, sin framework ni capas innecesarias para el tamaño de la prueba.
- **DRY**: la conexión a base de datos y la respuesta JSON están centralizadas en `api/db.php`.
- **YAGNI**: se evita añadir complejidad que no aporta valor inmediato. En una prueba técnica no se aplica al 100%, porque algunas mejoras extra sirven para demostrar criterio y experiencia.

## 📦 Requisitos

- PHP 8 o superior.
- Extensión `pdo_sqlite` habilitada.
- Extensión `sqlite3` recomendada.
- Servidor local como XAMPP, Apache, Laragon o el servidor integrado de PHP.
- Conexión a internet para consultar Wikipedia y cargar SweetAlert2 desde CDN.

El repositorio incluye una base SQLite vacía en `data/search_history.sqlite`, ya preparada con la tabla `searches`. La aplicación también puede crearla automáticamente si no existe.

## ⚙️ Instalación

Coloca el proyecto dentro del directorio público del servidor. En XAMPP, por ejemplo:

```text
M:\xampp\htdocs\proceso_audax
```

Después abre:

```text
http://localhost/proceso_audax/
```

También puedes usar el servidor integrado de PHP desde la carpeta del proyecto:

```bash
php -S localhost:8000
```

Y abrir:

```text
http://localhost:8000/
```

## 🧭 Funcionamiento

1. El usuario introduce un término de búsqueda.
2. JavaScript valida el formulario y llama a Wikipedia.
3. En paralelo, JavaScript envía el término a PHP.
4. PHP valida el dato y lo guarda en SQLite usando una consulta preparada.
5. La interfaz renderiza los resultados y actualiza el historial.
6. El usuario puede activar búsqueda exacta, cambiar el número de resultados, limpiar el estado completo o reutilizar la última búsqueda guardada en el navegador.
7. Si selecciona más de 20 resultados, aparece un botón fijo para volver arriba con un clic.
8. Cada resultado puede mostrar una miniatura y el primer resultado se destaca visualmente en un panel lateral.
9. El menú hamburguesa abre un drawer técnico cargado desde `views/technical-panel.php`.

## 🧩 Eventos JavaScript

Los eventos pedidos en la aplicación están en `assets/js/app.js`:

| Evento | Elemento | Qué hace |
| --- | --- | --- |
| `submit` | `#search-form` | Captura el término, evita recargar la página, llama a Wikipedia y guarda la búsqueda. |
| `click` | `#refresh-history` | Recarga el historial desde PHP. |
| `click` | `#clear-history` | Muestra SweetAlert y limpia el historial si el usuario confirma. |
| `click` | `[data-history-term]` | Repite una búsqueda guardada desde el historial. |
| `change` | `#result-limit` | Guarda en `localStorage` el número de resultados elegido. |
| `change` | `#exact-search` | Activa o desactiva la búsqueda exacta y guarda la preferencia. |
| `click` | `#back-to-top` | Sube al inicio de la página con scroll suave. |
| `click` | `#technical-menu-button` | Abre el panel técnico y carga su contenido desde PHP. |
| `click` | `#technical-menu-close` | Cierra el panel técnico. |
| `keydown` | `document` | Cierra el panel técnico con la tecla Escape. |

La búsqueda exacta no corrige un error de la API: cambia la sintaxis enviada a Wikipedia y filtra los resultados visibles. En modo normal se envía el texto tal cual; en modo exacto se envía entre comillas, por ejemplo `"Messi"`, y después se muestran solo resultados cuyo título o resumen contienen literalmente el término buscado.

Al limpiar el historial se resetea también la pantalla de resultados, el campo de búsqueda y la última búsqueda guardada en `localStorage`, para que la acción sea coherente con un reinicio del estado visible.

El historial clicable es una mejora de UX: evita volver a escribir búsquedas recientes y convierte el historial en una herramienta útil, no solo en una lista informativa.

## 🔌 Endpoints PHP

| Endpoint | Método | Función |
| --- | --- | --- |
| `api/save_search.php` | `POST` | Guarda una búsqueda en SQLite. |
| `api/history.php` | `GET` | Devuelve las últimas búsquedas guardadas. |
| `api/clear_history.php` | `DELETE` | Limpia todo el historial. |
| `api/health.php` | `GET` | Comprueba que PHP, PDO y SQLite funcionan. |

Ejemplo de respuesta de `api/health.php`:

```json
{
  "success": true,
  "status": "ok",
  "database": "sqlite",
  "pdo_sqlite": true,
  "total_searches": 3,
  "checked_at": "2026-05-29T10:20:04+00:00"
}
```

## 🔐 Seguridad

El proyecto incluye varias medidas básicas:

- Consultas preparadas con PDO para evitar SQL injection.
- Validación del método HTTP en cada endpoint.
- Validación del término de búsqueda en backend.
- Respuestas JSON con `charset=utf-8`.
- Errores internos no expuestos al usuario.
- Escapado de contenido dinámico antes de insertarlo en HTML.
- Limpieza de fragmentos HTML recibidos desde Wikipedia.

## 🎨 Interfaz

La interfaz utiliza los assets propios del proyecto:

- Logo en `assets/logo/`.
- Favicon en `assets/favicon/`.
- Fuentes personalizadas en `assets/fonts/`.
- Paleta oscura basada en lima y morado.
- Microanimaciones para resultados e historial.
- Skeleton loading durante la búsqueda.
- Miniaturas con hover en los resultados.
- Imagen ampliada del primer resultado en un lateral.
- Botón flotante de subida para listas largas.
- Drawer técnico lateral a media pantalla en desktop.
- Bloque de autor con foto real y enlaces profesionales.

## 📁 Estructura

```text
.
├── api/
│   ├── clear_history.php
│   ├── db.php
│   ├── health.php
│   ├── history.php
│   └── save_search.php
├── assets/
│   ├── css/
│   │   ├── original.css
│   │   └── styles.css
│   ├── favicon/
│   ├── fonts/
│   ├── js/
│   │   └── app.js
│   └── logo/
├── data/
│   └── search_history.sqlite
├── views/
│   └── technical-panel.php
├── GUIA_ESTUDIO.md
├── index.html
└── README.md
```

La carpeta `data` incluye una base SQLite vacía y lista para funcionar. Los archivos temporales de SQLite, como `*.sqlite-wal` o `*.sqlite-shm`, siguen ignorados.

## 🧪 Comprobaciones rápidas

Validar sintaxis PHP:

```bash
php -l api/db.php
php -l api/save_search.php
php -l api/history.php
php -l api/clear_history.php
php -l api/health.php
```

Probar el endpoint de salud:

```text
http://localhost/proceso_audax/api/health.php
```

## 📚 Nota de estudio

El archivo `GUIA_ESTUDIO.md` explica el porqué técnico de las decisiones principales: PDO, SQLite, consultas preparadas, prevención de SQL injection, validación en backend, JSON, XSS, `localStorage`, endpoint de salud y mejoras de experiencia.
