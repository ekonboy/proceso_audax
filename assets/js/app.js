const form = document.querySelector('#search-form');
const input = document.querySelector('#search-term');
const message = document.querySelector('#form-message');
const results = document.querySelector('#results');
const resultsCount = document.querySelector('#results-count');
const historyList = document.querySelector('#history-list');
const refreshHistoryButton = document.querySelector('#refresh-history');
const clearHistoryButton = document.querySelector('#clear-history');
const resultLimit = document.querySelector('#result-limit');
const exactSearch = document.querySelector('#exact-search');
const healthStatus = document.querySelector('#health-status');
const backToTopButton = document.querySelector('#back-to-top');
const technicalMenuButton = document.querySelector('#technical-menu-button');
const technicalMenuClose = document.querySelector('#technical-menu-close');
const technicalDrawer = document.querySelector('#technical-drawer');
const technicalDrawerContent = document.querySelector('#technical-drawer-content');
const drawerOverlay = document.querySelector('#drawer-overlay');

// Se usa la Wikipedia en español para mantener coherencia con la interfaz.
const WIKIPEDIA_API = 'https://es.wikipedia.org/w/api.php';
const STORAGE_KEYS = {
  lastSearch: 'audax:last-search',
  resultLimit: 'audax:result-limit',
  exactSearch: 'audax:exact-search',
};

// Evento submit: captura el formulario, evita la recarga y lanza búsqueda + guardado.
form.addEventListener('submit', async (event) => {
  // Evita que el formulario recargue la página; la experiencia queda en una sola vista.
  event.preventDefault();

  const term = input.value.trim();
  const limit = Number(resultLimit.value);
  const isExactSearch = exactSearch.checked;

  if (term.length < 2) {
    showMessage('Introduce al menos dos caracteres.', true);
    return;
  }

  localStorage.setItem(STORAGE_KEYS.lastSearch, term);
  localStorage.setItem(STORAGE_KEYS.resultLimit, String(limit));
  localStorage.setItem(STORAGE_KEYS.exactSearch, String(isExactSearch));

  setLoading(true);
  showMessage(isExactSearch ? 'Buscando coincidencia exacta en Wikipedia...' : 'Buscando en Wikipedia...');
  renderLoadingResults(limit);

  try {
    // Lanzamos en paralelo la búsqueda externa y el guardado local para que la UI responda antes.
    const [searchData] = await Promise.all([
      searchWikipedia(term, limit, isExactSearch),
      saveSearch(term),
    ]);

    const wikipediaResults = normalizeWikipediaPages(searchData.query?.pages ?? {});
    const visibleResults = isExactSearch ? filterExactResults(wikipediaResults, term) : wikipediaResults;

    renderResults(visibleResults);
    showMessage(isExactSearch
      ? `Búsqueda exacta completada para "${term}".`
      : `Búsqueda completada para "${term}".`);
    await loadHistory();
    await checkHealth();
  } catch (error) {
    showMessage(error.message || 'No se pudo completar la búsqueda.', true);
  } finally {
    setLoading(false);
  }
});

// Eventos click/change: recargan historial, limpian datos y guardan preferencias de búsqueda.
refreshHistoryButton.addEventListener('click', loadHistory);
clearHistoryButton.addEventListener('click', confirmClearHistory);
resultLimit.addEventListener('change', () => {
  localStorage.setItem(STORAGE_KEYS.resultLimit, resultLimit.value);
  updateBackToTopVisibility();
});
exactSearch.addEventListener('change', () => {
  localStorage.setItem(STORAGE_KEYS.exactSearch, String(exactSearch.checked));
});
backToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
historyList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-history-term]');

  if (!button) {
    return;
  }

  input.value = button.dataset.historyTerm;
  form.requestSubmit();
});
technicalMenuButton.addEventListener('click', openTechnicalDrawer);
technicalMenuClose.addEventListener('click', closeTechnicalDrawer);
drawerOverlay.addEventListener('click', closeTechnicalDrawer);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && technicalDrawer.classList.contains('open')) {
    closeTechnicalDrawer();
  }
});

