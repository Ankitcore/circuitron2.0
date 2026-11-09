import React, { useEffect } from "react";
import MemberQrScanner from "./MemberQrScanner";

export default function QrScannerModal({ isOpen, onClose, onScanSuccess }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <MemberQrScanner
          isModal={true}
          onClose={onClose}
          onScanSuccess={(result) => {
            onClose();
            if (onScanSuccess) {
              onScanSuccess(result);
            }
          }}
          autoStart={true}
        />
      </div>
    </div>
  );
}
