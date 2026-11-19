export function procesarImagenArchivo(file: File, maxAncho = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject('El archivo seleccionado debe ser una imagen (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject('La imagen no puede superar los 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject('No se pudo leer el archivo de imagen.');
    reader.onload = (e: any) => {
      const img = new Image();
      img.onerror = () => reject('La imagen está dañada o tiene un formato no soportado.');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxAncho) {
          height = Math.round((height * maxAncho) / width);
          width = maxAncho;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target.result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}