// Construye la URL de la API con URLSearchParams para codificar acentos y espacios correctamente.
async function searchWikipedia(term, limit, isExactSearch) {
  // Wikipedia usa sintaxis de búsqueda; entrecomillar fuerza coincidencia de frase exacta.
  const searchTerm = isExactSearch ? `"${term.replaceAll('"', '')}"` : term;
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: searchTerm,
    gsrlimit: String(limit),
    prop: 'pageimages|extracts',
    exintro: '1',
    explaintext: '1',
    exsentences: '2',
    piprop: 'thumbnail',
    pithumbsize: '420',
    format: 'json',
    origin: '*',
    utf8: '1',
  });

  const response = await fetch(`${WIKIPEDIA_API}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Wikipedia no respondió correctamente.');
  }

  return response.json();
}

// Guarda el término en nuestro backend PHP, que es quien accede a SQLite.
async function saveSearch(term) {
  const response = await fetch('api/save_search.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ term }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'No se pudo guardar el historial.');
  }

  return data;
}

// Borra todo el historial después de confirmar la acción con SweetAlert.
async function clearHistory() {
  const response = await fetch('api/clear_history.php', {
    method: 'DELETE',
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'No se pudo limpiar el historial.');
  }

  return data;
}

// Carga el historial desde PHP para no exponer detalles de la base de datos al navegador.
async function loadHistory() {
  try {
    const response = await fetch('api/history.php');
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'No se pudo cargar el historial.');
    }

    renderHistory(data.items);
  } catch (error) {
    historyList.innerHTML = `<li><span class="history-term">${escapeHtml(error.message)}</span></li>`;
  }
}

// Endpoint técnico de salud: comprueba que PHP, PDO y SQLite están operativos.
async function checkHealth() {
  try {
    const response = await fetch('api/health.php');
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Sistema no disponible.');
    }

    healthStatus.className = 'health-status ok';
    healthStatus.textContent = `Sistema OK · ${data.total_searches} búsquedas guardadas`;
  } catch (error) {
    healthStatus.className = 'health-status error';
    healthStatus.textContent = error.message || 'Sistema no disponible.';
  }
}

async function openTechnicalDrawer() {
  technicalDrawer.classList.add('open');
  technicalDrawer.setAttribute('aria-hidden', 'false');
  technicalMenuButton.setAttribute('aria-expanded', 'true');
  drawerOverlay.hidden = false;
  document.body.classList.add('drawer-open');

  if (technicalDrawerContent.dataset.loaded === 'true') {
    technicalMenuClose.focus();
    return;
  }

  try {
    const response = await fetch('views/technical-panel.php');

    if (!response.ok) {
      throw new Error('No se pudo cargar la explicación técnica.');
    }

    technicalDrawerContent.innerHTML = await response.text();
    technicalDrawerContent.dataset.loaded = 'true';
  } catch (error) {
    technicalDrawerContent.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  } finally {
    technicalMenuClose.focus();
  }
}

function closeTechnicalDrawer() {
  technicalDrawer.classList.remove('open');
  technicalDrawer.setAttribute('aria-hidden', 'true');
  technicalMenuButton.setAttribute('aria-expanded', 'false');
  drawerOverlay.hidden = true;
  document.body.classList.remove('drawer-open');
  technicalMenuButton.focus();
}

async function confirmClearHistory() {
  const confirmed = await showConfirmDialog({
    title: '¿Limpiar historial?',
    text: 'Se eliminarán todas las búsquedas guardadas en SQLite.',
    confirmButtonText: 'Sí, limpiar',
  });

  if (!confirmed) {
    return;
  }

  try {
    await clearHistory();
    input.value = '';
    localStorage.removeItem(STORAGE_KEYS.lastSearch);
    clearResults();
    renderHistory([]);
    await checkHealth();
    showMessage('Historial limpiado correctamente.');
    await showSuccessDialog('Historial limpio', 'Las búsquedas guardadas se han eliminado.');
  } catch (error) {
    showMessage(error.message || 'No se pudo limpiar el historial.', true);
  }
}

// El renderizado se concentra aquí para mantener separada la llamada a la API de la vista.
function renderResults(items) {
  resultsCount.textContent = items.length.toString();

  if (items.length === 0) {
    results.className = 'results empty-state';
    results.innerHTML = '<p>No se encontraron resultados para esta búsqueda.</p>';
    return;
  }

  results.className = 'results';
  const featured = renderFeaturedResult(items[0]);
  const list = items.map((item, index) => {
    const url = `https://es.wikipedia.org/?curid=${encodeURIComponent(item.pageid)}`;
    return `
      <article class="result-item animated-item" style="animation-delay: ${index * 45}ms">
        ${renderResultThumbnail(item)}
        <div>
          <h3><a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h3>
          <p>${escapeHtml(item.extract || 'Sin resumen disponible.')}</p>
        </div>
      </article>
    `;
  }).join('');

  results.innerHTML = `
    <div class="results-layout">
      <div class="results-list">${list}</div>
      ${featured}
    </div>
  `;
}

// El historial viene de SQLite y se imprime escapando valores antes de insertarlos en HTML.
function renderHistory(items) {
  if (!items.length) {
    historyList.innerHTML = '<li><span class="history-term">Todavía no hay búsquedas guardadas.</span></li>';
    return;
  }

  historyList.innerHTML = items.map((item, index) => `
    <li class="animated-item" style="animation-delay: ${index * 35}ms">
      <button class="history-term history-button" type="button" data-history-term="${escapeHtml(item.term)}">
        ${escapeHtml(item.term)}
      </button>
      <time class="history-date" datetime="${escapeHtml(item.created_at)}">${formatDate(item.created_at)}</time>
    </li>
  `).join('');
}

function renderLoadingResults(limit) {
  resultsCount.textContent = '...';
  results.className = 'results';
  results.innerHTML = Array.from({ length: Math.min(limit, 6) }, (_, index) => `
    <article class="result-item skeleton-item" style="animation-delay: ${index * 60}ms">
      <span></span>
      <p></p>
      <p></p>
    </article>
  `).join('');
}

