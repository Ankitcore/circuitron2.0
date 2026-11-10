// Vercel Serverless Function: /api/upload
// Secure, high-speed image upload endpoint for TechXpo 2.O delegate avatar photos.
// Proxies images to Catbox CDN to produce permanent, public HTTPS URLs that
// load instantaneously across all devices, mobile scanners, and print ID badges.

const rateLimitMap = new Map();
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_ORIGINS = new Set([
  "https://circuitron.in",
  "https://www.circuitron.in",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

// Helper: Verify image binary magic bytes
function verifyImageMagicBytes(buf, expectedMime) {
  if (!buf || buf.length < 12) return false;
  // JPEG: FF D8 FF
  if (expectedMime === "image/jpeg" || expectedMime === "image/jpg") {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (expectedMime === "image/png") {
    return (
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a
    );
  }
  // WebP: RIFF .... WEBP
  if (expectedMime === "image/webp") {
    return (
      buf[0] === 0x52 &&
      buf[1] === 0x49 &&
      buf[2] === 0x46 &&
      buf[3] === 0x46 &&
      buf[8] === 0x57 &&
      buf[9] === 0x45 &&
      buf[10] === 0x42 &&
      buf[11] === 0x50
    );
  }
  // GIF: GIF87a or GIF89a
  if (expectedMime === "image/gif") {
    return buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38;
  }
  return false;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "6mb",
    },
  },
};

export default async function handler(req, res) {
  // CORS Headers
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://www.circuitron.in");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  try {
    // IP Rate Limiting (max 15 image uploads per 5 minutes per IP)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown-ip";
    const now = Date.now();
    const windowMs = 5 * 60 * 1000;
    const history = rateLimitMap.get(ip) || [];
    const recent = history.filter((t) => now - t < windowMs);
    if (recent.length >= 15) {
      return res.status(429).json({
        success: false,
        error: "Upload limit reached. Please wait a few minutes before uploading more images.",
      });
    }
    recent.push(now);
    rateLimitMap.set(ip, recent);

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const rawImage = body.image || body.file || body.dataUrl || "";

    if (!rawImage || typeof rawImage !== "string") {
      return res.status(400).json({ success: false, error: "No image data provided" });
    }

    // If it's already an HTTPS URL, validate domain to prevent SSRF / malicious URL reflection
    if (rawImage.startsWith("https://")) {
      try {
        const parsed = new URL(rawImage);
        const trustedHosts = [
          "files.catbox.moe",
          "images.unsplash.com",
          "circuitron.in",
          "www.circuitron.in",
          "res.cloudinary.com",
        ];
        if (trustedHosts.some((h) => parsed.hostname === h || parsed.hostname.endsWith("." + h))) {
          return res.status(200).json({ success: true, url: rawImage });
        }
      } catch {
        // Fall through
      }
      return res.status(400).json({ success: false, error: "Untrusted external image source." });
    }

    if (rawImage.startsWith("http://")) {
      return res.status(400).json({ success: false, error: "Insecure HTTP image URLs are not permitted." });
    }

    // Match base64 data URL
    let mimeType = "image/jpeg";
    let base64Data = rawImage;

    const matches = rawImage.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1].toLowerCase();
      base64Data = matches[2];
    }

    // Restrict strictly to valid image types
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return res.status(415).json({
        success: false,
        error: "Unsupported file type. Only JPEG, PNG, and WebP images are permitted.",
      });
    }

    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        error: "Image size exceeds 5MB limit. Please compress your photo before uploading.",
      });
    }

    // Validate binary magic bytes to prevent masqueraded executable or HTML payloads
    if (!verifyImageMagicBytes(buffer, mimeType)) {
      return res.status(415).json({
        success: false,
        error: "Corrupt or invalid image content. File signature does not match image format.",
      });
    }

    const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";

    // Prepare FormData for Catbox
    const fd = new FormData();
    fd.append("reqtype", "fileupload");
    const blob = new Blob([buffer], { type: mimeType });
    fd.append("fileToUpload", blob, `avatar_${Date.now()}.${ext}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const catboxRes = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: fd,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!catboxRes.ok) {
      throw new Error(`Upload CDN responded with status ${catboxRes.status}`);
    }

    const cdnUrl = (await catboxRes.text()).trim();

    if (cdnUrl.startsWith("http://") || cdnUrl.startsWith("https://")) {
      return res.status(200).json({
        success: true,
        url: cdnUrl,
      });
    }

    throw new Error("Invalid response format from CDN");
  } catch (err) {
    console.error("Upload proxy error:", err);
    return res.status(500).json({
      success: false,
      error: "An error occurred while uploading the photo. Please verify the image file format and try again.",
    });
  }
}
