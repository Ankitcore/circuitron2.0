import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, CheckCircle2, Sparkles, X, QrCode } from "lucide-react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

/**
 * Robust parsing of scanned QR code content.
 * Extracts TechXpo member ID while strictly preserving rich URL query parameters
 * (name, role, department, tier, photo CDN URL) for instantaneous cross-device authentication.
 */
export function parseScannedQrCode(decodedText = "") {
  if (!decodedText) return null;
  const text = String(decodedText).trim();

  let id = "";
  let search = "";

  // 1. Check if it's a full URL (e.g. https://circuitron2-0.vercel.app/verify/TX2-EX-7264?n=...&img=...)
  try {
    const url = new URL(text);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const verifyIdx = pathParts.findIndex((p) => p.toLowerCase() === "verify");

    if (verifyIdx !== -1 && pathParts[verifyIdx + 1]) {
      id = pathParts[verifyIdx + 1].trim().toUpperCase();
    } else if (url.searchParams.get("id")) {
      id = url.searchParams.get("id").trim().toUpperCase();
    } else {
      const match = text.match(/TX2-[A-Z]{2}-[0-9A-Z]+/i);
      if (match) id = match[0].toUpperCase();
    }

    search = url.search || "";
  } catch (err) {
    // Not a standard URL
  }

  // 2. Check for query parameters in non-URL strings like "TX2-EX-7264?n=..."
  if (!id) {
    const qIdx = text.indexOf("?");
    if (qIdx !== -1) {
      const beforeQ = text.slice(0, qIdx);
      const afterQ = text.slice(qIdx);
      const match = beforeQ.match(/TX2-[A-Z]{2}-[0-9A-Z]+/i);
      if (match) {
        id = match[0].toUpperCase();
        search = afterQ;
      }
    }
  }

  // 3. Direct TechXpo ID pattern match
  if (!id) {
    const idMatch = text.match(/TX2-[A-Z]{2}-[0-9A-Z]+/i);
    if (idMatch) {
      id = idMatch[0].toUpperCase();
    }
  }

  // 4. Fallback to clean trimmed uppercase alphanumeric string
  if (!id) {
    id = text.replace(/[^A-Za-z0-9_-]/g, "").toUpperCase();
  }

  if (!id) return null;

  return {
    id,
    path: `/verify/${id}${search}`,
    search,
    fullUrl: text,
  };
}

/**
 * Play futuristic audio beep upon successful scan
 */
export function playScanBeep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.17);
  } catch (e) {
    // Silently ignore if audio context is blocked
  }
}

