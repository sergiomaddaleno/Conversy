import { t } from '../../language/lang_manager.js';

export function loadQrGeneratorTool(parent) {

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>${t('qr_generator_title')}</h2>

    <input
      type="text"
      id="qrText"
      placeholder="${t('enter_text_or_url')}"
      style="
        width:100%;
        padding:12px;
        border-radius:10px;
        border:1px solid #334155;
        background:#0f172a;
        color:white;
        margin-top:15px;
        box-sizing:border-box;
      "
    />

    <div style="margin-top:15px; display:none;" id="controls">

      <p style="color:#94a3b8;">Size</p>

      <input
        type="range"
        id="qrSize"
        min="128"
        max="512"
        step="32"
        value="256"
        style="width:100%;"
      />

      <p id="sizeValue" style="color:#94a3b8;">
        256px
      </p>

    </div>

    <p id="status" style="
      margin-top:15px;
      color:#94a3b8;
    "></p>

    <div id="previewWrapper" style="
      display:none;
      margin-top:20px;
      text-align:center;
    ">

      <canvas id="qrCanvas" style="
        max-width:100%;
        border-radius:12px;
        border:1px solid #334155;
        background:white;
      "></canvas>

    </div>

    <button
      id="generateBtn"
      style="margin-top:15px;"
    >
      ${t('generate')}
    </button>

    <button
      id="downloadBtn"
      style="display:none; margin-top:15px;"
    >
      ${t('download')}
    </button>
  `;

  parent.appendChild(card);

  const qrText =
    card.querySelector('#qrText');

  const qrSize =
    card.querySelector('#qrSize');

  const sizeValue =
    card.querySelector('#sizeValue');

  const controls =
    card.querySelector('#controls');

  const previewWrapper =
    card.querySelector('#previewWrapper');

  const canvas =
    card.querySelector('#qrCanvas');

  const status =
    card.querySelector('#status');

  const generateBtn =
    card.querySelector('#generateBtn');

  const downloadBtn =
    card.querySelector('#downloadBtn');

  // =========================
  // SHOW CONTROLS
  // =========================

  controls.style.display = 'block';

  // =========================
  // SIZE SLIDER
  // =========================

  qrSize.addEventListener('input', () => {

    sizeValue.textContent =
      `${qrSize.value}px`;

  });

  // =========================
  // GENERATE QR
  // =========================

  generateBtn.addEventListener('click', async () => {

    const text =
      qrText.value.trim();

    if (!text) return;

    try {

      status.textContent =
        t('processing');

      generateBtn.disabled = true;

      const size =
        parseInt(qrSize.value);

      canvas.width = size;
      canvas.height = size;

      await QRCode.toCanvas(
        canvas,
        text,
        {
          width: size,
          margin: 2
        }
      );

      previewWrapper.style.display =
        'block';

      downloadBtn.style.display =
        'block';

      status.textContent =
        t('done');

    } catch (err) {

      console.error(err);

      status.textContent =
        t('error_generating');

    } finally {

      generateBtn.disabled = false;

    }

  });

  // =========================
  // DOWNLOAD
  // =========================

  downloadBtn.addEventListener('click', () => {

    const url =
      canvas.toDataURL('image/png');

    const a =
      document.createElement('a');

    a.href = url;
    a.download = 'qr-code.png';

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

  });

}