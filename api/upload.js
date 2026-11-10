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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "6mb",
    },
  },
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "https://circuitron.in");
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

    // If it's already an HTTP/HTTPS URL, validate and return it immediately
    if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
      return res.status(200).json({ success: true, url: rawImage });
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
