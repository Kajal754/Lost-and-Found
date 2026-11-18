export function readImageWithHash(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("The selected file is not a readable image."));
      image.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 9; canvas.height = 8;
          const context = canvas.getContext("2d", { willReadFrequently: true });
          context.drawImage(image, 0, 0, 9, 8);
          const pixels = context.getImageData(0, 0, 9, 8).data;
          const gray = [];
          for (let i = 0; i < pixels.length; i += 4) gray.push(0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]);
          let hash = 0n;
          for (let y = 0; y < 8; y += 1) for (let x = 0; x < 8; x += 1) {
            if (gray[y * 9 + x] > gray[y * 9 + x + 1]) hash |= 1n << BigInt(y * 8 + x);
          }
          const preview = document.createElement("canvas");
          const scale = Math.min(1, 720 / Math.max(image.naturalWidth, image.naturalHeight));
          preview.width = Math.max(1, Math.round(image.naturalWidth * scale));
          preview.height = Math.max(1, Math.round(image.naturalHeight * scale));
          preview.getContext("2d").drawImage(image, 0, 0, preview.width, preview.height);
          resolve({ data: preview.toDataURL("image/jpeg", 0.78), hash: hash.toString(16).padStart(16, "0") });
        } catch { reject(new Error("This image cannot be processed in your browser.")); }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
