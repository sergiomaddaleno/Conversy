export function downloadFile(data, filename, type = 'auto') {

  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  let url;

  // =========================
  // PDF.js / jsPDF case
  // =========================
  if (type === 'pdf') {

    // jsPDF permite descarga nativa SIN blob
    data.save(filename);
    return;
  }

  // =========================
  // IMAGE case (canvas dataURL)
  // =========================
  if (typeof data === 'string') {

    url = data;

  } else {

    // fallback por si te pasan canvas
    url = data.toDataURL?.('image/png');
  }

  if (!url) return;

  const a = document.createElement('a');
  a.href = url;

  // desktop descarga
  if (!isMobile) {

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  } else {

    // móvil: abrir directamente
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}