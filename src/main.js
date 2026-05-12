import { loadImageToPdfTool } from './modules/pdf/image_to_pdf.js';
import { loadPdfToImagesTool } from './modules/pdf/pdf_to_image.js';
import { loadJpgToPngTool } from './modules/image/jpg_to_png.js';
import { loadPNGToJpgTool } from './modules/image/png_to_jpg.js';

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

  const savedLang =
    localStorage.getItem('lang') || 'es';

  setLanguage(
    savedLang === 'en'
      ? english
      : savedLang === 'fr'
      ? french
      : spanish
  );

  // =========================
  // CATEGORIES
  // =========================

  const categories = [

    {
      name: 'pdf',
      tools: [
        {
          key: 'image_to_pdf_title',
          load: loadImageToPdfTool
        },
        {
          key: 'pdf_to_images_title',
          load: loadPdfToImagesTool
        }
      ]
    },

    {
      name: 'images',
      tools: [
        {
          key: 'jpg_to_png_title',
          load: loadJpgToPngTool
        },
        {
          key: 'png_to_jpg_title',
          load: loadPNGToJpgTool
        }
      ]
    }

  ];

  // =========================
  // STATE
  // =========================

  const savedTool =
    JSON.parse(localStorage.getItem('tool'));

  let currentCategory =
    savedTool?.category || 0;

  let currentTool =
    savedTool?.tool || 0;

  // =========================
  // HELPERS
  // =========================

  function clearApp() {

    app.innerHTML = '';

  }

  function applyTranslations() {

    const subtitle =
      document.getElementById('subtitle');

    if (subtitle) {

      subtitle.textContent =
        t('subtitle');

    }

  }

  function updateLangUI() {

    const current =
      localStorage.getItem('lang') || 'es';

    document
      .querySelectorAll('[data-lang]')
      .forEach(btn => {

        btn.classList.toggle(
          'active',
          btn.dataset.lang === current
        );

      });

  }

  // =========================
  // RENDER
  // =========================

  function renderApp() {

    menu.innerHTML = '';

    clearApp();

    categories.forEach((category, categoryIndex) => {

      // =========================
      // CATEGORY TITLE
      // =========================

      const title =
        document.createElement('div');

      title.className =
        'menu-category';

      title.textContent =
        t(category.name);

      menu.appendChild(title);

      // =========================
      // TOOLS
      // =========================

      category.tools.forEach((tool, toolIndex) => {

        const button =
          document.createElement('button');

        button.className =
          'menu-button';

        button.textContent =
          t(tool.key);

        if (
          categoryIndex === currentCategory &&
          toolIndex === currentTool
        ) {

          button.classList.add('active');

        }

        button.addEventListener('click', () => {

          currentCategory =
            categoryIndex;

          currentTool =
            toolIndex;

          localStorage.setItem(
            'tool',
            JSON.stringify({
              category: currentCategory,
              tool: currentTool
            })
          );

          renderApp();

        });

        menu.appendChild(button);

      });

    });

    // =========================
    // LOAD CURRENT TOOL
    // =========================

    categories[currentCategory]
      .tools[currentTool]
      .load(app);

    applyTranslations();

  }

  // =========================
  // LANGUAGE SWITCH
  // =========================

  document
    .querySelectorAll('[data-lang]')
    .forEach(btn => {

      btn.addEventListener('click', () => {

        const value =
          btn.dataset.lang;

        localStorage.setItem(
          'lang',
          value
        );

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

  const cookieBanner =
    document.getElementById('cookieBanner');

  const acceptCookies =
    document.getElementById('acceptCookies');

  if (!localStorage.getItem('cookiesAccepted')) {

    cookieBanner.style.display =
      'block';

  } else {

    cookieBanner.style.display =
      'none';

  }

  acceptCookies.addEventListener('click', () => {

    localStorage.setItem(
      'cookiesAccepted',
      'true'
    );

    cookieBanner.style.display =
      'none';

  });

  // =========================
  // INIT
  // =========================

  updateLangUI();

  renderApp();

});