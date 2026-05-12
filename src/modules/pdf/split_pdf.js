import { t } from '../../language/lang_manager.js';

export function loadSplitPdfTool(parent) {

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>${t('split_pdf_title')}</h2>

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
  `;

  parent.appendChild(card);

  const input = card.querySelector('#pdfInput');
  const fileName = card.querySelector('#fileName');
  const status = card.querySelector('#status');
  const pagesContainer = card.querySelector('#pages');

  let baseName = 'file';

  // =========================
  // LOAD PDF
  // =========================

  input.addEventListener('change', async () => {

    if (!input.files.length) return;

    const file = input.files[0];

    fileName.textContent = file.name;

    // =========================
    // KEEP ORIGINAL NAME
    // =========================
    baseName = file.name.replace(/\.[^/.]+$/, '');

    status.textContent = t('converting');
    pagesContainer.innerHTML = '';

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

        // =========================
        // UI BLOCK
        // =========================

        const wrapper = document.createElement('div');

        wrapper.style.background = '#0f172a';
        wrapper.style.border = '1px solid #334155';
        wrapper.style.borderRadius = '12px';
        wrapper.style.padding = '10px';

        const title = document.createElement('p');
        title.textContent = `${baseName} - page ${i}`;
        title.style.color = '#e2e8f0';
        title.style.marginBottom = '10px';

        const img = document.createElement('img');
        img.src = imgUrl;
        img.style.width = '100%';
        img.style.borderRadius = '8px';

        const btn = document.createElement('button');
        btn.textContent = t('download');

        btn.style.marginTop = '10px';

        btn.addEventListener('click', () => {

          const a = document.createElement('a');
          a.href = imgUrl;

          // =========================
          // KEEP ORIGINAL NAME + PAGE
          // =========================
          a.download = `${baseName}_page_${i}.png`;

          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

        });

        wrapper.appendChild(title);
        wrapper.appendChild(img);
        wrapper.appendChild(btn);

        pagesContainer.appendChild(wrapper);
      }

      URL.revokeObjectURL(url);

      status.textContent = t('done');

    } catch (err) {

      console.error(err);
      status.textContent = t('error_converting');
    }

  });

}