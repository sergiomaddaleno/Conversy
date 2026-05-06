export function loadImageToPdfTool(parent) {

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>Imagen → PDF</h2>

    <label class="file-upload">
      📁 Seleccionar imagen
      <input type="file" id="imgInput" accept="image/*" />
    </label>

    <p id="fileName">Ningún archivo seleccionado</p>

    <button id="convertBtn">Convertir a PDF</button>
  `;

  parent.appendChild(card);

  const input = card.querySelector('#imgInput');
  const btn = card.querySelector('#convertBtn');
  const fileName = card.querySelector('#fileName');

  // 👇 ESTO VA FUERA DEL BOTÓN
  input.addEventListener('change', () => {
    if (input.files.length > 0) {
      fileName.textContent = input.files[0].name;
    } else {
      fileName.textContent = "Ningún archivo seleccionado";
    }
  });

  btn.addEventListener('click', () => {

    if (!input.files.length) {
      alert('Sube una imagen primero');
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF();

        const width = pdf.internal.pageSize.getWidth();
        const height = (img.height * width) / img.width;

        pdf.addImage(img, 'JPEG', 0, 0, width, height);
        pdf.save('imagen.pdf');
      };
    };

    reader.readAsDataURL(file);
  });
}