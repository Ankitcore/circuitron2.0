// Vercel Serverless Function: /api/members
// Centralized Cloud Registry for TechXpo 2.O custom enrolled members
// Enables multi-device verification across mobile, desktop, and scanner devices

import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

// Authorized SHA-256 passkey hashes
const AUTHORIZED_PASSKEY_HASHES = new Set([
  "b284b7a6daa1835eaedeb129fb9b756a9b22db51cba64f70aebe58b5ec4de5f5", // primary admin passkey hash
  "47cf068a4e03e066ee6cfcc19fdee108f9b140e05752063c233d9bc5f5cd5278", // admin passkey hash
  ...(process.env.ADMIN_PASSKEY_HASHES ? process.env.ADMIN_PASSKEY_HASHES.split(",").map((h) => h.trim().toLowerCase()) : []),
  ...(process.env.ADMIN_PASSKEY ? [crypto.createHash("sha256").update(process.env.ADMIN_PASSKEY.trim().toLowerCase()).digest("hex")] : []),
]);

function isAuthorizedAdmin(req) {
  const authHeader = req.headers.authorization || req.headers["x-admin-auth"] || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim().toLowerCase();
  if (!token) return false;
  return AUTHORIZED_PASSKEY_HASHES.has(token);
}

function sanitizeText(str = "", maxLen = 200) {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, maxLen);
}

// In-memory global store to survive warm lambdas and local dev sessions
if (!globalThis.__circuitron_members_store) {
  globalThis.__circuitron_members_store = new Map();
}
const memoryStore = globalThis.__circuitron_members_store;

const TMP_FILE = path.join(os.tmpdir(), "circuitron_members.json");

const INITIAL_MEMBERS = [];

