// Vercel Serverless Function: /api/registrations
// Centralized Cloud & Local Database for Google Forms / Google Sheets Registrations
// High-concurrency optimized with Upstash Redis REST + Local Persistent JSON fallback

import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

// Authorized SHA-256 passkey hashes
const AUTHORIZED_PASSKEY_HASHES = new Set([
  "b284b7a6daa1835eaedeb129fb9b756a9b22db51cba64f70aebe58b5ec4de5f5", // primary admin passkey hash
  "47cf068a4e03e066ee6cfcc19fdee108f9b140e05752063c233d9bc5f5cd5278", // secretariat passkey hash
  ...(process.env.ADMIN_PASSKEY_HASHES
    ? process.env.ADMIN_PASSKEY_HASHES.split(",").map((h) => h.trim().toLowerCase())
    : []),
  ...(process.env.ADMIN_PASSKEY
    ? [crypto.createHash("sha256").update(process.env.ADMIN_PASSKEY.trim().toLowerCase()).digest("hex")]
    : []),
]);

const DEFAULT_SYNC_SECRET = process.env.REGISTRATION_SYNC_SECRET || "circuitron_sync_secure_2026";

function isAuthorizedAdmin(req) {
  const authHeader = req.headers.authorization || req.headers["x-admin-auth"] || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim().toLowerCase();
  if (!token) return false;
  return AUTHORIZED_PASSKEY_HASHES.has(token);
}

function isAuthorizedSync(req) {
  // Allow if admin
  if (isAuthorizedAdmin(req)) return true;

  // Check sync secret in headers or query
  const secretHeader = req.headers["x-sync-secret"] || "";
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  const querySecret = (req.query && req.query.secret) || "";

  const providedSecret = secretHeader || bearerToken || querySecret;
  if (!providedSecret) return false;

  if (providedSecret === DEFAULT_SYNC_SECRET) return true;
  if (AUTHORIZED_PASSKEY_HASHES.has(providedSecret.toLowerCase())) return true;

  // Also check sha256 hash of provided secret
  const hash = crypto.createHash("sha256").update(providedSecret.trim().toLowerCase()).digest("hex");
  if (AUTHORIZED_PASSKEY_HASHES.has(hash)) return true;

  return false;
}

function sanitizeText(str = "", maxLen = 500) {
  if (typeof str !== "string") return "";
  return str
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, maxLen);
}

// In-memory global stores to survive warm lambdas and local dev sessions
if (!globalThis.__circuitron_registrations_store) {
  globalThis.__circuitron_registrations_store = new Map();
}
const registrationsStore = globalThis.__circuitron_registrations_store;

if (!globalThis.__circuitron_sync_logs) {
  globalThis.__circuitron_sync_logs = [];
}
const syncLogsStore = globalThis.__circuitron_sync_logs;

// Default connected events discovered from Circuitron website
const DEFAULT_EVENTS = [
  {
    event_id: "project-exhibition",
    event_name: "Project Exhibition",
    category: "Exhibition",
    form_url: "https://forms.gle/mNU3damnJBMfnmSU7",
    form_id: "1FAIpQLScFvhR8Zx7Uu0-ERSkO_JNKSEJq7GwlwH5AIr3tNSa5jZi9Fg",
    sub_groups: ["Eklavya (Std 8-10)", "Lakshya (Std 11-12)", "Arjuna (UG/Diploma)"],
    status: "active",
    prize_pool: "₹54,000",
  },
  {
    event_id: "robo-war",
    event_name: "Robo War",
    category: "Robotics",
    form_url: "https://forms.gle/EGqdueaPzzKsWuuBA",
    form_id: "1FAIpQLSc_zXHoBoK1X7bHwVWkAm8A0Y_SjTU7sp_YpVfabev91Cb5TA",
    status: "active",
    prize_pool: "₹10,000",
  },
  {
    event_id: "robo-race",
    event_name: "Robo Race",
    category: "Robotics",
    form_url: "https://forms.gle/EGqdueaPzzKsWuuBA",
    form_id: "1FAIpQLSc_zXHoBoK1X7bHwVWkAm8A0Y_SjTU7sp_YpVfabev91Cb5TA",
    status: "active",
    prize_pool: "₹10,000",
  },
];

// Persistent File Storage paths
const DATA_DIR = path.join(process.cwd(), "data");
const REG_FILE_LOCAL = path.join(DATA_DIR, "circuitron_registrations.json");
const SYNC_FILE_LOCAL = path.join(DATA_DIR, "circuitron_sync_logs.json");
const REG_FILE_TMP = path.join(os.tmpdir(), "circuitron_registrations.json");
const SYNC_FILE_TMP = path.join(os.tmpdir(), "circuitron_sync_logs.json");

