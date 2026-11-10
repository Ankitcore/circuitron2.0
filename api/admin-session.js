// Vercel Serverless Function: /api/admin-session
// Enforces Single-Device Active Session for the Admin Portal.
// When an administrator signs in on Device B, any existing session on Device A is automatically superseded and logged out.
// High-concurrency optimized with Upstash Redis REST fallback and timeout protection.

import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

// Authorized SHA-256 passkey hashes
const AUTHORIZED_PASSKEY_HASHES = new Set([
  "b284b7a6daa1835eaedeb129fb9b756a9b22db51cba64f70aebe58b5ec4de5f5", // primary admin passkey hash
  "47cf068a4e03e066ee6cfcc19fdee108f9b140e05752063c233d9bc5f5cd5278", // admin passkey hash
  ...(process.env.ADMIN_PASSKEY_HASHES
    ? process.env.ADMIN_PASSKEY_HASHES.split(",").map((h) => h.trim().toLowerCase())
    : []),
  ...(process.env.ADMIN_PASSKEY
    ? [crypto.createHash("sha256").update(process.env.ADMIN_PASSKEY.trim().toLowerCase()).digest("hex")]
    : []),
]);

// In-memory global store to survive warm lambdas and local dev
if (!globalThis.__circuitron_admin_session) {
  globalThis.__circuitron_admin_session = null;
}

const TMP_FILE = path.join(os.tmpdir(), "circuitron_admin_session.json");

function loadSessionFromFile() {
  if (!globalThis.__circuitron_admin_session) {
    try {
      if (fs.existsSync(TMP_FILE)) {
        const raw = fs.readFileSync(TMP_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed && parsed.sessionId) {
          globalThis.__circuitron_admin_session = parsed;
        }
      }
    } catch (e) {
      // Ignore file read error
    }
  }
  return globalThis.__circuitron_admin_session;
}

function saveSessionToFile(session) {
  globalThis.__circuitron_admin_session = session;
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(session || null), "utf8");
  } catch (e) {
    // Ignore file write error
  }
}

function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ""), token };
}

async function fetchFromKv(kv, key) {
  if (!kv) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(`${kv.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${kv.token}` },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || json.result === undefined || json.result === null) return null;
    return typeof json.result === "string" ? JSON.parse(json.result) : json.result;
  } catch (e) {
    clearTimeout(timer);
    console.warn(`KV session read error for [${key}]:`, e.name === "AbortError" ? "Timeout (2s)" : e.message);
    return null;
  }
}

async function saveToKv(kv, key, value, ttlSeconds = 86400) {
  if (!kv) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);

  try {
    const payload = typeof value === "string" ? value : JSON.stringify(value);
    await fetch(`${kv.url}/set/${encodeURIComponent(key)}?ex=${ttlSeconds}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kv.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (e) {
    clearTimeout(timer);
    console.warn(`KV session save error for [${key}]:`, e.message);
  }
}

function isAuthorizedAdmin(req) {
  const authHeader = req.headers.authorization || req.headers["x-admin-auth"] || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim().toLowerCase();
  if (!token) return false;
  return AUTHORIZED_PASSKEY_HASHES.has(token);
}

function sanitizeText(str = "", maxLen = 150) {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, maxLen);
}

const ALLOWED_ORIGINS = new Set([
  "https://circuitron.in",
  "https://www.circuitron.in",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

export default async function handler(req, res) {
  // CORS Headers
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://www.circuitron.in");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-admin-auth, x-admin-session-id"
  );
  // Strict non-cacheable header for session security
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const kv = getKvConfig();
  let currentSession = loadSessionFromFile();

  if (!currentSession && kv) {
    currentSession = await fetchFromKv(kv, "active_admin_session");
    if (currentSession) {
      saveSessionToFile(currentSession);
    }
  }

  // 1. GET: Heartbeat & Active Session Validation
  if (req.method === "GET") {
    const clientSessionId = (
      req.query.sessionId ||
      req.headers["x-admin-session-id"] ||
      ""
    ).trim();

    if (!clientSessionId) {
      return res.status(200).json({
        success: true,
        isActive: false,
        activeSessionId: currentSession?.sessionId || null,
        message: "No session ID provided to validate.",
      });
    }

    if (!currentSession || !currentSession.sessionId) {
      // No active session registered on server yet
      return res.status(200).json({
        success: true,
        isActive: true,
        activeSessionId: clientSessionId,
        message: "No concurrent session recorded.",
      });
    }

    // Check if the querying client's session matches the active session
    const isMatching = currentSession.sessionId === clientSessionId;

    if (isMatching) {
      // Touch heartbeat
      currentSession.lastHeartbeat = Date.now();
      saveSessionToFile(currentSession);

      return res.status(200).json({
        success: true,
        isActive: true,
        activeSessionId: currentSession.sessionId,
        loggedInAt: currentSession.loggedInAt,
        device: currentSession.device,
      });
    }

    // Client's session has been superseded by a newer login on another device!
    return res.status(200).json({
      success: true,
      isActive: false,
      reason: "superseded_by_other_device",
      activeSessionId: currentSession.sessionId,
      supersededAt: currentSession.loggedInAt,
      otherDevice: currentSession.device || "Another device",
      message:
        "You were logged out because an administrator signed in from another device. TechXpo 2.O enforces single-device administrative access for security.",
    });
  }

  // 2. POST: Register New Sole Active Admin Session (Requires Authorization)
  if (req.method === "POST") {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Administrator authorization required to register active session.",
      });
    }

    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const sessionId = (body.sessionId || "").trim();

      if (!sessionId || sessionId.length < 8) {
        return res.status(400).json({
          success: false,
          error: "Invalid session identifier.",
        });
      }

      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "unknown-ip";

      const deviceName = sanitizeText(
        body.deviceName ||
          req.headers["user-agent"]?.split(")")[0]?.replace(/^Mozilla\/5\.0 \(/, "") ||
          "Web Browser",
        100
      );

      const newSession = {
        sessionId,
        loggedInAt: Date.now(),
        lastHeartbeat: Date.now(),
        device: deviceName,
        ip,
      };

      saveSessionToFile(newSession);

      if (kv) {
        await saveToKv(kv, "active_admin_session", newSession, 86400); // 24hr TTL
      }

      return res.status(200).json({
        success: true,
        sessionId,
        loggedInAt: newSession.loggedInAt,
        message: "New active admin session registered. Other devices will be automatically logged out.",
      });
    } catch (err) {
      console.error("POST /api/admin-session error:", err);
      return res.status(500).json({
        success: false,
        error: "Internal server error registering admin session.",
      });
    }
  }

  // 3. DELETE: Terminate Session on explicit logout
  if (req.method === "DELETE") {
    const clientSessionId = (
      req.query.sessionId ||
      req.headers["x-admin-session-id"] ||
      (req.body && req.body.sessionId) ||
      ""
    ).trim();

    if (currentSession && (!clientSessionId || currentSession.sessionId === clientSessionId)) {
      saveSessionToFile(null);
      if (kv) {
        try {
          await fetch(`${kv.url}/del/active_admin_session`, {
            method: "POST",
            headers: { Authorization: `Bearer ${kv.token}` },
          });
        } catch (e) {
          // ignore
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Admin session cleared from central server.",
    });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
