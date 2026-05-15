import { loadImageToPdfTool } from './modules/pdf/image_to_pdf.js';
import { loadPdfToImagesTool } from './modules/pdf/pdf_to_image.js';
import { loadMergePdfTool } from './modules/pdf/merge_pdf.js';
import { loadSplitPdfTool } from './modules/pdf/split_pdf.js';
import { loadCompressPdfTool } from './modules/pdf/compress_pdf.js';
import { loadDeletePdfPagesTool } from './modules/pdf/delete_pages_pdf.js';

import { loadJpgToPngTool } from './modules/image/jpg_to_png.js';
import { loadPNGToJpgTool } from './modules/image/png_to_jpg.js';
import { loadCompressImageTool } from './modules/image/compress_image.js';
import { loadCropImageTool } from './modules/image/crop_image.js';

import { loadQrGeneratorTool } from './modules/utilities/qr_generator.js';

import { setLanguage, t } from './language/lang_manager.js';
import { spanish } from './language/spanish.js';
import { english } from './language/english.js';
import { french } from './language/french.js';

window.addEventListener('DOMContentLoaded', () => {

  const app = document.getElementById('app');
  const menu = document.getElementById('menu');

  // =========================
  // LANGUAGE INIT
  // =========================

  const savedLang = localStorage.getItem('lang') || 'es';

  setLanguage(
    savedLang === 'en'
      ? english
      : savedLang === 'fr'
      ? french
      : spanish
  );

  // =========================
  // CATEGORIES (NOW WITH IDS)
  // =========================

  const categories = [
    {
      name: 'pdf',
      tools: [
        { id: 'image_to_pdf', key: 'image_to_pdf_title', load: loadImageToPdfTool },
        { id: 'pdf_to_images', key: 'pdf_to_images_title', load: loadPdfToImagesTool },
        { id: 'merge_pdf', key: 'merge_pdf_title', load: loadMergePdfTool },
        { id: 'split_pdf', key: 'split_pdf_title', load: loadSplitPdfTool },
        { id: 'compress_pdf', key: 'compress_pdf_title', load: loadCompressPdfTool },
        { id: 'delete_pdf_pages', key: 'delete_pdf_pages_title', load: loadDeletePdfPagesTool }
      ]
    },
    {
      name: 'images',
      tools: [
        { id: 'jpg_to_png', key: 'jpg_to_png_title', load: loadJpgToPngTool },
        { id: 'png_to_jpg', key: 'png_to_jpg_title', load: loadPNGToJpgTool },
        { id: 'compress_image', key: 'compress_image_title', load: loadCompressImageTool },
        { id: 'crop_image', key: 'crop_image_title', load: loadCropImageTool }
      ]
    },
    {
      name: 'utilities',
      tools: [
        { id: 'qr_generator', key: 'qr_generator_title', load: loadQrGeneratorTool }
      ]
    }
  ];

  // =========================
  // ROUTING
  // =========================

  const params = new URLSearchParams(window.location.search);
  let currentToolId = params.get('tool') || 'image_to_pdf';

  function findToolById(id) {
    for (let c = 0; c < categories.length; c++) {
      for (let t = 0; t < categories[c].tools.length; t++) {
        if (categories[c].tools[t].id === id) {
          return { c, t };
        }
      }
    }
    return { c: 0, t: 0 };
  }

  let { c: currentCategory, t: currentTool } = findToolById(currentToolId);

  // =========================
  // HELPERS
  // =========================

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

  // =========================
  // RENDER MENU + APP
  // =========================

  function renderApp() {

    menu.innerHTML = '';
    clearApp();

    categories.forEach((category, categoryIndex) => {

      const title = document.createElement('div');
      title.className = 'menu-category';
      title.textContent = t(category.name);
      menu.appendChild(title);

      category.tools.forEach((tool) => {

        const button = document.createElement('button');
        button.className = 'menu-button';
        button.textContent = t(tool.key);

        if (tool.id === currentToolId) {
          button.classList.add('active');
        }

        button.addEventListener('click', () => {

          currentToolId = tool.id;

          const pos = findToolById(tool.id);

          currentCategory = pos.c;
          currentTool = pos.t;

          // update URL (REAL PAGE SYSTEM)
          window.history.pushState({}, '', `?tool=${tool.id}`);

          renderApp();
        });

        menu.appendChild(button);
      });
    });

    // load tool
    categories[currentCategory]
      .tools[currentTool]
      .load(app);

    applyTranslations();
  }

  // =========================
  // BACK/FORWARD SUPPORT
  // =========================

  window.addEventListener('popstate', () => {

    const params = new URLSearchParams(window.location.search);
    const toolId = params.get('tool') || 'image_to_pdf';

    currentToolId = toolId;

    const pos = findToolById(toolId);

    currentCategory = pos.c;
    currentTool = pos.t;

    renderApp();
  });

  // =========================
  // LANGUAGE SWITCH
  // =========================

  document.querySelectorAll('[data-lang]').forEach(btn => {

    btn.addEventListener('click', () => {

      const value = btn.dataset.lang;

      localStorage.setItem('lang', value);

      setLanguage(
        value === 'en'
          ? english
          : value === 'fr'
          ? french
          : spanish
      );

      renderApp();
      updateLangUI();
    });
  });

  // =========================
  // COOKIES
  // =========================

  const cookieBanner = document.getElementById('cookieBanner');
  const acceptCookies = document.getElementById('acceptCookies');

  if (!localStorage.getItem('cookiesAccepted')) {
    cookieBanner.style.display = 'block';
  } else {
    cookieBanner.style.display = 'none';
  }

  acceptCookies.addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', 'true');
    cookieBanner.style.display = 'none';
  });

  // =========================
  // INIT
  // =========================

  updateLangUI();
  renderApp();
});