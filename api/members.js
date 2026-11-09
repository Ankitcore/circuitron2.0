// Vercel Serverless Function: /api/members
// Centralized Cloud Registry for TechXpo 2.O custom enrolled members
// Enables multi-device verification across mobile, desktop, and scanner devices

import fs from "fs";
import path from "path";
import os from "os";

// In-memory global store to survive warm lambdas and local dev sessions
if (!globalThis.__circuitron_members_store) {
  globalThis.__circuitron_members_store = new Map();
}
const memoryStore = globalThis.__circuitron_members_store;

const TMP_FILE = path.join(os.tmpdir(), "circuitron_members.json");

const INITIAL_MEMBERS = [
  {
    id: "TX2-PT-9295",
    name: "Rahul Verma",
    role: "Competitor",
    position: "Competitor",
    category: "Participant",
    tier: "Registered Participant",
    tierKey: "participant",
    department: "RVSCET, JAMSHEDPUR",
    teamName: "Group Name",
    img: "",
    tagline: "Official Symposium Competitor",
    description: "Verified Participant for TechXpo 2.O",
    isCustom: true,
    showOnWebsite: false,
    createdAt: "2026-11-09T00:00:00.000Z",
    idCard: "/assets/id-cards/TX2-PT-BLANK.jpg",
    idCardHd: "/assets/id-cards/TX2-PT-BLANK-hd.jpg",
    qrCode: "/assets/id-cards/TX2-PT-9295_qr.png",
  },
];

// Helper to load file backup if memoryStore is empty
function loadFromFile() {
  if (memoryStore.size === 0) {
    try {
      if (fs.existsSync(TMP_FILE)) {
        const raw = fs.readFileSync(TMP_FILE, "utf8");
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          list.forEach((m) => {
            if (m && m.id) memoryStore.set(m.id.trim().toUpperCase(), m);
          });
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Ensure default initial members exist if store is still empty
  if (memoryStore.size === 0) {
    INITIAL_MEMBERS.forEach((m) => {
      if (m && m.id) memoryStore.set(m.id.trim().toUpperCase(), m);
    });
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
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
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

    // Return all custom members
    let all = Array.from(memoryStore.values());
    if (all.length === 0 && kv) {
      const fromKv = await fetchFromKv(kv, "all_custom_members");
      if (Array.isArray(fromKv)) {
        fromKv.forEach((m) => {
          if (m && m.id) memoryStore.set(m.id.trim().toUpperCase(), m);
        });
        all = fromKv;
      }
    }

    return res.status(200).json({ success: true, members: all, count: all.length });
  }

  // 2. POST: Upsert member or batch of members
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const items = Array.isArray(body.members)
        ? body.members
        : body.member
        ? [body.member]
        : [];

      if (items.length === 0 && body.id && body.name) {
        items.push(body);
      }

      if (items.length === 0) {
        return res.status(400).json({ success: false, error: "No valid member data provided." });
      }

      items.forEach((m) => {
        if (m && m.id) {
          const normId = m.id.trim().toUpperCase();
          memoryStore.set(normId, { ...m, id: normId, updatedAt: new Date().toISOString() });
        }
      });

      saveToFile();

      // Persist to KV if configured
      if (kv) {
        for (const m of items) {
          if (m && m.id) {
            await saveToKv(kv, `member:${m.id.trim().toUpperCase()}`, m);
          }
        }
        await saveToKv(kv, "all_custom_members", Array.from(memoryStore.values()));
      }

      return res.status(200).json({
        success: true,
        message: `Successfully synced ${items.length} member(s) to cloud registry.`,
        totalStored: memoryStore.size,
      });
    } catch (err) {
      console.error("POST /api/members error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. DELETE: Remove member
  if (req.method === "DELETE") {
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
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
