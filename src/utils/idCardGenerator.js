import QRCode from "qrcode";
import { TIER_CONFIG, normalizeTierKey, getMemberById } from "../data/team";

/**
 * Build a self-contained verification URL carrying member credentials.
 * This guarantees any device/phone camera scanning the QR code can instantly verify
 * the delegate even if the device has never visited the admin portal.
 */
export function getMemberVerificationUrl(memberOrId) {
  if (!memberOrId) return "https://circuitron2-0.vercel.app/verify";

  let member = memberOrId;
  if (typeof memberOrId === "string") {
    const found = getMemberById(memberOrId);
    if (found) {
      member = found;
    } else {
      const cleanId = memberOrId.trim().toUpperCase();
      return `https://circuitron2-0.vercel.app/verify/${cleanId}`;
    }
  }

  const id = (member.id || "").trim().toUpperCase();
  const baseUrl = `https://circuitron2-0.vercel.app/verify/${id}`;
  const params = new URLSearchParams();

  if (member.name) params.set("n", member.name.trim());
  const role = member.role || member.position;
  if (role) params.set("r", role.trim());
  const rawTier = member.tierKey || member.tier || member.category;
  if (rawTier) params.set("t", normalizeTierKey(rawTier, id));
  if (member.department) params.set("d", member.department.trim());
  if (member.teamName) params.set("g", member.teamName.trim());
  if (member.img && typeof member.img === "string" && member.img.startsWith("http")) {
    params.set("img", member.img.trim());
  }

  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

/**
 * Draw the stylized TechXpo "X" logo mark in the center of a QR code canvas
 */
function drawTechXpoMark(ctx, size) {
  const center = size / 2;
  const boxW = size * 0.26;
  const boxH = size * 0.26;
  const x = center - boxW / 2;
  const y = center - boxH / 2;

  // White pill container behind logo
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x - 4, y - 4, boxW + 8, boxH + 8, 8);
  } else {
    ctx.rect(x - 4, y - 4, boxW + 8, boxH + 8);
  }
  ctx.fill();

  // Draw cyber X emblem
  ctx.lineCap = "round";
  ctx.lineWidth = boxW * 0.22;

  // First diagonal (Navy Blue #1e3a8a)
  ctx.strokeStyle = "#123597";
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 4);
  ctx.lineTo(x + boxW - 4, y + boxH - 4);
  ctx.stroke();

  // Second diagonal (Cyan #00bfff)
  ctx.strokeStyle = "#00bfff";
  ctx.beginPath();
  ctx.moveTo(x + boxW - 4, y + 4);
  ctx.lineTo(x + 4, y + boxH - 4);
  ctx.stroke();

  ctx.restore();
}

/**
 * Generate a high-resolution, royal-blue verification QR code
 */
export async function generateQrCodeDataUrl(memberOrId, size = 600) {
  let url;
  if (!memberOrId) {
    url = "https://circuitron2-0.vercel.app/verify";
  } else if (typeof memberOrId === "object") {
    url = getMemberVerificationUrl(memberOrId);
  } else {
    const found = getMemberById(memberOrId);
    url = found
      ? getMemberVerificationUrl(found)
      : `https://circuitron2-0.vercel.app/verify/${memberOrId.trim().toUpperCase()}`;
  }
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, url, {
    width: size,
    margin: 2,
    color: {
      dark: "#123597",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });

  const ctx = canvas.getContext("2d");
  drawTechXpoMark(ctx, size);

  return canvas.toDataURL("image/png");
}

/**
 * Helper to safely load an image with fallback
 */
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Generate official 2026 TechXpo 2.0 ID Card
 * Returns { hdDataUrl, stdDataUrl, qrDataUrl }
 */
