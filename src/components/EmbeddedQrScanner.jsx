import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  Play,
  Square,
  SwitchCamera,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { parseScannedQrCode } from "./QrScannerModal";

function playScanBeep() {
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
    // No-op if audio context is blocked
  }
}

export default function EmbeddedQrScanner({ onScanSuccess }) {
  const [activeMode, setActiveMode] = useState("camera"); // "camera" | "upload"
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [detectedId, setDetectedId] = useState(null);

  const html5QrCodeRef = useRef(null);
  const readerElementId = "embedded-techxpo-qr-reader";
  const fileInputRef = useRef(null);

  // Discover available cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          const backCamera = devices.find(
            (c) =>
              c.label.toLowerCase().includes("back") ||
              c.label.toLowerCase().includes("rear") ||
              c.label.toLowerCase().includes("environment")
          );
          setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
        } else {
          setCameras([]);
        }
      })
      .catch((err) => {
        console.warn("Could not list video devices:", err);
      });
  }, []);

  // Manage scanner lifecycle
  useEffect(() => {
    if (activeMode !== "camera") {
      stopCamera();
      return;
    }

    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        startCamera(selectedCameraId);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, [activeMode, selectedCameraId]);

  const startCamera = async (cameraId) => {
    setScannerError("");
    const element = document.getElementById(readerElementId);
    if (!element) return;

    try {
      await stopCamera();

      const qrScanner = new Html5Qrcode(readerElementId);
      html5QrCodeRef.current = qrScanner;

      const config = cameraId
        ? { deviceId: { exact: cameraId } }
        : { facingMode: "environment" };

      await qrScanner.start(
        config,
        {
          fps: 12,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleDecode(decodedText);
        },
        () => {
          // frame scan failure
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.warn("Camera start warning:", err);
      setIsScanning(false);
      const str = String(err).toLowerCase();
      if (str.includes("permission") || str.includes("denied")) {
        setScannerError(
          "Camera access is blocked. Please allow camera permissions in your browser or switch to 'Upload QR Image'."
        );
      } else if (str.includes("no camera") || str.includes("notfound")) {
        setScannerError("No camera detected. You can upload an image of the ID card QR code below.");
      } else {
        setScannerError(
          "Camera stream could not start. Please ensure no other app is using your webcam, or use the image upload option."
        );
      }
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        // ignore teardown warning
      } finally {
        html5QrCodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const handleDecode = (text) => {
    const id = parseScannedQrCode(text);
    if (!id) return;

    playScanBeep();
    setDetectedId(id);
    stopCamera();

    setTimeout(() => {
      onScanSuccess(id);
    }, 600);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannerError("");
    setIsProcessingFile(true);

    try {
      const fileScanner = new Html5Qrcode("embedded-file-reader-dummy");
      const decodedText = await fileScanner.scanFile(file, false);
      fileScanner.clear();
      setIsProcessingFile(false);

      if (decodedText) {
        handleDecode(decodedText);
      } else {
        setScannerError("No valid QR code found in this image. Please upload a clear photo.");
      }
    } catch (err) {
      setIsProcessingFile(false);
      setScannerError("Could not detect a valid QR code in this image. Please upload a clearer snapshot.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="glass-card rounded-3xl border-2 border-primary/30 p-6 sm:p-8 space-y-6 relative overflow-hidden bg-darkNavy/90 shadow-[0_0_50px_rgba(0,229,255,0.15)]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-primary/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent p-0.5 shadow-neon flex-shrink-0">
            <div className="w-full h-full bg-darkNavy rounded-[10px] flex items-center justify-center">
              <Camera className="w-5 h-5 text-accent animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
                LIVE OPTICAL AUTHENTICATOR
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h3 className="text-lg sm:text-xl font-black font-orbitron text-white">
              Scan ID Card QR Code
            </h3>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-darkNavy/90 p-1 rounded-xl border border-primary/20 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode("camera")}
            className={`py-1.5 px-3 rounded-lg text-xs font-orbitron font-bold flex items-center space-x-1.5 transition-all ${
              activeMode === "camera"
                ? "bg-accent text-darkNavy shadow-neon"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("upload")}
            className={`py-1.5 px-3 rounded-lg text-xs font-orbitron font-bold flex items-center space-x-1.5 transition-all ${
              activeMode === "upload"
                ? "bg-accent text-darkNavy shadow-neon"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      {/* Camera Dropdown if multiple cameras detected */}
      {activeMode === "camera" && cameras.length > 1 && (
        <div className="flex items-center justify-between text-xs font-mono text-gray-300">
          <span className="text-gray-400 flex items-center space-x-1">
            <SwitchCamera className="w-3.5 h-3.5 text-accent" />
            <span>Select Camera:</span>
          </span>
          <select
            value={selectedCameraId}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="bg-darkNavy border border-primary/30 rounded-xl px-3 py-1.5 text-accent text-xs font-mono focus:outline-none focus:border-accent max-w-[240px]"
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label || `Camera ${c.id.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Viewfinder Viewport */}
      <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-primary/40 aspect-square max-w-[340px] mx-auto flex items-center justify-center shadow-inner">
        {activeMode === "camera" ? (
          <>
            <div id={readerElementId} className="w-full h-full overflow-hidden" />

            {/* Cyber Reticle HUD */}
            {isScanning && !detectedId && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
                <div className="w-full flex justify-between">
                  <div className="w-8 h-8 border-t-2 border-l-2 border-accent rounded-tl-lg" />
                  <div className="w-8 h-8 border-t-2 border-r-2 border-accent rounded-tr-lg" />
                </div>

                <motion.div
                  animate={{ y: [-80, 80, -80] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-48 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00e5ff]"
                />

                <div className="w-full flex justify-between">
                  <div className="w-8 h-8 border-b-2 border-l-2 border-accent rounded-bl-lg" />
                  <div className="w-8 h-8 border-b-2 border-r-2 border-accent rounded-br-lg" />
                </div>
              </div>
            )}
          </>
        ) : (
          /* Upload Viewport */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.02] transition-colors border-2 border-dashed border-primary/30 rounded-2xl"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-white font-bold font-orbitron text-sm mb-1">
              Select or Drop QR Code Photo
            </h4>
            <p className="text-gray-400 text-xs font-mono max-w-[200px]">
              Upload a snapshot of a digital or physical TechXpo ID badge
            </p>

            {isProcessingFile && (
              <div className="mt-4 flex items-center space-x-2 text-accent text-xs font-mono font-bold animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Decoding QR Code...</span>
              </div>
            )}
          </div>
        )}

        {/* Scan Success Overlay */}
        {detectedId && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 bg-darkNavy/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-10 h-10 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                CREDENTIAL VALIDATED
              </span>
              <div className="text-2xl font-black font-orbitron text-white mt-1">
                {detectedId}
              </div>
            </div>
            <p className="text-gray-300 text-xs font-mono">
              Opening official dossier...
            </p>
          </motion.div>
        )}
      </div>

      {/* Hidden dummy node for file scanning */}
      <div id="embedded-file-reader-dummy" className="hidden" />

      {/* Error Notice */}
      {scannerError && (
        <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs leading-relaxed max-w-md mx-auto">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1">
            <span>{scannerError}</span>
            {activeMode === "camera" && (
              <button
                type="button"
                onClick={() => setActiveMode("upload")}
                className="block text-accent underline mt-1 font-semibold hover:text-white"
              >
                Switch to file upload instead &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center space-y-1">
        <p className="text-xs text-gray-400 font-mono flex items-center justify-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Point your device camera at the blue QR code stamped on the ID card</span>
        </p>
      </div>
    </div>
  );
}
