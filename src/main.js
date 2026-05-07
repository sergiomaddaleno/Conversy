import { loadImageToPdfTool } from './modules/image_to_pdf.js';
import { loadPdfToImagesTool } from './modules/pdf_to_image.js';
import { loadJpgToPngTool } from './modules/jpg_to_png.js';
import { loadPNGToJpgTool } from './modules/png_to_jpg.js';

import { setLanguage, t } from './language/lang_manager.js';
import { spanish } from './language/spanish.js';
import { english } from './language/english.js';
import { french } from './language/french.js';

window.addEventListener('DOMContentLoaded', () => {

  const app = document.getElementById('app');
  const menu = document.getElementById('menu');

  const tools = [
    { key: 'image_to_pdf_title', load: loadImageToPdfTool },
    { key: 'pdf_to_images_title', load: loadPdfToImagesTool },
    { key: 'jpg_to_png_title', load: loadJpgToPngTool },
    { key: 'png_to_jpg_title', load: loadPNGToJpgTool }
  ];

  // LANGUAGE INIT
  // =========================
  const savedLang = localStorage.getItem('lang') || 'es';

  setLanguage(savedLang === 'en' ? english : savedLang === 'fr' ? french : spanish);

  // STATE
  // =========================
  let currentTool = Number(localStorage.getItem('tool')) || 0;

  function clearApp() {
    app.innerHTML = '';
  }

  function applyTranslations() {

    const subtitle = document.getElementById('subtitle');
    if (subtitle) subtitle.textContent = t('subtitle');

  }

  function updateLangUI() {

    const current = localStorage.getItem('lang') || 'es';

    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === current);
    });

  }

  function renderApp() {

  menu.innerHTML = '';
  clearApp();

  const activeToolLabel = document.getElementById('activeTool');

  tools.forEach((tool, index) => {

    const button = document.createElement('button');
    button.className = 'menu-button';

    button.textContent = t(tool.key);

    if (index === currentTool) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      currentTool = index;

      localStorage.setItem('tool', currentTool);

      renderApp();
    });

    menu.appendChild(button);
  });

  tools[currentTool].load(app);

  applyTranslations();
}

  // LANGUAGE SWITCH
  // =========================
  document.querySelectorAll('[data-lang]').forEach(btn => {

    btn.addEventListener('click', () => {

      const value = btn.dataset.lang;

      localStorage.setItem('lang', value);

      setLanguage(value === 'en' ? english : value === 'fr' ? french : spanish);

      renderApp();
      updateLangUI();
    });

  });

  // COOKIES
  // =========================
  if (!localStorage.getItem('cookiesAccepted')) {

    cookieBanner.style.display = 'block';

  } else {

    cookieBanner.style.display = 'none';
  }

  acceptCookies.addEventListener('click', () => {

    localStorage.setItem(
      'cookiesAccepted',
      'true'
    );

    cookieBanner.style.display = 'none';
  });

  // INIT
  // =========================
  updateLangUI();
  renderApp();

});