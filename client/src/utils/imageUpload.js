// Converts a File (from an <input type="file">) into a compressed, resized
// base64 data URL — small enough to store directly in a DB text column
// without needing separate file storage/hosting.
export function fileToCompressedDataUrl(file, { maxSize = 400, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowedTypes.has(file.type)) {
      reject(new Error("Only JPEG, PNG, or WebP images are allowed."));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error("Image is too large (max 2MB)."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't read that image."));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
