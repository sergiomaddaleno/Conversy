import { t } from '../../language/lang_manager.js';
import { downloadFile } from '../../utils/download_manager.js';

export function loadPdfToImagesTool(parent) {

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>${t('pdf_to_images_title')}</h2>

    <label class="file-upload">
      ${t('select_pdf')}
      <input type="file" id="pdfInput" accept="application/pdf" />
    </label>

    <p id="fileName">${t('no_file')}</p>

    <p id="status" style="margin-top:10px; color:#94a3b8;"></p>

    <button id="downloadAllBtn" style="display:none;">
      ${t('download_all')}
    </button>

    <div id="output"></div>
  `;

  parent.appendChild(card);

  const input = card.querySelector('#pdfInput');
  const fileName = card.querySelector('#fileName');
  const status = card.querySelector('#status');
  const downloadBtn = card.querySelector('#downloadAllBtn');
  const output = card.querySelector('#output');

  const images = [];
  let baseName = 'page';

  // =========================
  // LOAD PDF
  // =========================
  input.addEventListener('change', async () => {

    if (!input.files.length) return;

    const file = input.files[0];

    fileName.textContent = file.name;
    baseName = file.name.replace(/\.[^/.]+$/, '');

    status.textContent = t('converting');
    downloadBtn.style.display = 'none';
    output.innerHTML = '';
    images.length = 0;

    try {

      const url = URL.createObjectURL(file);
      const pdf = await pdfjsLib.getDocument(url).promise;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: ctx,
          viewport
        }).promise;

        // 🔥 convert DIRECTLY to blob (no URL needed)
        const blob = await new Promise(resolve =>
          canvas.toBlob(resolve, 'image/png')
        );

        images.push({
          blob,
          name: `${baseName}_page_${pageNum}.png`
        });

        // preview
        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        img.style.width = '100%';
        img.style.marginTop = '10px';

        output.appendChild(img);
      }

      URL.revokeObjectURL(url);

      status.textContent = t('done');
      downloadBtn.style.display = 'block';

    } catch (err) {

      console.error(err);
      status.textContent = t('error_converting');
    }
  });

  // =========================
  // DOWNLOAD ALL (FIXED SYSTEM)
  // =========================
  downloadBtn.addEventListener('click', async () => {

    if (!images.length) return;

    status.textContent = t('downloading');

    for (const img of images) {

      downloadFile(img.blob, img.name);

      // evita bloqueo del navegador
      await new Promise(r => setTimeout(r, 250));
    }

    status.textContent = t('done');
  });
}