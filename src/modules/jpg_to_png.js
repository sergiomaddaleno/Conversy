import { t } from '../language/lang_manager.js';
import { downloadFile } from '../utils/download_manager.js';

export function loadJpgToPngTool(parent) {

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>${t('jpg_to_png_title')}</h2>

    <label class="file-upload">
      ${t('select_image')}
      <input type="file" id="imgInput" accept=".jpg,.jpeg,image/jpeg" />
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

    <button id="convertBtn" style="display:none;">
      ${t('convert_png')}
    </button>
  `;

  parent.appendChild(card);

  const input = card.querySelector('#imgInput');
  const fileName = card.querySelector('#fileName');
  const status = card.querySelector('#status');
  const preview = card.querySelector('#preview');
  const btn = card.querySelector('#convertBtn');

  let currentImage = null;
  let baseName = 'image';

  // =========================
  // FILE SELECT
  // =========================
  input.addEventListener('change', () => {

    if (!input.files.length) return;

    const file = input.files[0];

    fileName.textContent = file.name;

    baseName = file.name.replace(/\.[^/.]+$/, '');

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
  // CONVERT JPG → PNG
  // =========================
  btn.addEventListener('click', () => {

    if (!currentImage) return;

    status.textContent = t('converting');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = currentImage.width;
    canvas.height = currentImage.height;

    ctx.drawImage(currentImage, 0, 0);

    canvas.toBlob((blob) => {

      // 🔥 USAMOS EL SISTEMA UNIFICADO
      downloadFile(blob, `${baseName}.png`);

      status.textContent = t('done');

    }, 'image/png');
  });
}