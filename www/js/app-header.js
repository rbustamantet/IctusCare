/* ==========================================================
   Ictus GPS - Cabecera y Pie Unificados (v3.0)
   Inserta header y footer institucional con:
   - Icono automático según nombre del archivo
   - Rutas relativas dinámicas según profundidad
   - Acción "Atrás" funcional
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Evitar duplicaciones
  if (document.querySelector('.appbar')) return;

  /* ===== 1️⃣ Calcular profundidad de ruta ===== */
  const depth = window.location.pathname.split('/').length - 2; // carpetas intermedias
  const prefix = '../'.repeat(depth > 0 ? depth : 1); // ej: ../, ../../, etc.

  /* ===== 2️⃣ Detectar archivo actual ===== */
  const file = window.location.pathname.split('/').pop().toLowerCase();
  const name = file.replace('.html', '').trim();

  /* ===== 3️⃣ Determinar icono de forma automática ===== */
  const guessIcon = (baseName) => {
    const basePath = `${prefix}iconos/`;
    const patterns = [
      `${basePath}${baseName}ico.png`,
      `${basePath}${baseName}.png`,
      `${basePath}${baseName}_ico.png`
    ];
    for (const path of patterns) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', path, false);
        xhr.send();
        if (xhr.status >= 200 && xhr.status < 400) return path;
      } catch { /* ignorar errores locales */ }
    }
    return `${basePath}ictusgps.png`; // fallback genérico
  };

  const iconSrc = guessIcon(name);

  /* ===== 4️⃣ Insertar cabecera ===== */
  const headerHTML = `
  <header class="appbar" role="region" aria-label="Cabecera institucional">
    <div class="appbar-inner">
      <div class="appbar-bar">
        <button id="backIcon" class="icon-btn" aria-label="Atrás" title="Atrás">
          <img class="icon-unit" src="${iconSrc}" alt="Icono sección">
          <svg class="icon-arrow" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 18l-6-6 6-6"
                  fill="none" stroke="#0F3D83"
                  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div class="left-group">
          <h1 class="page-title"></h1>
        </div>

        <div class="actions">
          <a class="btn" href="${prefix}index.html">Inicio</a>
        </div>
      </div>
    </div>
  </header>`;

  /* ===== 5️⃣ Insertar pie ===== */
  const footerHTML = `
  <footer>
    <img src="${prefix}imagenes/footer_unidad.png" alt="Unidad de Ictus Málaga">
  </footer>`;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);

  /* ===== 6️⃣ Título dinámico ===== */
  const titleEl = document.querySelector('.page-title');
  if (titleEl) titleEl.textContent = document.title || 'Ictus GPS';

  /* ===== 7️⃣ Acción del botón Atrás ===== */
  const backBtn = document.getElementById('backIcon');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      console.log('[IctusGPS] Atrás pulsado → historial:', window.history.length);
      if (window.history.length > 1) history.back();
      else window.location.href = `${prefix}index.html`;
    });
  }

});