function ensureDirectoryExists(filePath) {
  try {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
  } catch (e) {
    // Ignore error
  }
}

function loadRegistrationsFromDisk() {
  if (registrationsStore.size === 0) {
    const candidates = [REG_FILE_LOCAL, REG_FILE_TMP];
    for (const file of candidates) {
      try {
        if (fs.existsSync(file)) {
          const raw = fs.readFileSync(file, "utf8");
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            list.forEach((reg) => {
              if (reg && reg.registration_id) {
                registrationsStore.set(reg.registration_id, reg);
              }
            });
            if (registrationsStore.size > 0) break;
          }
        }
      } catch (e) {
        // Continue to next fallback
      }
    }
  }

  if (syncLogsStore.length === 0) {
    const candidates = [SYNC_FILE_LOCAL, SYNC_FILE_TMP];
    for (const file of candidates) {
      try {
        if (fs.existsSync(file)) {
          const raw = fs.readFileSync(file, "utf8");
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            syncLogsStore.push(...list);
            if (syncLogsStore.length > 0) break;
          }
        }
      } catch (e) {
        // Continue to next fallback
      }
    }
  }
}

function saveRegistrationsToDisk() {
  try {
    const list = Array.from(registrationsStore.values());
    ensureDirectoryExists(REG_FILE_LOCAL);
    fs.writeFileSync(REG_FILE_LOCAL, JSON.stringify(list, null, 2), "utf8");
  } catch (e) {
    try {
      const list = Array.from(registrationsStore.values());
      fs.writeFileSync(REG_FILE_TMP, JSON.stringify(list), "utf8");
    } catch (err) {}
  }

  try {
    ensureDirectoryExists(SYNC_FILE_LOCAL);
    fs.writeFileSync(SYNC_FILE_LOCAL, JSON.stringify(syncLogsStore.slice(-100), null, 2), "utf8");
  } catch (e) {
    try {
      fs.writeFileSync(SYNC_FILE_TMP, JSON.stringify(syncLogsStore.slice(-100)), "utf8");
    } catch (err) {}
  }
}

// Upstash Redis / Vercel KV adapter
function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ""), token };
}

async function fetchFromKv(kv, key) {
  if (!kv) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);

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
    return null;
  }
}

async function saveToKv(kv, key, value, ttlSeconds = 604800) {
  if (!kv) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

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
  }
}

// Record an audit / sync log entry
function addSyncLog(entry) {
  const logItem = {
    sync_id: "sync_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    timestamp: new Date().toISOString(),
    status: entry.status || "success",
    event_id: entry.event_id || "all",
    successful_records: entry.successful_records || 0,
    failed_records: entry.failed_records || 0,
    duplicate_records: entry.duplicate_records || 0,
    message: entry.message || "Synchronization completed",
    error_details: entry.error_details || null,
  };
  syncLogsStore.unshift(logItem);
  if (syncLogsStore.length > 200) {
    syncLogsStore.length = 200;
  }
  return logItem;
}

/**
 * Intelligent field extractor that normalizes common fields across Google Forms
 * while preserving EVERY original question & answer in form_responses.
 */
