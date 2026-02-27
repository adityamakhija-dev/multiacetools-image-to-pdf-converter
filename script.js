const dropZone = document.getElementById('drop-zone');
const imageInput = document.getElementById('image-input');
const preview = document.getElementById('preview');
let images = [];

// Drag-and-drop functionality
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.style.background = 'rgba(255, 255, 255, 0.2)';
});

dropZone.addEventListener('dragleave', () => {
  dropZone.style.background = 'rgba(255, 255, 255, 0.1)';
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.style.background = 'rgba(255, 255, 255, 0.1)';
  handleFiles(e.dataTransfer.files);
});

imageInput.addEventListener('change', () => {
  handleFiles(imageInput.files);
});

// Handle files and preview them
function handleFiles(files) {
  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.dataset.originalSrc = e.target.result; // Save original image source
      preview.appendChild(img);
      images.push(file); // Save file for processing
    };
    reader.readAsDataURL(file);
  });
}

// Convert images to PDF
document.getElementById('convert-pdf').addEventListener('click', function () {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  if (images.length > 0) {
    images.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;

        img.onload = function () {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;

          // Apply filters before drawing the image
          const filter = document.getElementById('filter-select').value;
          const brightness = document.getElementById('brightness-slider').value;
          const contrast = document.getElementById('contrast-slider').value;

          context.filter = `${filterStyle(filter)} brightness(${brightness}) contrast(${contrast})`;
          context.drawImage(img, 0, 0);

          // Add the canvas data to the PDF
          const imageData = canvas.toDataURL('image/jpeg');
          if (index > 0) pdf.addPage();
          pdf.addImage(imageData, 'JPEG', 10, 10, 180, 160);

          // Save the PDF once all images are processed
          if (index === images.length - 1) {
            pdf.save('multi-image-pdf.pdf');
          }
        };
      };
      reader.readAsDataURL(file);
    });
  } else {
    alert('Please upload at least one image!');
  }
});

// Helper function for predefined filters
function filterStyle(filter) {
  switch (filter) {
    case 'grayscale':
      return 'grayscale(100%)';
    case 'sepia':
      return 'sepia(100%)';
    case 'blur':
      return 'blur(5px)';
    case 'contrast':
      return 'contrast(200%)';
    default:
      return ''; // Empty string for 'none'
  }
}
