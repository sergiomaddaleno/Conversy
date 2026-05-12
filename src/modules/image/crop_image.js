import { t } from '../../language/lang_manager.js';

export function loadCropImageTool(parent) {

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>${t('crop_image_title')}</h2>

    <label class="file-upload">
      ${t('select_image')}
      <input type="file" id="imgInput" accept="image/*" />
    </label>

    <p id="fileName">${t('no_file')}</p>

    <div id="previewWrapper" style="
      position:relative;
      display:none;
      margin-top:15px;
    ">

      <img id="preview" style="
        width:100%;
        border-radius:10px;
        border:1px solid #334155;
        display:block;
        user-select:none;
      "/>

      <div id="cropBox" style="
        position:absolute;
        border:2px dashed #38bdf8;
        background:rgba(56,189,248,0.15);
        cursor:move;
        left:0;
        top:0;
        width:100px;
        height:100px;
      "></div>

    </div>

    <div id="controls" style="display:none; margin-top:15px;">

      <p style="color:#94a3b8;">X</p>
      <input type="range" id="cropX" min="0" step="1" style="width:100%;">

      <p style="color:#94a3b8;">Y</p>
      <input type="range" id="cropY" min="0" step="1" style="width:100%;">

      <p style="color:#94a3b8;">Width</p>
      <input type="range" id="cropW" min="10" step="1" style="width:100%;">

      <p style="color:#94a3b8;">Height</p>
      <input type="range" id="cropH" min="10" step="1" style="width:100%;">

    </div>

    <p id="status" style="margin-top:10px; color:#94a3b8;"></p>

    <button id="cropBtn" style="display:none; margin-top:15px;">
      ${t('crop')}
    </button>
  `;

  parent.appendChild(card);

  const input = card.querySelector('#imgInput');
  const fileName = card.querySelector('#fileName');
  const preview = card.querySelector('#preview');
  const wrapper = card.querySelector('#previewWrapper');
  const cropBox = card.querySelector('#cropBox');

  const controls = card.querySelector('#controls');
  const status = card.querySelector('#status');
  const btn = card.querySelector('#cropBtn');

  const cropX = card.querySelector('#cropX');
  const cropY = card.querySelector('#cropY');
  const cropW = card.querySelector('#cropW');
  const cropH = card.querySelector('#cropH');

  let img = null;
  let baseName = 'image';

  // =========================
  // SCALE FIX
  // =========================
  let scaleX = 1;
  let scaleY = 1;

  function updateScale() {
    scaleX = preview.clientWidth / img.width;
    scaleY = preview.clientHeight / img.height;
  }

  function updateBox() {
    cropBox.style.left = (cropX.value * scaleX) + 'px';
    cropBox.style.top = (cropY.value * scaleY) + 'px';
    cropBox.style.width = (cropW.value * scaleX) + 'px';
    cropBox.style.height = (cropH.value * scaleY) + 'px';
  }

  function clamp() {
    if (!img) return;

    let x = +cropX.value;
    let y = +cropY.value;
    let w = +cropW.value;
    let h = +cropH.value;

    x = Math.max(0, Math.min(x, img.width - w));
    y = Math.max(0, Math.min(y, img.height - h));

    cropX.value = x;
    cropY.value = y;

    updateBox();
  }

  // =========================
  // DRAG BOX
  // =========================
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  cropBox.addEventListener('mousedown', (e) => {
    dragging = true;
    const rect = cropBox.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging || !img) return;

    const rect = preview.getBoundingClientRect();

    let x = (e.clientX - rect.left - offsetX) / scaleX;
    let y = (e.clientY - rect.top - offsetY) / scaleY;

    x = Math.max(0, Math.min(x, img.width - +cropW.value));
    y = Math.max(0, Math.min(y, img.height - +cropH.value));

    cropX.value = x;
    cropY.value = y;

    updateBox();
  });

  window.addEventListener('mouseup', () => dragging = false);

  // =========================
  // LOAD IMAGE
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

        wrapper.style.display = 'block';
        controls.style.display = 'block';
        btn.style.display = 'block';

        setTimeout(() => {

          updateScale();

          const initW = img.width / 2;
          const initH = img.height / 2;

          const initX = img.width / 4;
          const initY = img.height / 4;

          cropX.max = img.width;
          cropY.max = img.height;
          cropW.max = img.width;
          cropH.max = img.height;

          cropX.value = initX;
          cropY.value = initY;
          cropW.value = initW;
          cropH.value = initH;

          updateBox();

        }, 50);
      };
    };

    reader.readAsDataURL(file);
  });

  // =========================
  // SLIDERS
  // =========================
  [cropX, cropY, cropW, cropH].forEach(el => {
    el.addEventListener('input', () => {
      clamp();
      updateBox();
    });
  });

  // =========================
  // CROP + FIXED DOWNLOAD (IMPORTANT)
  // =========================
  btn.addEventListener('click', () => {

    if (!img) return;

    status.textContent = t('processing');
    btn.disabled = true;

    const x = +cropX.value;
    const y = +cropY.value;
    const w = +cropW.value;
    const h = +cropH.value;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

    // =========================
    // 🔥 FIX: SAME DOWNLOAD STYLE AS MERGE/COMPRESS PDF
    // =========================
    canvas.toBlob((blob) => {

      if (!blob) {
        status.textContent = 'Error cropping image';
        btn.disabled = false;
        return;
      }

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_cropped.jpg`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 2000);

      status.textContent = t('done');
      btn.disabled = false;

    }, 'image/jpeg', 1.0);
  });
}