function clearResults() {
  resultsCount.textContent = '0';
  results.className = 'results empty-state';
  results.innerHTML = '<p>Los resultados aparecerán aquí después de realizar una búsqueda.</p>';
}

function normalizeWikipediaPages(pages) {
  return Object.values(pages)
    .sort((firstPage, secondPage) => (firstPage.index ?? 0) - (secondPage.index ?? 0))
    .map((page) => ({
      pageid: page.pageid,
      title: page.title ?? '',
      extract: page.extract ?? '',
      thumbnail: page.thumbnail?.source ?? '',
    }));
}

function renderFeaturedResult(item) {
  if (!item?.thumbnail) {
    return '';
  }

  const url = `https://es.wikipedia.org/?curid=${encodeURIComponent(item.pageid)}`;

  return `
    <aside class="featured-result animated-item" style="animation-delay: 80ms" aria-label="Imagen del primer resultado">
      <p class="featured-label">Primer resultado</p>
      <a href="${url}" target="_blank" rel="noopener noreferrer">
        <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" loading="lazy">
      </a>
      <h3>${escapeHtml(item.title)}</h3>
    </aside>
  `;
}

function renderResultThumbnail(item) {
  if (!item.thumbnail) {
    return '<div class="result-thumb placeholder" aria-hidden="true">W</div>';
  }

  return `
    <img
      class="result-thumb"
      src="${escapeHtml(item.thumbnail)}"
      alt="${escapeHtml(item.title)}"
      loading="lazy"
    >
  `;
}

function filterExactResults(items, term) {
  const needle = term.toLocaleLowerCase('es-ES');

  return items.filter((item) => {
    const title = String(item.title ?? '').toLocaleLowerCase('es-ES');
    const extract = String(item.extract ?? '').toLocaleLowerCase('es-ES');

    return title.includes(needle) || extract.includes(needle);
  });
}

// Bloquea el botón durante la petición para evitar envíos duplicados.
function setLoading(isLoading) {
  const button = form.querySelector('button');
  button.disabled = isLoading;
  button.textContent = isLoading ? 'Buscando...' : 'Buscar';
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
}

async function showConfirmDialog(options) {
  if (!window.Swal) {
    return window.confirm(options.title);
  }

  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText,
    cancelButtonText: 'Cancelar',
    background: '#141c2b',
    color: '#f3f6fb',
    confirmButtonColor: '#d0ff71',
    cancelButtonColor: '#6f1cba',
  });

  return result.isConfirmed;
}

async function showSuccessDialog(title, text) {
  if (!window.Swal) {
    return;
  }

  await Swal.fire({
    title,
    text,
    icon: 'success',
    timer: 1600,
    showConfirmButton: false,
    background: '#141c2b',
    color: '#f3f6fb',
  });
}

// Wikipedia devuelve fragmentos con HTML de resaltado; lo eliminamos para evitar HTML no controlado.
function sanitizeSnippet(snippet) {
  return escapeHtml(String(snippet).replace(/<[^>]*>/g, ''));
}

// Escapado básico contra XSS cuando insertamos contenido dinámico con innerHTML.
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Convierte la fecha SQL a un formato familiar para usuarios españoles.
function formatDate(value) {
  const date = parseSqliteDate(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const time = new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  if (diffInSeconds < 45) {
    return 'Ahora mismo';
  }

  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }

  if (isSameDay(date, now)) {
    return `Hoy a las ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, yesterday)) {
    return `Ayer a las ${time}`;
  }

  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function isSameDay(firstDate, secondDate) {
  return firstDate.getFullYear() === secondDate.getFullYear()
    && firstDate.getMonth() === secondDate.getMonth()
    && firstDate.getDate() === secondDate.getDate();
}

function parseSqliteDate(value) {
  // SQLite CURRENT_TIMESTAMP se guarda en UTC; añadimos Z para que JS lo interprete bien.
  return new Date(`${String(value).replace(' ', 'T')}Z`);
}

function restorePreferences() {
  const savedLimit = localStorage.getItem(STORAGE_KEYS.resultLimit);
  const savedTerm = localStorage.getItem(STORAGE_KEYS.lastSearch);
  const savedExactSearch = localStorage.getItem(STORAGE_KEYS.exactSearch);

  if (savedLimit && [...resultLimit.options].some((option) => option.value === savedLimit)) {
    resultLimit.value = savedLimit;
  }

  if (savedExactSearch !== null) {
    exactSearch.checked = savedExactSearch === 'true';
  }

  if (savedTerm) {
    input.value = savedTerm;
    showMessage(`Última búsqueda recuperada: "${savedTerm}".`);
  }

  updateBackToTopVisibility();
}

function updateBackToTopVisibility() {
  backToTopButton.hidden = Number(resultLimit.value) <= 20;
}

// Carga inicial de preferencias, historial y estado técnico al abrir la aplicación.
restorePreferences();
loadHistory();
checkHealth();
