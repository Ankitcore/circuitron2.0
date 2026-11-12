/**
 * Client-Side Registration Service for TechXpo 2.O / Circuitron Admin Portal
 * Connects securely to /api/registrations using SHA-256 admin session credentials
 */

import { getAdminAuthToken } from "./adminAuth";

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

  return await res.json();
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

  return await res.json();
}

export function downloadRegistrationsCsv(eventId = "all") {
  const token = getAdminAuthToken();
  const url = `/api/registrations?format=csv&event=${encodeURIComponent(eventId)}`;

  // Create temporary link with Authorization
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