// Helper to load file backup if memoryStore is empty
function loadFromFile() {
  if (memoryStore.size === 0) {
    try {
      if (fs.existsSync(TMP_FILE)) {
        const raw = fs.readFileSync(TMP_FILE, "utf8");
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          list.forEach((m) => {
            if (
              m &&
              m.id &&
              m.id.trim().toUpperCase() !== "TX2-PT-9295" &&
              m.name?.trim().toLowerCase() !== "rahul verma" &&
              m.id.trim().toUpperCase() !== "TX2-FC-8492" &&
              m.id.trim().toUpperCase() !== "TX2-FC-3925" &&
              !m.id.trim().toUpperCase().startsWith("TX2-FC")
            ) {
              memoryStore.set(m.id.trim().toUpperCase(), m);
            }
          });
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Ensure legacy mock participant and built-in faculty are purged
  let touched = false;
  ["TX2-PT-9295", "TX2-FC-8492", "TX2-FC-3925"].forEach((id) => {
    if (memoryStore.has(id)) {
      memoryStore.delete(id);
      touched = true;
    }
  });
  if (touched) {
    saveToFile();
  }
}

// Helper to save file backup
function saveToFile() {
  try {
    const list = Array.from(memoryStore.values());
    fs.writeFileSync(TMP_FILE, JSON.stringify(list), "utf8");
  } catch (e) {
    // ignore
  }
}

// Upstash / Vercel KV adapter if environment variables are set
async function getKvStore() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

async function fetchFromKv(kv, key) {
  try {
    const res = await fetch(`${kv.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${kv.token}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result ? JSON.parse(json.result) : null;
  } catch (e) {
    console.error("KV read error:", e);
    return null;
  }
}

async function saveToKv(kv, key, value) {
  try {
    await fetch(`${kv.url}/set/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kv.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(typeof value === "string" ? value : JSON.stringify(value)),
    });
  } catch (e) {
    console.error("KV save error:", e);
  }
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-admin-auth, x-admin-session-id"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  loadFromFile();
  const kv = await getKvStore();

  // 1. GET: Fetch member by ID, stream avatar, or list all
  if (req.method === "GET") {
    // Direct avatar image request: /api/members?avatar=TX2-XX-XXXX
    const avatarTargetId = (req.query.avatar || "").trim().toUpperCase();
    if (avatarTargetId) {
      let member = memoryStore.get(avatarTargetId);
      if (!member && kv) {
        member = await fetchFromKv(kv, `member:${avatarTargetId}`);
      }
      if (member && member.img) {
        if (member.img.startsWith("http://") || member.img.startsWith("https://")) {
          return res.redirect(302, member.img);
        }
        const matches = member.img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mime = matches[1];
          const buffer = Buffer.from(matches[2], "base64");
          res.setHeader("Content-Type", mime);
          res.setHeader("Cache-Control", "public, max-age=86400, immutable");
          return res.status(200).send(buffer);
        }
      }
      return res.status(404).send("Avatar not found");
    }

    const targetId = (req.query.id || "").trim().toUpperCase();

    if (targetId) {
      // Check memory store
      let member = memoryStore.get(targetId);

      // Check external KV if not in memory
      if (!member && kv) {
        member = await fetchFromKv(kv, `member:${targetId}`);
        if (member) {
          memoryStore.set(targetId, member);
        }
      }

      if (member) {
        return res.status(200).json({ success: true, member });
      }
      return res.status(404).json({ success: false, error: "Member not found" });
    }

    // Return all custom members (excluding any legacy mock records)
    let all = Array.from(memoryStore.values()).filter(
      (m) => m && m.id?.toUpperCase() !== "TX2-PT-9295" && m.name?.trim().toLowerCase() !== "rahul verma"
    );
    if (all.length === 0 && kv) {
      const fromKv = await fetchFromKv(kv, "all_custom_members");
      if (Array.isArray(fromKv)) {
        fromKv.forEach((m) => {
          if (
            m &&
            m.id &&
            m.id.trim().toUpperCase() !== "TX2-PT-9295" &&
            m.name?.trim().toLowerCase() !== "rahul verma"
          ) {
            memoryStore.set(m.id.trim().toUpperCase(), m);
          }
        });
        all = Array.from(memoryStore.values());
      }
    }

    return res.status(200).json({ success: true, members: all, count: all.length });
  }

  // 2. POST: Upsert member or batch of members (Requires Administrator Authorization)
  if (req.method === "POST") {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Valid administrator authorization required to update member registry.",
      });
    }

    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const rawItems = Array.isArray(body.members)
        ? body.members
        : body.member
        ? [body.member]
        : [];

      if (rawItems.length === 0 && body.id && body.name) {
        rawItems.push(body);
      }

      if (rawItems.length === 0) {
        return res.status(400).json({ success: false, error: "No valid member data provided." });
      }

      const idRegex = /^[A-Za-z0-9_-]{3,50}$/;
      const validItems = [];

      for (const m of rawItems) {
        if (!m || !m.id) continue;
        const normId = m.id.trim().toUpperCase();
        if (!idRegex.test(normId)) continue;

        // Server-side field sanitization
        const sanitizedMember = {
          ...m,
          id: normId,
          name: sanitizeText(m.name, 100),
          role: sanitizeText(m.role, 80),
          tier: sanitizeText(m.tier, 60),
          category: sanitizeText(m.category, 60),
          tierKey: sanitizeText(m.tierKey, 40),
          department: sanitizeText(m.department, 120),
          college: sanitizeText(m.college, 150),
          teamName: sanitizeText(m.teamName, 100),
          phone: sanitizeText(m.phone, 30),
          email: sanitizeText(m.email, 120),
          updatedAt: new Date().toISOString(),
        };

        memoryStore.set(normId, sanitizedMember);
        validItems.push(sanitizedMember);
      }

      saveToFile();

      // Persist to KV if configured
      if (kv && validItems.length > 0) {
        for (const m of validItems) {
          await saveToKv(kv, `member:${m.id}`, m);
        }
        await saveToKv(kv, "all_custom_members", Array.from(memoryStore.values()));
      }

      return res.status(200).json({
        success: true,
        message: `Successfully synced ${validItems.length} member(s) to cloud registry.`,
        totalStored: memoryStore.size,
      });
    } catch (err) {
      console.error("POST /api/members error:", err);
      return res.status(500).json({
        success: false,
        error: "An internal server error occurred while syncing member records.",
      });
    }
  }

  // 3. DELETE: Remove member (Requires Administrator Authorization)
  if (req.method === "DELETE") {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Valid administrator authorization required to delete member records.",
      });
    }

    try {
      const targetId = (req.query.id || (req.body && req.body.id) || "").trim().toUpperCase();
      if (!targetId) {
        return res.status(400).json({ success: false, error: "ID required for deletion." });
      }

      memoryStore.delete(targetId);
      saveToFile();

      if (kv) {
        await saveToKv(kv, `member:${targetId}`, null);
        await saveToKv(kv, "all_custom_members", Array.from(memoryStore.values()));
      }

      return res.status(200).json({ success: true, message: `Removed member ${targetId}` });
    } catch (err) {
      console.error("DELETE /api/members error:", err);
      return res.status(500).json({
        success: false,
        error: "An internal server error occurred while deleting member record.",
      });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