export async function generateMemberIdCard(member) {
  const tierKey = normalizeTierKey(member.tierKey || member.tier || member.category, member.id);
  const cfg = TIER_CONFIG[tierKey] || TIER_CONFIG.participant;

  const width = 1224;
  const height = 1806;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 1. Load Blank Template Background
  const templateImg = await loadImage(cfg.blankTemplate);
  if (templateImg) {
    ctx.drawImage(templateImg, 0, 0, width, height);
  } else {
    // Graceful dark fallback background
    ctx.fillStyle = "#0A1A36";
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Avatar Drawing (Center: 676, 549 | Radius: 218)
  const cx = 676;
  const cy = 549;
  const r = 218;

  let memberImg = null;
  if (member.img && typeof member.img === "string") {
    memberImg = await loadImage(member.img);
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (memberImg) {
    // Center crop & scale square
    const dim = Math.min(memberImg.width, memberImg.height);
    const sx = (memberImg.width - dim) / 2;
    const sy = (memberImg.height - dim) / 2;
    ctx.drawImage(memberImg, sx, sy, dim, dim, cx - r, cy - r, r * 2, r * 2);
  } else {
    // Stylized Cyber Initials Placeholder
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, r);
    grad.addColorStop(0, "#142c54");
    grad.addColorStop(1, "#071224");
    ctx.fillStyle = grad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    const initials = member.name
      ? member.name
          .split(" ")
          .filter(Boolean)
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "TX";

    ctx.fillStyle = cfg.color;
    ctx.font = '900 110px "Exo 2", "Poppins", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, cx, cy);
  }
  ctx.restore();

  // Draw circular accent ring around portrait
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 223, 0, Math.PI * 2);
  ctx.strokeStyle = cfg.color;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 3. Load & Draw TechXpo Badge overlay at bottom right of avatar ring
  const badgeImg = await loadImage("/assets/id-cards/badge-overlay.png");
  if (badgeImg) {
    ctx.drawImage(badgeImg, 795, 659, 136, 137);
  }

  // 4. BOLD Name (Centered at X: 676, Baseline Y: 900 - aligned directly with avatar center)
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  let nameSize = 68;
  const nameUpper = (member.name || "DELEGATE").toUpperCase();
  ctx.font = `900 ${nameSize}px "Exo 2", "Poppins", sans-serif`;
  let nameWidth = ctx.measureText(nameUpper).width;
  while (nameWidth > 920 && nameSize > 36) {
    nameSize -= 2;
    ctx.font = `900 ${nameSize}px "Exo 2", "Poppins", sans-serif`;
    nameWidth = ctx.measureText(nameUpper).width;
  }
  ctx.fillText(nameUpper, 676, 900);
  ctx.restore();

  // 5. BOLD Position / Role with Tracking (Centered at X: 676, Baseline Y: 974)
  ctx.save();
  ctx.fillStyle = cfg.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const rawRole = (member.role || member.position || cfg.label).toUpperCase();
  const words = rawRole.split(/\s+/).filter(Boolean);
  const spacedWords = words.map((w) => w.split("").join(" "));
  const spacedRole = spacedWords.join("   ");

  let roleSize = 38;
  ctx.font = `900 ${roleSize}px "Exo 2", "Poppins", sans-serif`;
  let roleWidth = ctx.measureText(spacedRole).width;
  while (roleWidth > 940 && roleSize > 22) {
    roleSize -= 2;
    ctx.font = `900 ${roleSize}px "Exo 2", "Poppins", sans-serif`;
    roleWidth = ctx.measureText(spacedRole).width;
  }
  ctx.fillText(spacedRole, 676, 974);
  ctx.restore();

  // 6. Member ID in Orbitron (X: 625, Baseline Y: 1387)
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = '700 48px "Orbitron", monospace';
  ctx.fillText((member.id || "TX2-XX-0000").toUpperCase(), 625, 1387);
  ctx.restore();

  // 7. Group Name if Participant
  if (tierKey === "participant" && member.teamName) {
    ctx.save();
    ctx.fillStyle = "#FFD700";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = '700 32px "Exo 2", "Poppins", sans-serif';
    ctx.fillText(`Group: ${member.teamName}`, 625, 1445);
    ctx.restore();
  }

  // 8. Generate & Draw Royal Blue QR Code (at X: 211, Y: 1273, W: 355, H: 355)
  const qrDataUrl = await generateQrCodeDataUrl(member, 500);
  const qrImg = await loadImage(qrDataUrl);
  if (qrImg) {
    ctx.drawImage(qrImg, 211, 1273, 355, 355);
  }

  // 9. High-Definition Data URL
  const hdDataUrl = canvas.toDataURL("image/jpeg", 0.96);

  // 10. Standard Display Thumbnail (408 x 602)
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = 408;
  thumbCanvas.height = 602;
  const thumbCtx = thumbCanvas.getContext("2d");
  thumbCtx.drawImage(canvas, 0, 0, 408, 602);
  const stdDataUrl = thumbCanvas.toDataURL("image/jpeg", 0.90);

  return { hdDataUrl, stdDataUrl, qrDataUrl, verificationUrl: getMemberVerificationUrl(member) };
}

/**
 * Trigger immediate browser download of an image
 */
export function downloadDataUrl(dataUrl, filename = "TechXpo_ID_Card.jpg") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
