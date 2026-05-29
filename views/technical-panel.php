<?php
declare(strict_types=1);

header('Content-Type: text/html; charset=utf-8');
?>
<section class="drawer-author">
  <img src="assets/logo/gabii_rese_web_v3.png" alt="Foto de Gabii Rese">
  <div>
    <p class="drawer-kicker">Autor</p>
    <h3>Gabii Rese</h3>
    <p>
      Desarrollador web con experiencia creando soluciones prácticas con PHP,
      JavaScript, APIs e interfaces cuidadas.
    </p>
    <div class="author-links">
      <a href="https://vistarapida.es" target="_blank" rel="noopener noreferrer">vistarapida.es</a>
      <a href="https://github.com/ekonboy" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="https://www.linkedin.com/in/gabiirese/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
    </div>
  </div>
</section>

<section class="drawer-block">
  <p class="drawer-kicker">Arquitectura</p>
  <h3>Separación de responsabilidades</h3>
  <p>
    La aplicación no fuerza un MVC completo porque sería sobredimensionar una prueba pequeña.
    Se organiza de forma modular: HTML y CSS para la vista, JavaScript para la interacción,
    PHP como API interna y SQLite como persistencia.
  </p>
  <div class="flow">
    <span>Usuario</span>
    <span>JavaScript</span>
    <span>Wikipedia API</span>
    <span>PHP API</span>
    <span>SQLite</span>
  </div>
</section>

<section class="drawer-block">
  <p class="drawer-kicker">Wikipedia API</p>
  <h3>Contenido externo enriquecido</h3>
  <p>
    JavaScript llama a Wikipedia con <code>fetch</code> y <code>URLSearchParams</code>.
    Se usa <code>generator=search</code> para buscar páginas y <code>pageimages|extracts</code>
    para traer miniaturas y resúmenes limpios en una sola respuesta.
  </p>
  <ul>
    <li><code>gsrsearch</code>: término buscado.</li>
    <li><code>gsrlimit</code>: número de resultados.</li>
    <li><code>pageimages</code>: miniaturas.</li>
    <li><code>extracts</code>: resumen de la página.</li>
    <li><code>origin=*</code>: compatibilidad CORS.</li>
  </ul>
</section>

<section class="drawer-block">
  <p class="drawer-kicker">API interna PHP</p>
  <h3>Endpoints propios</h3>
  <p>
    PHP se usa como backend ligero para controlar la base de datos y exponer respuestas JSON.
  </p>
  <ul>
    <li><code>save_search.php</code>: guarda búsquedas.</li>
    <li><code>history.php</code>: devuelve el historial.</li>
    <li><code>clear_history.php</code>: limpia el historial.</li>
    <li><code>health.php</code>: comprueba PHP, PDO y SQLite.</li>
    <li><code>db.php</code>: centraliza conexión y respuestas JSON.</li>
  </ul>
</section>

<section class="drawer-block">
  <p class="drawer-kicker">Seguridad</p>
  <h3>PDO, SQLite y validación</h3>
  <p>
    SQLite encaja porque no requiere servidor adicional. PDO se usa para trabajar con la base
    de datos mediante consultas preparadas, evitando que el texto del usuario altere el SQL.
  </p>
  <ul>
    <li>Consultas preparadas contra SQL injection.</li>
    <li>Validación del método HTTP y del término buscado.</li>
    <li>JSON UTF-8 para conservar acentos.</li>
    <li>Escapado de HTML dinámico para reducir riesgo de XSS.</li>
  </ul>
</section>

<section class="drawer-block">
  <p class="drawer-kicker">UX</p>
  <h3>Detalles que aportan valor</h3>
  <p>
    La aplicación añade mejoras pequeñas pero útiles: historial clicable, búsqueda exacta,
    miniaturas con hover, imagen destacada, skeleton loading, SweetAlert y botón de subida.
  </p>
</section>

<section class="drawer-block">
  <p class="drawer-kicker">Metodología</p>
  <h3>KISS, DRY y YAGNI</h3>
  <p>
    Se mantiene una solución sencilla y directa. La conexión y la respuesta JSON se reutilizan
    desde un punto común. YAGNI se aplica con criterio: algunos extras se incluyen porque ayudan
    a demostrar experiencia en una prueba técnica.
  </p>
</section>
