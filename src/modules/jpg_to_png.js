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

  let img = null;
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

      img = new Image();
      img.src = e.target.result;

      img.onload = () => {

        preview.src = img.src;
        preview.style.display = 'block';

        btn.style.display = 'block';
      };
    };

    reader.readAsDataURL(file);
  });

  // =========================
  // CONVERT JPG → PNG (NO BLOB)
  // =========================
  btn.addEventListener('click', () => {

    if (!img) return;

    status.textContent = t('converting');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    // 🔥 SIN BLOB → usamos DATAURL directamente
    const pngUrl = canvas.toDataURL('image/png');

    downloadFile(pngUrl, `${baseName}.png`);

    status.textContent = t('done');
  });
}