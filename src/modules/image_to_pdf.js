import { t } from '../language/lang_manager.js';

export function loadImageToPdfTool(parent) {

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>${t('image_to_pdf_title')}</h2>

    <label class="file-upload">
      ${t('select_image')}
      <input type="file" id="imgInput" accept="image/*" />
    </label>

    <p id="fileName">${t('no_file')}</p>

    <p id="status" style="margin-top:10px; color:#94a3b8;"></p>

    <img id="preview" style="
      display:none;
      width:100%;
      margin-top:15px;
      border-radius:10px;
      border:1px solid #334155;
    "/>

    <button id="convertBtn" style="display:none; margin-top:15px;">
      ${t('convert_pdf')}
    </button>
  `;

  parent.appendChild(card);

  const input = card.querySelector('#imgInput');
  const fileName = card.querySelector('#fileName');
  const preview = card.querySelector('#preview');
  const status = card.querySelector('#status');
  const btn = card.querySelector('#convertBtn');

  let currentImage = null;
  let originalName = 'image';

  // =========================
  // SELECT IMAGE
  // =========================
  input.addEventListener('change', () => {

    if (!input.files.length) return;

    const file = input.files[0];

    fileName.textContent = file.name;

    originalName = file.name.replace(/\.[^/.]+$/, '');

    status.textContent = '';
    btn.style.display = 'none';

    const reader = new FileReader();

    reader.onload = (e) => {

      currentImage = new Image();
      currentImage.src = e.target.result;

      currentImage.onload = () => {

        preview.src = currentImage.src;
        preview.style.display = 'block';

        btn.style.display = 'block';
      };
    };

    reader.readAsDataURL(file);
  });

  // =========================
  // CONVERT
  // =========================
  btn.addEventListener('click', () => {

    if (!currentImage) return;

    status.textContent = t('converting');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const width = pdf.internal.pageSize.getWidth();
    const height = (currentImage.height * width) / currentImage.width;

    pdf.addImage(currentImage, 'JPEG', 0, 0, width, height);

    // =========================
    // MOBILE SAFE DOWNLOAD FIX
    // =========================

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);

    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
      );

    if (isMobile) {

      // móvil: abrir en nueva pestaña (más fiable)
      window.open(url, '_blank');

    } else {

      // desktop: descarga normal
      const a = document.createElement('a');

      a.href = url;
      a.download = `${originalName}.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    URL.revokeObjectURL(url);

    status.textContent = t('done');
  });
}