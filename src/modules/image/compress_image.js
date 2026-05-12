import { t } from '../../language/lang_manager.js';

export function loadCompressImageTool(parent) {

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>${t('compress_image_title')}</h2>

    <label class="file-upload">
      ${t('select_image')}
      <input type="file" id="imgInput" accept="image/*" />
    </label>

    <p id="fileName">${t('no_file')}</p>

    <img id="preview" style="
      display:none;
      width:100%;
      margin-top:15px;
      border-radius:10px;
      border:1px solid #334155;
    "/>

    <div style="margin-top:15px; display:none;" id="controls">

      <p style="color:#94a3b8;">${t('quality')}</p>

      <input
        type="range"
        id="quality"
        min="0.1"
        max="1"
        step="0.1"
        value="0.7"
        style="width:100%;"
      />

      <p id="qualityValue" style="color:#94a3b8;">0.7</p>

    </div>

    <p id="status" style="margin-top:10px; color:#94a3b8;"></p>

    <button id="compressBtn" style="display:none; margin-top:15px;">
      ${t('compress')}
    </button>
  `;

  parent.appendChild(card);

  const input = card.querySelector('#imgInput');
  const fileName = card.querySelector('#fileName');
  const preview = card.querySelector('#preview');
  const controls = card.querySelector('#controls');
  const quality = card.querySelector('#quality');
  const qualityValue = card.querySelector('#qualityValue');
  const status = card.querySelector('#status');
  const btn = card.querySelector('#compressBtn');

  let img = null;
  let baseName = 'image';

  // =========================
  // SELECT IMAGE
  // =========================
  input.addEventListener('change', () => {

    if (!input.files.length) return;

    const file = input.files[0];

    fileName.textContent = file.name;
    baseName = file.name.replace(/\.[^/.]+$/, '');

    const reader = new FileReader();

    reader.onload = (e) => {

      img = new Image();
      img.src = e.target.result;

      img.onload = () => {

        preview.src = img.src;
        preview.style.display = 'block';

        controls.style.display = 'block';
        btn.style.display = 'block';
      };
    };

    reader.readAsDataURL(file);
  });

  // =========================
  // SLIDER
  // =========================
  quality.addEventListener('input', () => {
    qualityValue.textContent = quality.value;
  });

  // =========================
  // COMPRESS
  // =========================
  btn.addEventListener('click', () => {

    if (!img) return;

    status.textContent = t('converting');
    btn.disabled = true;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const q = parseFloat(quality.value);

    canvas.toBlob((blob) => {

      if (!blob) {
        status.textContent = 'Error compressing image';
        btn.disabled = false;
        return;
      }

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_compressed.jpg`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 1500);

      status.textContent = t('done');
      btn.disabled = false;

    }, 'image/jpeg', q); // 🔥 AQUÍ ESTÁ EL FIX REAL
  });
}