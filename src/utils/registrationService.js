/**
 * Client-Side Registration Service for TechXpo 2.O / Circuitron Admin Portal
 * Connects securely to /api/registrations using SHA-256 admin session credentials
 * Hybrid Persistence: Synchronizes serverless API with browser LocalStorage cache
 */

import { getAdminAuthToken } from "./adminAuth";

const REGISTRATIONS_CACHE_KEY = "tx2_registrations_cache";

export function getLocalRegistrationsCache() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REGISTRATIONS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalRegistrationsCache(list) {
  if (typeof window === "undefined" || !Array.isArray(list)) return;
  try {
    localStorage.setItem(REGISTRATIONS_CACHE_KEY, JSON.stringify(list));
  } catch (e) {}
}

export async function fetchRegistrations(params = {}) {
  const token = getAdminAuthToken();
  const query = new URLSearchParams();

  if (params.event && params.event !== "all") query.set("event", params.event);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.college && params.college !== "all") query.set("college", params.college);
  if (params.duplicate && params.duplicate !== "all") query.set("duplicate", params.duplicate);
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`/api/registrations?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-admin-auth": token,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch registrations (HTTP ${res.status})`);
  }

  const data = await res.json();
  const serverList = data.registrations || [];
  const localList = getLocalRegistrationsCache();

  // If server is clean/restarted but browser has cached registrations, re-hydrate server
  if (
    serverList.length === 0 &&
    localList.length > 0 &&
    !params.search &&
    (!params.event || params.event === "all") &&
    (!params.status || params.status === "all")
  ) {
    submitRegistrationBatch(localList).catch(() => {});
    return {
      ...data,
      total: localList.length,
      totalAll: localList.length,
      registrations: localList,
      stats: {
        ...data.stats,
        totalRegistrations: localList.length,
        todayRegistrations: localList.filter((r) => r.submitted_at?.startsWith(new Date().toISOString().slice(0, 10))).length,
        eventCounts: {
          "project-exhibition": localList.filter((r) => r.event_id === "project-exhibition").length,
          "robo-war": localList.filter((r) => r.event_id === "robo-war").length,
          "robo-race": localList.filter((r) => r.event_id === "robo-race").length,
        },
      },
    };
  }

  // Merge server records into local cache
  if (serverList.length > 0) {
    const regMap = new Map();
    localList.forEach((r) => {
      if (r && r.registration_id) regMap.set(r.registration_id, r);
    });
    serverList.forEach((r) => {
      if (r && r.registration_id) regMap.set(r.registration_id, r);
    });
    saveLocalRegistrationsCache(Array.from(regMap.values()));
  }

  return data;
}

export async function updateRegistration(registrationId, { verificationStatus, adminNotes }) {
  const token = getAdminAuthToken();

  const res = await fetch("/api/registrations", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-admin-auth": token,
    },
    body: JSON.stringify({
      registrationId,
      verificationStatus,
      adminNotes,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update registration (HTTP ${res.status})`);
  }

  // Update local cache
  const localList = getLocalRegistrationsCache();
  const idx = localList.findIndex((r) => r.registration_id === registrationId);
  if (idx !== -1) {
    if (verificationStatus) localList[idx].verification_status = verificationStatus;
    if (adminNotes !== undefined) localList[idx].admin_notes = adminNotes;
    saveLocalRegistrationsCache(localList);
  }

  return await res.json();
}

export async function deleteRegistration(registrationId) {
  const token = getAdminAuthToken();

  const res = await fetch(`/api/registrations?id=${encodeURIComponent(registrationId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-admin-auth": token,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete registration (HTTP ${res.status})`);
  }

  // Remove from local cache
  const localList = getLocalRegistrationsCache().filter((r) => r.registration_id !== registrationId);
  saveLocalRegistrationsCache(localList);

  return await res.json();
}

export async function triggerManualSync() {
  const token = getAdminAuthToken();

  const res = await fetch("/api/registrations?action=ping", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-admin-auth": token,
    },
    body: JSON.stringify({ action: "ping" }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Manual sync check failed");
  }

  return await res.json();
}

export async function submitRegistrationBatch(registrations, eventId = "project-exhibition") {
  const token = getAdminAuthToken();

  const res = await fetch("/api/registrations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-admin-auth": token,
    },
    body: JSON.stringify({
      event_id: eventId,
      source: "admin_manual_import",
      registrations,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Import failed");
  }

  // Update local cache
  const localList = getLocalRegistrationsCache();
  const map = new Map();
  localList.forEach((r) => {
    if (r && r.registration_id) map.set(r.registration_id, r);
  });
  registrations.forEach((r) => {
    if (r && (r.registration_id || r.submission_id)) {
      map.set(r.registration_id || r.submission_id, r);
    }
  });
  saveLocalRegistrationsCache(Array.from(map.values()));

  return await res.json();
}

export function downloadRegistrationsCsv(eventId = "all") {
  const token = getAdminAuthToken();
  const url = `/api/registrations?format=csv&event=${encodeURIComponent(eventId)}`;

  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-admin-auth": token,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("CSV Export Failed");
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `Circuitron_Registrations_${eventId}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch((err) => {
      alert("Error downloading CSV: " + err.message);
    });
}


export async function syncGoogleSheetsDirect(sheets = []) {
  const token = getAdminAuthToken();

  const res = await fetch("/api/registrations?action=sync_sheets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-admin-auth": token,
    },
    body: JSON.stringify({
      action: "sync_sheets",
      sheets,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to sync Google Sheets.");
  }

  return await res.json();
}