function extractParticipantDetails(formResponses = {}, respondentEmail = "") {
  const details = {
    name: "",
    email: respondentEmail ? respondentEmail.trim() : "",
    phone: "",
    college: "RVSCET Jamshedpur",
    department: "",
    year: "",
    category: "",
    project_title: "",
    team_name: "",
    team_members: "",
  };

  for (const [rawQ, rawA] of Object.entries(formResponses)) {
    if (!rawQ) continue;
    const q = rawQ.toLowerCase().trim();
    const a = (Array.isArray(rawA) ? rawA.join(", ") : String(rawA || "")).trim();
    if (!a) continue;

    // Email
    if (!details.email && (q.includes("email") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a))) {
      details.email = a;
    }
    // Full Name
    else if (
      !details.name &&
      (q.includes("full name") ||
        q.includes("participant name") ||
        q.includes("leader name") ||
        q.includes("candidate name") ||
        q.includes("your name") ||
        (q === "name" && !q.includes("college") && !q.includes("team")))
    ) {
      details.name = a;
    }
    // Phone Number / WhatsApp
    else if (
      !details.phone &&
      (q.includes("phone") ||
        q.includes("contact") ||
        q.includes("whatsapp") ||
        q.includes("mobile") ||
        /^\+?[0-9\-\s()]{10,15}$/.test(a.replace(/\s+/g, "")))
    ) {
      details.phone = a;
    }
    // College / Institution
    else if (
      (q.includes("college") || q.includes("institution") || q.includes("school") || q.includes("university")) &&
      !q.includes("id card") &&
      !q.includes("roll")
    ) {
      details.college = a;
    }
    // Department / Branch
    else if (q.includes("department") || q.includes("branch") || q.includes("stream") || q.includes("discipline")) {
      details.department = a;
    }
    // Year / Semester
    else if (
      q.includes("year") ||
      q.includes("semester") ||
      q.includes("class") ||
      q.includes("std") ||
      q.includes("standard")
    ) {
      details.year = a;
    }
    // Category / Group (Eklavya, Lakshya, Arjuna)
    else if (
      q.includes("category") ||
      q.includes("group") ||
      q.includes("eklavya") ||
      q.includes("lakshya") ||
      q.includes("arjuna")
    ) {
      details.category = a;
    }
    // Project Title / Robot Name
    else if (
      q.includes("project title") ||
      q.includes("topic") ||
      q.includes("working model") ||
      q.includes("robot name") ||
      q.includes("bot name")
    ) {
      details.project_title = a;
    }
    // Team Name
    else if (q.includes("team name")) {
      details.team_name = a;
    }
    // Team Members
    else if (q.includes("team member") || q.includes("other member") || q.includes("partner")) {
      details.team_members = a;
    }
  }

  // Fallback for Name if not yet identified: check first question answer
  if (!details.name) {
    for (const [rawQ, rawA] of Object.entries(formResponses)) {
      const q = rawQ.toLowerCase();
      const a = (Array.isArray(rawA) ? rawA.join(", ") : String(rawA || "")).trim();
      if (
        !q.includes("time") &&
        !q.includes("email") &&
        !q.includes("college") &&
        !q.includes("phone") &&
        !q.includes("dept") &&
        a.length > 2 &&
        a.length < 50 &&
        !/^[0-9]+$/.test(a)
      ) {
        details.name = a;
        break;
      }
    }
  }

  return details;
}

/**
 * Determine the matching event from submission metadata or response content
 */
function determineEvent(rawEventId = "", formResponses = {}, formUrl = "", formTitle = "") {
  if (rawEventId) {
    const id = rawEventId.toLowerCase().trim();
    if (id === "project-exhibition" || id === "exhibition") return { id: "project-exhibition", name: "Project Exhibition" };
    if (id === "robo-war" || id === "robowar") return { id: "robo-war", name: "Robo War" };
    if (id === "robo-race" || id === "roborace") return { id: "robo-race", name: "Robo Race" };
  }

  // 1. Inspect specific answer values (NOT keys/questions, which may mention other events)
  for (const [key, value] of Object.entries(formResponses || {})) {
    const k = key.toLowerCase();
    const v = (Array.isArray(value) ? value.join(" ") : String(value || "")).toLowerCase().trim();

    // Check if this question is asking for event/competition selection
    if (k.includes("event") || k.includes("competition") || k.includes("choose") || k.includes("select") || k.includes("category")) {
      if (v.includes("race")) {
        return { id: "robo-race", name: "Robo Race" };
      }
      if (v.includes("war")) {
        return { id: "robo-war", name: "Robo War" };
      }
      if (v.includes("exhibition") || v.includes("eklavya") || v.includes("lakshya") || v.includes("arjuna")) {
        return { id: "project-exhibition", name: "Project Exhibition" };
      }
    }
  }

  // 2. Direct exact value check across any field's value
  for (const [, value] of Object.entries(formResponses || {})) {
    const v = (Array.isArray(value) ? value.join(" ") : String(value || "")).toLowerCase().trim();
    if (v === "robo race" || v === "roborace") return { id: "robo-race", name: "Robo Race" };
    if (v === "robo war" || v === "robowar") return { id: "robo-war", name: "Robo War" };
  }

  // 3. Inspect formUrl or formTitle
  if (formUrl && formUrl.includes("mNU3damnJBMfnmSU7")) {
    return { id: "project-exhibition", name: "Project Exhibition" };
  }
  if (formTitle && (formTitle.toLowerCase().includes("exhibition") || formTitle.toLowerCase().includes("registration"))) {
    return { id: "project-exhibition", name: "Project Exhibition" };
  }

  // 4. Check if Project Exhibition group in values
  for (const [key, value] of Object.entries(formResponses || {})) {
    const k = key.toLowerCase();
    const v = (Array.isArray(value) ? value.join(" ") : String(value || "")).toLowerCase().trim();
    if (
      k.includes("eklavya") || k.includes("lakshya") || k.includes("arjuna") ||
      v.includes("eklavya") || v.includes("lakshya") || v.includes("arjuna") ||
      k.includes("project") || v.includes("project")
    ) {
      return { id: "project-exhibition", name: "Project Exhibition" };
    }
  }

  // Default fallback
  if (rawEventId) {
    return { id: rawEventId, name: rawEventId };
  }
  return { id: "project-exhibition", name: "Project Exhibition" };
}

