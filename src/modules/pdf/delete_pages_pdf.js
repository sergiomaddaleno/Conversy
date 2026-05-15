import { t } from '../../language/lang_manager.js';

export function loadDeletePdfPagesTool(parent) {

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>${t('delete_pdf_pages_title')}</h2>

    <label class="file-upload">
      ${t('select_pdf')}
      <input type="file" id="pdfInput" accept="application/pdf" />
    </label>

    <p id="fileName">${t('no_file')}</p>

    <p id="status" style="margin-top:10px; color:#94a3b8;"></p>

    <div id="pages" style="
      margin-top:20px;
      display:flex;
      flex-direction:column;
      gap:15px;
    "></div>

    <button id="downloadBtn" style="display:none; margin-top:15px;">
      ${t('download')}
    </button>
  `;

  parent.appendChild(card);

  const input = card.querySelector('#pdfInput');
  const fileName = card.querySelector('#fileName');
  const status = card.querySelector('#status');
  const pagesContainer = card.querySelector('#pages');
  const downloadBtn = card.querySelector('#downloadBtn');

  let baseName = 'file';
  let fileData = null;

  const pages = [];

  // =========================
  // LOAD PDF
  // =========================
  input.addEventListener('change', async () => {

    if (!input.files.length) return;

    const file = input.files[0];

    fileData = file;

    fileName.textContent = file.name;
    baseName = file.name.replace(/\.[^/.]+$/, '');

    status.textContent = t('converting');
    pagesContainer.innerHTML = '';
    pages.length = 0;

    try {

      const url = URL.createObjectURL(file);
      const pdf = await pdfjsLib.getDocument(url).promise;

      for (let i = 1; i <= pdf.numPages; i++) {

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: ctx,
          viewport
        }).promise;

        const imgUrl = canvas.toDataURL('image/png');

        pages.push({
          index: i,
          keep: true
        });

        const wrapper = document.createElement('div');
        wrapper.style.background = '#0f172a';
        wrapper.style.border = '1px solid #334155';
        wrapper.style.borderRadius = '12px';
        wrapper.style.padding = '10px';

        const title = document.createElement('p');
        title.textContent = `${baseName} - page ${i}`;
        title.style.color = '#e2e8f0';

        const img = document.createElement('img');
        img.src = imgUrl;
        img.style.width = '100%';
        img.style.borderRadius = '8px';

        const btn = document.createElement('button');
        btn.textContent = t('delete_restore');
        btn.style.marginTop = '10px';

        let deleted = false;

        btn.addEventListener('click', () => {

          deleted = !deleted;
          pages[i - 1].keep = !deleted;

          wrapper.style.opacity = deleted ? '0.3' : '1';
        });

        wrapper.appendChild(title);
        wrapper.appendChild(img);
        wrapper.appendChild(btn);

        pagesContainer.appendChild(wrapper);
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
  // DOWNLOAD FINAL PDF (REAL FIX)
  // =========================
  downloadBtn.addEventListener('click', async () => {

    if (!fileData) return;

    try {

      status.textContent = t('converting');
      downloadBtn.disabled = true;

      if (!window.PDFLib || !window.PDFLib.PDFDocument) {
        throw new Error('PDFLib not loaded');
      }

      const arrayBuffer = await fileData.arrayBuffer();

      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const newPdf = await window.PDFLib.PDFDocument.create();

      const copiedPages = await newPdf.copyPages(
        pdfDoc,
        pages.filter(p => p.keep).map(p => p.index - 1)
      );

      copiedPages.forEach(page => {
        newPdf.addPage(page);
      });

      const pdfBytes = await newPdf.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_edited.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 2000);

      status.textContent = t('done');

    } catch (err) {

      console.error(err);
      status.textContent = t('error_converting');

    } finally {
      downloadBtn.disabled = false;
    }
  });
}