export default function MemberQrScanner({ onScanSuccess, isModal = false, onClose }) {
  const [successResult, setSuccessResult] = useState(null);
  const elementIdRef = useRef(`techxpo-scanner-${Math.random().toString(36).substring(2, 9)}`);
  const elementId = elementIdRef.current;
  const scannerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // Small delay to ensure the container is firmly mounted in DOM
    const timer = setTimeout(() => {
      if (!isMounted) return;
      const targetEl = document.getElementById(elementId);
      if (!targetEl) return;

      try {
        const scanner = new Html5QrcodeScanner(
          elementId,
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const edge = Math.max(180, Math.floor(minEdge * 0.75));
              return { width: edge, height: edge };
            },
            rememberLastUsedCamera: true,
            supportedScanTypes: [
              Html5QrcodeScanType.SCAN_TYPE_CAMERA,
              Html5QrcodeScanType.SCAN_TYPE_FILE,
            ],
          },
          false
        );

        scannerRef.current = scanner;

        scanner.render(
          (decodedText) => {
            const parsed = parseScannedQrCode(decodedText);
            if (parsed && parsed.id) {
              playScanBeep();
              setSuccessResult(parsed.id);

              try {
                scanner.pause(true);
              } catch (e) {}

              setTimeout(() => {
                if (onScanSuccess) {
                  onScanSuccess(parsed);
                }
              }, 400);
            }
          },
          (error) => {
            // Pass frame scan
          }
        );
      } catch (err) {
        console.error("Scanner init error:", err);
      }
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch((e) => console.warn("Scanner clear error:", e));
        } catch (e) {}
        scannerRef.current = null;
      }
    };
  }, [elementId, onScanSuccess]);

  return (
    <div className="glass-card rounded-3xl border-2 border-primary/30 p-5 sm:p-7 bg-darkNavy/95 shadow-[0_0_50px_rgba(0,229,255,0.15)] relative overflow-hidden">
      
      {/* Reticle Ambience */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Scoped CSS styling for Html5QrcodeScanner components */}
      <style>{`
        #${elementId} {
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
        }
        #${elementId} img {
          filter: invert(1) hue-rotate(180deg) brightness(1.2);
          margin: 0.75rem auto !important;
          max-width: 64px !important;
        }
        #${elementId} button {
          background: linear-gradient(135deg, #00e5ff 0%, #0077ff 100%) !important;
          color: #050816 !important;
          font-family: 'Orbitron', sans-serif !important;
          font-weight: 800 !important;
          font-size: 0.75rem !important;
          letter-spacing: 0.05em !important;
          padding: 0.75rem 1.5rem !important;
          border-radius: 0.85rem !important;
          border: none !important;
          cursor: pointer !important;
          box-shadow: 0 0 20px rgba(0, 229, 255, 0.4) !important;
          margin: 0.5rem auto !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
        }
        #${elementId} button:hover {
          transform: scale(1.04) !important;
          box-shadow: 0 0 30px rgba(0, 229, 255, 0.7) !important;
        }
        #${elementId} select {
          background: #0a1128 !important;
          color: #00e5ff !important;
          border: 1px solid rgba(0, 229, 255, 0.4) !important;
          padding: 0.6rem 1rem !important;
          border-radius: 0.75rem !important;
          font-family: monospace !important;
          font-size: 0.8rem !important;
          margin: 0.5rem auto !important;
          max-width: 90% !important;
        }
        #${elementId} a {
          color: #00e5ff !important;
          font-family: monospace !important;
          font-size: 0.75rem !important;
          text-decoration: underline !important;
          margin: 0.5rem auto !important;
          display: inline-block !important;
        }
        #${elementId} video {
          border-radius: 1.25rem !important;
          object-fit: cover !important;
          width: 100% !important;
        }
        #${elementId}__scan_region {
          border-radius: 1.25rem !important;
          overflow: hidden !important;
          background: rgba(0,0,0,0.6) !important;
        }
        #${elementId}__header_message {
          display: none !important;
        }
      `}</style>

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-primary/20 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-accent shadow-sm flex-shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
                OPTICAL VERIFICATION
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black font-orbitron text-white">
              Scan Member Badge QR
            </h3>
          </div>
        </div>

        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scanner Mount Viewport */}
      <div className="pt-4 relative min-h-[300px]">
        
        {/* Html5QrcodeScanner Container */}
        <div id={elementId} className="w-full text-center" />

        {/* Decode Success Overlay */}
        {successResult && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 bg-darkNavy/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 rounded-3xl"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-10 h-10 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                MEMBER CREDENTIAL IDENTIFIED
              </span>
              <div className="text-2xl font-black font-orbitron text-white mt-1">
                {successResult}
              </div>
            </div>
            <p className="text-gray-300 text-xs font-mono animate-pulse">
              Loading cryptographic clearance dossier...
            </p>
          </motion.div>
        )}
      </div>

      {/* Informational Guidance */}
      <div className="pt-3 border-t border-primary/10 mt-4 text-[11px] font-mono text-gray-400 flex items-center justify-center space-x-2 text-center">
        <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0" />
        <span>Position the badge QR code in the camera frame, or click "Scan an Image File"</span>
      </div>
    </div>
  );
}