/**
 * Deduplication Fingerprint: ensures unique submission recognition without
 * blocking the same user from registering for different events.
 */
function createSubmissionFingerprint(eventId, email, phoneOrTimestamp) {
  const normEvent = (eventId || "").trim().toLowerCase();
  const normEmail = (email || "").trim().toLowerCase();
  const normKey = (phoneOrTimestamp || "").toString().trim().replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return crypto.createHash("sha256").update(`${normEvent}::${normEmail}::${normKey}`).digest("hex").slice(0, 16);
}

function parseCsv(text) {
  const clean = text.replace(/^\uFEFF/, "");
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    const next = clean[i + 1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((c === "\r" || c === "\n") && !inQuotes) {
      if (c === "\r" && next === "\n") i++;
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
      currentRow = [];
      currentField = "";
    } else {
      currentField += c;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
  }
  return rows;
}

function extractSpreadsheetId(input = "") {
  if (!input) return "";
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9-_]{20,60}$/.test(input.trim())) return input.trim();
  return "";
}

async function fetchGoogleSheetRows(sheetIdOrUrl, defaultEventId = "project-exhibition") {
  const sheetId = extractSpreadsheetId(sheetIdOrUrl);
  if (!sheetId) throw new Error("Invalid Google Sheets ID or URL.");

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    throw new Error(`Google Sheets responded with HTTP ${res.status}. Make sure Link Sharing is set to 'Anyone with the link can view'.`);
  }
  const csv = await res.text();
  const rows = parseCsv(csv);
  if (rows.length < 2) return [];

  const headers = rows[0];
  const items = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const formResponses = {};
    let email = "";
    let timestamp = new Date().toISOString();

    headers.forEach((h, idx) => {
      const val = row[idx] || "";
      formResponses[h] = val;
      if (h.toLowerCase().includes("email") && !email) email = val;
      if (h.toLowerCase().includes("time")) timestamp = val;
    });

    items.push({
      event_id: defaultEventId,
      source: "google_sheet_direct",
      submission_id: `sheet_${sheetId}_row_${r}`,
      timestamp,
      respondent_email: email,
      form_responses: formResponses,
    });
  }
  return items;
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
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-admin-auth, x-admin-session-id, x-sync-secret"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  loadRegistrationsFromDisk();
  const kv = getKvConfig();

  // Load from Upstash Redis if available and memory store is empty
  if (registrationsStore.size === 0 && kv) {
    try {
      const remoteList = await fetchFromKv(kv, "circuitron:registrations");
      if (Array.isArray(remoteList)) {
        remoteList.forEach((r) => registrationsStore.set(r.registration_id, r));
      }
      const remoteLogs = await fetchFromKv(kv, "circuitron:sync_logs");
      if (Array.isArray(remoteLogs)) {
        syncLogsStore.push(...remoteLogs);
      }
    } catch (e) {
      // ignore
    }
  }

  // =========================================================================
  // 1. GET: Fetch Registrations, Statistics, Event Breakdown, CSV Export
  // =========================================================================
  if (req.method === "GET") {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Valid administrator authorization required to access registration data.",
      });
    }

    const allList = Array.from(registrationsStore.values());

    // Deduplicate and annotate submissions
    // Sort all records newest first
    const sortedAll = [...allList].sort((a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0));

    const participantCounter = new Map();
    const seenPrimary = new Set();

    // Pass 1: count submissions per participant per event
    sortedAll.forEach((r) => {
      const email = (r.participant_details?.email || "").toLowerCase().trim();
      const rawPhone = (r.participant_details?.phone || "").replace(/[^0-9]/g, "");
      const phone = rawPhone.length >= 10 ? rawPhone.slice(-10) : "";
      const event = (r.event_id || "").toLowerCase().trim();

      const identityKey = email
        ? `${event}::email::${email}`
        : phone
        ? `${event}::phone::${phone}`
        : `${event}::sub::${r.submission_id || r.registration_id}`;

      participantCounter.set(identityKey, (participantCounter.get(identityKey) || 0) + 1);
    });

    // Pass 2: mark newest submission as primary, older duplicates as is_duplicate_copy
    const annotatedList = sortedAll.map((r) => {
      const email = (r.participant_details?.email || "").toLowerCase().trim();
      const rawPhone = (r.participant_details?.phone || "").replace(/[^0-9]/g, "");
      const phone = rawPhone.length >= 10 ? rawPhone.slice(-10) : "";
      const event = (r.event_id || "").toLowerCase().trim();

      const identityKey = email
        ? `${event}::email::${email}`
        : phone
        ? `${event}::phone::${phone}`
        : `${event}::sub::${r.submission_id || r.registration_id}`;

      const totalCount = participantCounter.get(identityKey) || 1;
      const isFirst = !seenPrimary.has(identityKey);
      if (isFirst) {
        seenPrimary.add(identityKey);
      }

      return {
        ...r,
        is_duplicate: totalCount > 1,
        is_duplicate_copy: !isFirst,
        duplicate_count: totalCount,
      };
    });

    // 1.A. Export to CSV if requested
    if (req.query.format === "csv" || req.query.export === "csv") {
      const eventFilter = (req.query.event || "all").toLowerCase();
      const filteredForCsv = annotatedList.filter((r) => {
        if (eventFilter !== "all" && r.event_id?.toLowerCase() !== eventFilter) return false;
        return true;
      });

      // Collect all unique question headers
      const questionHeaders = new Set();
      filteredForCsv.forEach((r) => {
        if (r.form_responses) {
          Object.keys(r.form_responses).forEach((k) => questionHeaders.add(k));
        }
      });
      const dynamicHeaders = Array.from(questionHeaders);

      const staticHeaders = [
        "Registration ID",
        "Event Name",
        "Participant Name",
        "Email Address",
        "Phone Number",
        "College / Institution",
        "Department / Branch",
        "Year / Semester",
        "Category / Group",
        "Project Title",
        "Submission Timestamp",
        "Verification Status",
        "Admin Notes",
      ];

      const fullHeaders = [...staticHeaders, ...dynamicHeaders];

      function escapeCsv(val) {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }

      const csvRows = [fullHeaders.map(escapeCsv).join(",")];

      filteredForCsv.forEach((r) => {
        const row = [
          escapeCsv(r.registration_id),
          escapeCsv(r.event_name),
          escapeCsv(r.participant_details?.name || ""),
          escapeCsv(r.participant_details?.email || ""),
          escapeCsv(r.participant_details?.phone || ""),
          escapeCsv(r.participant_details?.college || ""),
          escapeCsv(r.participant_details?.department || ""),
          escapeCsv(r.participant_details?.year || ""),
          escapeCsv(r.participant_details?.category || ""),
          escapeCsv(r.participant_details?.project_title || ""),
          escapeCsv(r.submitted_at || ""),
          escapeCsv(r.verification_status || "pending"),
          escapeCsv(r.admin_notes || ""),
        ];

        dynamicHeaders.forEach((dh) => {
          const val = r.form_responses ? r.form_responses[dh] : "";
          row.push(escapeCsv(Array.isArray(val) ? val.join("; ") : val));
        });

        csvRows.push(row.join(","));
      });

      const csvString = "\uFEFF" + csvRows.join("\r\n"); // UTF-8 BOM for Excel
      const filename = `Circuitron_Registrations_${eventFilter}_${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.status(200).send(csvString);
    }

    // 1.B. Filtering & Search
    let filtered = [...annotatedList];

    // Filter: Event
    const eventParam = (req.query.event || "all").toLowerCase().trim();
    if (eventParam && eventParam !== "all") {
      filtered = filtered.filter((r) => (r.event_id || "").toLowerCase() === eventParam);
    }

    // Filter: Verification Status
    const statusParam = (req.query.status || "all").toLowerCase().trim();
    if (statusParam && statusParam !== "all") {
      filtered = filtered.filter((r) => (r.verification_status || "pending").toLowerCase() === statusParam);
    }

    // Filter: Duplicate / Unique
    // Default: 'no_duplicates' (displays unique participants, hides duplicate copies)
    const dupParam = (req.query.duplicate || "no_duplicates").toLowerCase().trim();
    if (dupParam === "duplicates_only") {
      filtered = filtered.filter((r) => r.is_duplicate);
    } else if (dupParam === "all") {
      // Show all raw submissions including duplicate copies
    } else {
      // Default: 'no_duplicates' or 'unique' - keeps the primary (newest) submission for each participant
      filtered = filtered.filter((r) => !r.is_duplicate_copy);
    }

    // Filter: College
    const collegeParam = (req.query.college || "").toLowerCase().trim();
    if (collegeParam && collegeParam !== "all") {
      filtered = filtered.filter((r) => (r.participant_details?.college || "").toLowerCase().includes(collegeParam));
    }

    // Search Query (Name, Email, Phone, College, Dept, Project, ID)
    const searchQuery = (req.query.search || "").toLowerCase().trim();
    if (searchQuery) {
      filtered = filtered.filter((r) => {
        const idMatch = (r.registration_id || "").toLowerCase().includes(searchQuery);
        const nameMatch = (r.participant_details?.name || "").toLowerCase().includes(searchQuery);
        const emailMatch = (r.participant_details?.email || "").toLowerCase().includes(searchQuery);
        const phoneMatch = (r.participant_details?.phone || "").toLowerCase().includes(searchQuery);
        const collegeMatch = (r.participant_details?.college || "").toLowerCase().includes(searchQuery);
        const deptMatch = (r.participant_details?.department || "").toLowerCase().includes(searchQuery);
        const projectMatch = (r.participant_details?.project_title || "").toLowerCase().includes(searchQuery);
        return idMatch || nameMatch || emailMatch || phoneMatch || collegeMatch || deptMatch || projectMatch;
      });
    }

    // Sorting
    const sortParam = (req.query.sort || "newest").toLowerCase().trim();
    filtered.sort((a, b) => {
      if (sortParam === "oldest") {
        return new Date(a.submitted_at || 0) - new Date(b.submitted_at || 0);
      }
      if (sortParam === "name") {
        return (a.participant_details?.name || "").localeCompare(b.participant_details?.name || "");
      }
      // default: newest first
      return new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0);
    });

    // Compute live comprehensive statistics
    const todayStr = new Date().toISOString().slice(0, 10);
    let todayCount = 0;
    let verifiedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let totalDuplicates = 0;

    const eventCounts = {
      "project-exhibition": 0,
      "robo-war": 0,
      "robo-race": 0,
    };

    const exhibitionGroupCounts = {
      eklavya: 0,
      lakshya: 0,
      arjuna: 0,
      other: 0,
    };

    const collegeCounts = new Map();

    annotatedList.forEach((r) => {
      // Today count
      if (r.submitted_at && r.submitted_at.startsWith(todayStr)) {
        todayCount++;
      }

      // Status counts
      const st = (r.verification_status || "pending").toLowerCase();
      if (st === "verified") verifiedCount++;
      else if (st === "rejected") rejectedCount++;
      else pendingCount++;

      // Duplicate count
      if (r.is_duplicate) totalDuplicates++;

      // Event counts
      const eid = (r.event_id || "").toLowerCase();
      if (eventCounts[eid] !== undefined) {
        eventCounts[eid]++;
      } else {
        eventCounts[eid] = (eventCounts[eid] || 0) + 1;
      }

      // Exhibition groups
      if (eid === "project-exhibition") {
        const cat = (r.participant_details?.category || "").toLowerCase();
        if (cat.includes("eklavya")) exhibitionGroupCounts.eklavya++;
        else if (cat.includes("lakshya")) exhibitionGroupCounts.lakshya++;
        else if (cat.includes("arjuna")) exhibitionGroupCounts.arjuna++;
        else exhibitionGroupCounts.other++;
      }

      // Colleges
      const col = (r.participant_details?.college || "").trim();
      if (col) {
        collegeCounts.set(col, (collegeCounts.get(col) || 0) + 1);
      }
    });

    // Pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = req.query.limit === "all" ? filtered.length : Math.max(1, parseInt(req.query.limit, 10) || 25);
    const totalRecords = filtered.length;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedRegistrations = filtered.slice(startIndex, startIndex + limit);

    const lastLog = syncLogsStore[0];

    return res.status(200).json({
      success: true,
      total: totalRecords,
      totalAll: annotatedList.length,
      page,
      limit,
      totalPages,
      registrations: paginatedRegistrations,
      stats: {
        totalRegistrations: annotatedList.length,
        todayRegistrations: todayCount,
        verifiedRegistrations: verifiedCount,
        pendingRegistrations: pendingCount,
        rejectedRegistrations: rejectedCount,
        duplicateRegistrations: Math.floor(totalDuplicates / 2),
        eventCounts,
        exhibitionGroupCounts,
        lastSyncTime: lastLog ? lastLog.timestamp : null,
        syncHealth: lastLog && lastLog.status === "error" ? "warning" : "operational",
      },
      events: DEFAULT_EVENTS,
      recentLogs: syncLogsStore.slice(0, 15),
      collegesList: Array.from(collegeCounts.keys()).sort(),
    });
  }

  // =========================================================================
  // 2. POST: Webhook receiver for Google Apps Script / Google Forms & Bulk Sync
  // =========================================================================
  if (req.method === "POST") {
    if (!isAuthorizedSync(req)) {
      addSyncLog({
        status: "error",
        successful_records: 0,
        failed_records: 1,
        message: "Unauthorized webhook or sync attempt",
        error_details: "Invalid or missing integration secret / authorization header.",
      });
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid integration secret. Provide valid 'x-sync-secret' header or admin authorization.",
      });
    }

    const body = req.body || {};

    // 2.A. Admin "Sync Now" action or Ping Test
    if (req.query.action === "ping" || body.action === "ping") {
      const log = addSyncLog({
        status: "success",
        message: "Webhook connection verified successfully",
      });
      saveRegistrationsToDisk();
      return res.status(200).json({
        success: true,
        message: "Circuitron Webhook is active and reachable.",
        timestamp: new Date().toISOString(),
        totalRegistrations: registrationsStore.size,
      });
    }

    // 2.B. Handle Batch or Single Registrations
    const incomingItems = [];

    // Direct Google Sheets Sync (pulls rows directly from linked Google Sheets)
    if (req.query.action === "sync_sheets" || body.action === "sync_sheets") {
      const sheets = Array.isArray(body.sheets) ? body.sheets : [];
      if (process.env.GOOGLE_SHEET_EXHIBITION) {
        sheets.push({ url: process.env.GOOGLE_SHEET_EXHIBITION, event_id: "project-exhibition" });
      }
      if (process.env.GOOGLE_SHEET_ROBOTICS) {
        sheets.push({ url: process.env.GOOGLE_SHEET_ROBOTICS, event_id: "robo-war" });
      }

      for (const s of sheets) {
        if (!s || !s.url) continue;
        try {
          const items = await fetchGoogleSheetRows(s.url, s.event_id || "project-exhibition");
          incomingItems.push(...items);
        } catch (err) {
          console.warn("Google Sheet sync error for", s.url, err.message);
          addSyncLog({
            status: "error",
            event_id: s.event_id || "all",
            message: `Failed to fetch Google Sheet: ${err.message}`,
            error_details: err.message,
          });
        }
      }
    }

    if (Array.isArray(body.registrations)) {
      incomingItems.push(...body.registrations);
    } else if (body.named_values) {
      // Google Sheets onFormSubmit format
      const formResponses = {};
      for (const [k, v] of Object.entries(body.named_values)) {
        formResponses[k] = Array.isArray(v) ? v[0] : v;
      }
      incomingItems.push({
        event_id: body.event_id,
        source: body.source || "google_sheet",
        timestamp: body.timestamp || formResponses["Timestamp"],
        respondent_email: body.respondent_email || formResponses["Email Address"],
        form_responses: formResponses,
      });
    } else if (body.responses && Array.isArray(body.responses)) {
      // Google Form item responses array: [{ question, answer }]
      const formResponses = {};
      body.responses.forEach((item) => {
        if (item && item.question) {
          formResponses[item.question] = item.answer;
        }
      });
      incomingItems.push({
        event_id: body.event_id,
        source: body.source || "google_form",
        submission_id: body.submission_id,
        timestamp: body.timestamp,
        respondent_email: body.respondent_email,
        form_responses: formResponses,
      });
    } else if (body.form_responses || body.participant_details) {
      // Direct formatted single registration
      incomingItems.push(body);
    } else if (typeof body === "object" && Object.keys(body).length > 0) {
      // Generic flat key-value object (e.g. from Google Sheet row)
      const { event_id, source, submission_id, timestamp, ...otherFields } = body;
      incomingItems.push({
        event_id,
        source: source || "google_sheet_row",
        submission_id,
        timestamp: timestamp || otherFields["Timestamp"],
        respondent_email: otherFields["Email Address"] || otherFields["Email"],
        form_responses: otherFields,
      });
    }

    if (incomingItems.length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "No registration records found in request body.",
      });
    }

    let processedCount = 0;
    let newCount = 0;
    let updatedCount = 0;
    let duplicateCount = 0;

    for (const item of incomingItems) {
      const formResponses = item.form_responses || {};
      const respondentEmail = item.respondent_email || formResponses["Email Address"] || formResponses["Email"] || "";

      // Extract details
      const extracted = item.participant_details || extractParticipantDetails(formResponses, respondentEmail);

      // Determine Event
      const eventMeta = determineEvent(item.event_id, formResponses, item.form_url, item.form_title);

      const submittedAt = item.timestamp
        ? new Date(item.timestamp).toISOString()
        : new Date().toISOString();

      // Deduplication fingerprint
      const fingerprint = createSubmissionFingerprint(
        eventMeta.id,
        extracted.email,
        item.submission_id || extracted.phone || submittedAt
      );

      // Robust deduplication lookup
      const normEmail = (extracted.email || "").toLowerCase().trim();
      const rawPhone = (extracted.phone || "").replace(/[^0-9]/g, "");
      const normPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : "";

      let existingRecord = null;
      for (const reg of registrationsStore.values()) {
        const regEmail = (reg.participant_details?.email || "").toLowerCase().trim();
        const regRawPhone = (reg.participant_details?.phone || "").replace(/[^0-9]/g, "");
        const regPhone = regRawPhone.length >= 10 ? regRawPhone.slice(-10) : "";

        const sameSubmissionId = Boolean(item.submission_id && reg.submission_id === item.submission_id);
        const sameFingerprint = Boolean(reg.fingerprint && reg.fingerprint === fingerprint);
        const sameEvent = (reg.event_id || "").toLowerCase() === eventMeta.id.toLowerCase();
        const sameEmail = Boolean(sameEvent && normEmail && regEmail === normEmail);
        const samePhone = Boolean(sameEvent && normPhone && regPhone === normPhone);

        if (sameSubmissionId || sameFingerprint || sameEmail || samePhone) {
          existingRecord = reg;
          break;
        }
      }

      if (existingRecord) {
        // Safe update without duplicating
        existingRecord.form_responses = {
          ...existingRecord.form_responses,
          ...formResponses,
        };
        existingRecord.participant_details = {
          ...existingRecord.participant_details,
          ...extracted,
        };
        existingRecord.synced_at = new Date().toISOString();
        registrationsStore.set(existingRecord.registration_id, existingRecord);
        updatedCount++;
        duplicateCount++;
      } else {
        // Generate new Registration ID
        const eventAbbr = eventMeta.id.startsWith("robo-w")
          ? "RBW"
          : eventMeta.id.startsWith("robo-r")
          ? "RBR"
          : "EXP";
        const count = registrationsStore.size + 1;
        const regId = `REG-TX2-${eventAbbr}-${String(count).padStart(4, "0")}`;

        const newRegistration = {
          registration_id: regId,
          submission_id: item.submission_id || `sub_${Date.now()}_${fingerprint.slice(0, 8)}`,
          fingerprint,
          event_id: eventMeta.id,
          event_name: eventMeta.name,
          participant_details: extracted,
          form_responses: formResponses,
          submitted_at: submittedAt,
          synced_at: new Date().toISOString(),
          source: item.source || "google_form",
          sync_status: "synced",
          verification_status: item.verification_status || "pending",
          admin_notes: item.admin_notes || "",
        };

        registrationsStore.set(regId, newRegistration);
        newCount++;
      }
      processedCount++;
    }

    // Persist to Disk & Cloud KV
    saveRegistrationsToDisk();
    if (kv) {
      try {
        await saveToKv(kv, "circuitron:registrations", Array.from(registrationsStore.values()));
        await saveToKv(kv, "circuitron:sync_logs", syncLogsStore.slice(-100));
      } catch (err) {}
    }

    // Record sync log
    addSyncLog({
      status: "success",
      successful_records: newCount,
      failed_records: 0,
      duplicate_records: duplicateCount,
      message: `Processed ${processedCount} registration(s): ${newCount} new, ${updatedCount} updated.`,
    });

    return res.status(200).json({
      success: true,
      processed: processedCount,
      newRecords: newCount,
      updatedRecords: updatedCount,
      duplicates: duplicateCount,
      totalStored: registrationsStore.size,
      message: `Successfully synchronized ${processedCount} registration(s).`,
    });
  }

  // =========================================================================
  // 3. PATCH: Update Verification Status or Admin Notes
  // =========================================================================
  if (req.method === "PATCH") {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Valid administrator authorization required to update registration records.",
      });
    }

    const { registrationId, verificationStatus, adminNotes } = req.body || {};
    if (!registrationId || !registrationsStore.has(registrationId)) {
      return res.status(404).json({
        error: "Not Found",
        message: `Registration ID '${registrationId}' was not found.`,
      });
    }

    const reg = registrationsStore.get(registrationId);
    if (verificationStatus) {
      const validStatuses = ["pending", "verified", "rejected"];
      if (validStatuses.includes(verificationStatus.toLowerCase())) {
        reg.verification_status = verificationStatus.toLowerCase();
      }
    }

    if (adminNotes !== undefined) {
      reg.admin_notes = sanitizeText(adminNotes, 1000);
    }

    reg.updated_at = new Date().toISOString();
    registrationsStore.set(registrationId, reg);

    saveRegistrationsToDisk();
    if (kv) {
      try {
        await saveToKv(kv, "circuitron:registrations", Array.from(registrationsStore.values()));
      } catch (err) {}
    }

    return res.status(200).json({
      success: true,
      registration: reg,
      message: "Registration updated successfully.",
    });
  }

  // =========================================================================
  // 4. DELETE: Remove Registration (Admin only)
  // =========================================================================
  if (req.method === "DELETE") {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Valid administrator authorization required to delete registration records.",
      });
    }

    const targetId = (req.query.id || req.body?.id || "").trim();
    if (!targetId || !registrationsStore.has(targetId)) {
      return res.status(404).json({
        error: "Not Found",
        message: `Registration ID '${targetId}' was not found.`,
      });
    }

    registrationsStore.delete(targetId);
    saveRegistrationsToDisk();
    if (kv) {
      try {
        await saveToKv(kv, "circuitron:registrations", Array.from(registrationsStore.values()));
      } catch (err) {}
    }

    addSyncLog({
      status: "success",
      message: `Deleted registration record ${targetId}`,
    });

    return res.status(200).json({
      success: true,
      message: `Registration '${targetId}' was deleted.`,
      totalStored: registrationsStore.size,
    });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
