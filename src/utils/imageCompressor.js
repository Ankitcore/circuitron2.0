/**
 * Client-Side Image Resizer & Compressor for TechXpo 2.O Badges
 * Resizes large camera/phone uploads (2MB - 10MB) into lightweight, high-definition avatars (15KB - 30KB).
 * Prevents localStorage quota overflows and ensures fast cross-device cloud uploads.
 */

export function compressAvatarImage(fileOrDataUrl, maxDim = 380, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!fileOrDataUrl) return resolve("");

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Crop square center for circular badge avatars
        const cropDim = Math.min(width, height);
        const cropX = (width - cropDim) / 2;
        const cropY = (height - cropDim) / 2;

        const targetDim = Math.min(cropDim, maxDim);
        canvas.width = targetDim;
        canvas.height = targetDim;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw center-cropped square
        ctx.drawImage(img, cropX, cropY, cropDim, cropDim, 0, 0, targetDim, targetDim);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.warn("Canvas compression failed, falling back to original:", err);
        if (typeof fileOrDataUrl === "string") {
          resolve(fileOrDataUrl);
        } else {
          resolve("");
        }
      }
    };

    img.onerror = (err) => {
      console.warn("Image load failed for compression:", err);
      resolve(typeof fileOrDataUrl === "string" ? fileOrDataUrl : "");
    };

    if (typeof fileOrDataUrl === "string") {
      img.src = fileOrDataUrl;
    } else if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      resolve("");
    }
  });
}

/**
 * Upload a compressed image (base64 or Blob) to the cloud upload endpoint
 * Returns a permanent public HTTPS CDN URL (e.g. https://files.catbox.moe/xxxxxx.jpg)
 */
export async function uploadAvatarToCloud(dataUrlOrBlob) {
  if (!dataUrlOrBlob) return "";

  // If already a remote HTTP/HTTPS URL, return directly
  if (typeof dataUrlOrBlob === "string" && (dataUrlOrBlob.startsWith("http://") || dataUrlOrBlob.startsWith("https://"))) {
    return dataUrlOrBlob;
  }

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrlOrBlob }),
    });

    if (!res.ok) {
      throw new Error(`Upload returned status ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.url) {
      return data.url;
    }
    return dataUrlOrBlob;
  } catch (err) {
    console.warn("Failed to upload avatar to cloud CDN, using local fallback:", err);
    return dataUrlOrBlob;
  }
}
