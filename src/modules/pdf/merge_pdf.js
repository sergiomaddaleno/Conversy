import { t } from '../../language/lang_manager.js';

export function loadMergePdfTool(parent) {

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>${t('merge_pdf_title')}</h2>

    <label class="file-upload">
      ${t('select_pdfs')}
      <input
        type="file"
        id="pdfInput"
        accept="application/pdf"
        multiple
      />
    </label>

    <p id="fileName">${t('no_file')}</p>

    <div id="previewList" style="
      margin-top:20px;
      display:flex;
      flex-direction:column;
      gap:15px;
    "></div>

    <p id="status" style="
      margin-top:15px;
      color:#94a3b8;
    "></p>

    <button
      id="mergeBtn"
      style="display:none; margin-top:15px;"
    >
      ${t('merge_pdf_title')}
    </button>
  `;

  parent.appendChild(card);

  const input =
    card.querySelector('#pdfInput');

  const fileName =
    card.querySelector('#fileName');

  const previewList =
    card.querySelector('#previewList');

  const status =
    card.querySelector('#status');

  const btn =
    card.querySelector('#mergeBtn');

  let files = [];

  // =========================
  // SELECT PDFs
  // =========================

  input.addEventListener('change', async () => {

    if (!input.files.length) return;

    files = [...input.files];

    fileName.textContent =
      `${files.length} PDF`;

    previewList.innerHTML = '';

    status.textContent = '';

    btn.style.display =
      files.length >= 2
        ? 'block'
        : 'none';

    // =========================
    // PREVIEW
    // =========================

    for (const file of files) {

      try {

        const url =
          URL.createObjectURL(file);

        const pdf =
          await pdfjsLib
            .getDocument(url)
            .promise;

        const page =
          await pdf.getPage(1);

        const viewport =
          page.getViewport({
            scale: 1
          });

        const canvas =
          document.createElement('canvas');

        const ctx =
          canvas.getContext('2d');

        canvas.width =
          viewport.width;

        canvas.height =
          viewport.height;

        await page.render({
          canvasContext: ctx,
          viewport
        }).promise;

        const wrapper =
          document.createElement('div');

        wrapper.style.background =
          '#0f172a';

        wrapper.style.border =
          '1px solid #334155';

        wrapper.style.borderRadius =
          '12px';

        wrapper.style.padding =
          '10px';

        const title =
          document.createElement('p');

        title.textContent =
          file.name;

        title.style.marginBottom =
          '10px';

        title.style.color =
          '#e2e8f0';

        title.style.fontSize =
          '14px';

        canvas.style.width =
          '100%';

        canvas.style.borderRadius =
          '8px';

        wrapper.appendChild(title);
        wrapper.appendChild(canvas);

        previewList.appendChild(wrapper);

        URL.revokeObjectURL(url);

      } catch (err) {

        console.error(err);

      }

    }

  });

  // =========================
  // MERGE PDFs
  // =========================

  btn.addEventListener('click', async () => {

    if (files.length < 2) return;

    try {

      status.textContent =
        t('converting');

      btn.disabled = true;

      // verificar PDFLib
      if (
        !window.PDFLib ||
        !window.PDFLib.PDFDocument
      ) {

        throw new Error(
          'PDFLib not loaded'
        );

      }

      const mergedPdf =
        await window.PDFLib
          .PDFDocument
          .create();

      // =========================
      // COPY ALL PAGES
      // =========================

      for (const file of files) {

        const arrayBuffer =
          await file.arrayBuffer();

        const pdf =
          await window.PDFLib
            .PDFDocument
            .load(arrayBuffer);

        const copiedPages =
          await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices()
          );

        copiedPages.forEach(page => {

          mergedPdf.addPage(page);

        });

      }

      // =========================
      // GENERATE PDF
      // =========================

      const pdfBytes =
        await mergedPdf.save();

      const blob =
        new Blob(
          [pdfBytes],
          {
            type: 'application/pdf'
          }
        );

      // =========================
      // DOWNLOAD
      // =========================

      const url =
        URL.createObjectURL(blob);

      const a =
        document.createElement('a');

      a.href = url;
      a.download = 'merged.pdf';

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      setTimeout(() => {

        URL.revokeObjectURL(url);

      }, 2000);

      status.textContent =
        t('done');

    } catch (err) {

      console.error(err);

      status.textContent =
        t('error_converting');

    } finally {

      btn.disabled = false;

    }

  });

}