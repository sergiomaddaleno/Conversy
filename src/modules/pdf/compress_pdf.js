import { t } from '../../language/lang_manager.js';

export function loadCompressPdfTool(parent) {

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>${t('compress_pdf_title')}</h2>

    <label class="file-upload">
      ${t('select_pdf')}
      <input type="file" id="pdfInput" accept="application/pdf" />
    </label>

    <p id="fileName">${t('no_file')}</p>

    <div id="preview" style="
      margin-top:20px;
      display:none;
      border:1px solid #334155;
      border-radius:12px;
      overflow:hidden;
    ">
      <canvas id="canvasPreview" style="width:100%;"></canvas>
    </div>

    <p id="status" style="margin-top:15px; color:#94a3b8;"></p>

    <button id="compressBtn" style="display:none; margin-top:15px;">
      ${t('compress')}
    </button>
  `;

  parent.appendChild(card);

  const input = card.querySelector('#pdfInput');
  const fileName = card.querySelector('#fileName');
  const preview = card.querySelector('#preview');
  const canvas = card.querySelector('#canvasPreview');
  const status = card.querySelector('#status');
  const btn = card.querySelector('#compressBtn');

  const ctx = canvas.getContext('2d');

  let fileData = null;
  let baseName = 'file';

  // =========================
  // SELECT PDF + PREVIEW (like merge style)
  // =========================
  input.addEventListener('change', async () => {

    if (!input.files.length) return;

    fileData = input.files[0];

    fileName.textContent = fileData.name;
    baseName = fileData.name.replace(/\.[^/.]+$/, '');

    status.textContent = '';
    btn.style.display = 'block';

    try {

      const url = URL.createObjectURL(fileData);

      const pdf = await pdfjsLib.getDocument(url).promise;

      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 1 });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx,
        viewport
      }).promise;

      preview.style.display = 'block';

      URL.revokeObjectURL(url);

    } catch (err) {

      console.error(err);
      status.textContent = 'Preview error';

    }
  });

  // =========================
  // COMPRESS (REAL FLOW LIKE MERGE)
  // =========================
  btn.addEventListener('click', async () => {

    if (!fileData) return;

    try {

      status.textContent = t('converting');
      btn.disabled = true;

      if (!window.PDFLib || !window.PDFLib.PDFDocument) {
        throw new Error('PDFLib not loaded');
      }

      const arrayBuffer = await fileData.arrayBuffer();

      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);

      const compressedBytes = await pdfDoc.save();

      const blob = new Blob([compressedBytes], {
        type: 'application/pdf'
      });

      // =========================
      // DOWNLOAD (same style as merge)
      // =========================
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_compressed.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 2000);

      status.textContent = t('done');

    } catch (err) {

      console.error(err);
      status.textContent = t('error_converting');

    } finally {

      btn.disabled = false;
    }
  });
}