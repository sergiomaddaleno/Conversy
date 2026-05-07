import { t } from '../language/lang_manager.js';

export function loadPNGToJpgTool(parent) {

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>${t('png_to_jpg_title')}</h2>

    <label class="file-upload">
      ${t('select_image')}
      <input type="file" id="imgInput" accept=".png,image/png" />
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
      ${t('convert_jpg')}
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
  // FILE SELECT + PREVIEW
  // =========================
  input.addEventListener('change', () => {

    if (!input.files.length) return;

    const file = input.files[0];

    fileName.textContent = file.name;

    // 👉 quitar extensión
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
  // CONVERT TO JPG
  // =========================
  btn.addEventListener('click', () => {

    if (!currentImage) return;

    status.textContent = t('converting');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = currentImage.width;
    canvas.height = currentImage.height;

    // fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(currentImage, 0, 0);

    const jpgUrl = canvas.toDataURL('image/jpeg', 1.0);

    const link = document.createElement('a');
    link.href = jpgUrl;

    // 👉 RESPETAR NOMBRE ORIGINAL
    link.download = `${baseName}.jpg`;

    link.click();

    status.textContent = t('done');
  });
}