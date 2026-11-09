/**
 * Admin Authentication & Passkey Security Utility
 *
 * Secures administrator passkeys using cryptographic SHA-256 hashing.
 * Plaintext passkeys are NEVER stored in source files, client bundles, or version control.
 *
 * NIST FIPS 180-4 compliant SHA-256 implementation runs synchronously across all environments
 * (secure HTTPS, local dev, LAN IP, and mobile browsers).
 */

/**
 * Standard SHA-256 hash function (NIST FIPS 180-4 compliant).
 * Converts input string to 64-character lowercase hexadecimal hash.
 *
 * @param {string} str - Input string to hash
 * @returns {string} 64-character lowercase hexadecimal SHA-256 hash
 */
export function sha256(str) {
  if (typeof str !== "string") return "";

  function rotr(n, x) {
    return (x >>> n) | (x << (32 - n));
  }
  function ch(x, y, z) {
    return (x & y) ^ (~x & z);
  }
  function maj(x, y, z) {
    return (x & y) ^ (x & z) ^ (y & z);
  }
  function sigma0(x) {
    return rotr(2, x) ^ rotr(13, x) ^ rotr(22, x);
  }
  function sigma1(x) {
    return rotr(6, x) ^ rotr(11, x) ^ rotr(25, x);
  }
  function gamma0(x) {
    return rotr(7, x) ^ rotr(18, x) ^ (x >>> 3);
  }
  function gamma1(x) {
    return rotr(17, x) ^ rotr(19, x) ^ (x >>> 10);
  }

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  // Encode UTF-8
  const utf8 = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < utf8.length; i++) {
    bytes.push(utf8.charCodeAt(i));
  }

  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) {
    bytes.push(0);
  }

  // 64-bit length in big-endian
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  for (let i = 3; i >= 0; i--) bytes.push((hi >>> (i * 8)) & 0xff);
  for (let i = 3; i >= 0; i--) bytes.push((lo >>> (i * 8)) & 0xff);

  for (let i = 0; i < bytes.length; i += 64) {
    const W = new Array(64);
    for (let t = 0; t < 16; t++) {
      W[t] =
        (bytes[i + t * 4] << 24) |
        (bytes[i + t * 4 + 1] << 16) |
        (bytes[i + t * 4 + 2] << 8) |
        bytes[i + t * 4 + 3];
    }
    for (let t = 16; t < 64; t++) {
      W[t] = (gamma1(W[t - 2]) + W[t - 7] + gamma0(W[t - 15]) + W[t - 16]) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;

    for (let t = 0; t < 64; t++) {
      const T1 = (h + sigma1(e) + ch(e, f, g) + K[t] + W[t]) >>> 0;
      const T2 = (sigma0(a) + maj(a, b, c)) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + T1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (T1 + T2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  return H.map((val) => (val >>> 0).toString(16).padStart(8, "0")).join("");
}

// Pre-computed SHA-256 cryptographic hashes of authorized administrator passkeys.
// Plaintext passkeys are NEVER kept in this file or any bundled build artifact.
const AUTHORIZED_PASSKEY_HASHES = [
  "b284b7a6daa1835eaedeb129fb9b756a9b22db51cba64f70aebe58b5ec4de5f5", // primary admin passkey hash
  "47cf068a4e03e066ee6cfcc19fdee108f9b140e05752063c233d9bc5f5cd5278", // admin passkey hash
];

// Optional environment variable configuration (e.g. from Vercel / .env)
const envHashes =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_ADMIN_PASSKEY_HASHES
    ? import.meta.env.VITE_ADMIN_PASSKEY_HASHES.split(",")
        .map((h) => h.trim().toLowerCase())
        .filter(Boolean)
    : [];

const envPasskeyHash =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_ADMIN_PASSKEY
    ? sha256(import.meta.env.VITE_ADMIN_PASSKEY.trim().toLowerCase())
    : null;

const ALL_AUTHORIZED_HASHES = new Set([
  ...AUTHORIZED_PASSKEY_HASHES,
  ...envHashes,
  ...(envPasskeyHash ? [envPasskeyHash] : []),
]);

/**
 * Verifies whether the provided passcode matches any authorized encrypted passkey hash.
 *
 * @param {string} input - The passcode entered by the user
 * @returns {boolean} True if passkey matches an authorized hash, false otherwise
 */
export function verifyAdminPasskey(input) {
  if (!input || typeof input !== "string") return false;
  const normalized = input.trim().toLowerCase();
  if (!normalized) return false;
  const computedHash = sha256(normalized);
  return ALL_AUTHORIZED_HASHES.has(computedHash);
}

export const ADMIN_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes auto-logout
export const ADMIN_STORAGE_KEY = "tx2_admin_authenticated";
export const ADMIN_LAST_ACTIVE_KEY = "tx2_admin_last_active";

/**
 * Record / refresh administrator activity timestamp.
 * Resets the 30-minute idle countdown.
 */
export function touchAdminActivity() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_LAST_ACTIVE_KEY, Date.now().toString());
  } catch (e) {
    // Ignore storage write issues
  }
}

/**
 * Get remaining session validity in milliseconds.
 * Returns 0 if expired or not logged in.
 */
export function getAdminInactivityRemainingMs() {
  if (typeof window === "undefined") return 0;
  try {
    const isAuth = localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
    if (!isAuth) return 0;

    const lastActiveStr = localStorage.getItem(ADMIN_LAST_ACTIVE_KEY);
    if (!lastActiveStr) return 0;

    const lastActive = parseInt(lastActiveStr, 10);
    if (isNaN(lastActive)) return 0;

    const elapsed = Date.now() - lastActive;
    const remaining = ADMIN_TIMEOUT_MS - elapsed;
    return remaining > 0 ? remaining : 0;
  } catch (e) {
    return 0;
  }
}

/**
 * Check if active administrator session exists and has NOT expired due to 30 min idle.
 * Automatically purges the session if 30 minutes have elapsed.
 * @returns {boolean}
 */
export function isAdminAuthenticated() {
  if (typeof window === "undefined") return false;
  try {
    const isAuth = localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
    if (!isAuth) return false;

    const lastActiveStr = localStorage.getItem(ADMIN_LAST_ACTIVE_KEY);
    if (!lastActiveStr) {
      // If flag is present without timestamp, initialize now
      touchAdminActivity();
      return true;
    }

    const lastActive = parseInt(lastActiveStr, 10);
    const now = Date.now();
    if (isNaN(lastActive) || now - lastActive > ADMIN_TIMEOUT_MS) {
      // 30 minutes elapsed without use -> auto-logout
      clearAdminSession();
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Persists administrator session in storage and stamps current time.
 */
export function setAdminSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, "true");
    localStorage.setItem(ADMIN_LAST_ACTIVE_KEY, Date.now().toString());
    window.dispatchEvent(new CustomEvent("tx2_admin_auth_changed", { detail: { authenticated: true } }));
  } catch (e) {
    console.error("Failed to save admin session:", e);
  }
}

/**
 * Clears administrator session and activity stamp from storage.
 */
export function clearAdminSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_LAST_ACTIVE_KEY);
    window.dispatchEvent(new CustomEvent("tx2_admin_auth_changed", { detail: { authenticated: false } }));
  } catch (e) {
    console.error("Failed to remove admin session:", e);
  }
}
