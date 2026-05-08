export function downloadFile(blob, filename) {

  const url = URL.createObjectURL(blob);

  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

  // crear link SIEMPRE
  const a = document.createElement('a');
  a.href = url;

  if (!isMobile) {

    // desktop → descarga real
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  } else {

    // móvil → forzar navegación directa
    a.target = '_blank';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // fallback extra (MUY importante en iOS)
    setTimeout(() => {

      window.location.href = url;

    }, 300);

  }

  setTimeout(() => URL.revokeObjectURL(url), 2000);
}