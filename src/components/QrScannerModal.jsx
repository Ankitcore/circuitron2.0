import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 w-full max-w-lg max-h-[95vh] overflow-y-auto"
        >
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
