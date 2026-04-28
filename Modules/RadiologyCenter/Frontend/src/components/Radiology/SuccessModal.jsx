import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export default function SuccessModal({ isOpen, message = "Success!", onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11, 26, 52, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: 28,
              padding: "56px 64px 48px",
              textAlign: "center",
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 40px 80px rgba(11,26,52,0.25), 0 0 0 1px rgba(31,107,255,0.08)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top gradient bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 5,
              background: "linear-gradient(90deg, #1f6bff, #00b8a8)",
            }} />

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                position: "absolute", top: 18, right: 18,
                width: 34, height: 34, borderRadius: "50%",
                background: "rgba(0,0,0,0.05)", border: "none",
                cursor: "pointer", fontSize: 18, color: "#adb5bd",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              ×
            </motion.button>

            {/* Animated circle with checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
              style={{ marginBottom: 28 }}
            >
              <div style={{
                width: 100, height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #e8f5ff, #e0faf7)",
                border: "3px solid rgba(0,184,168,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto",
              }}>
                <motion.svg
                  width="52" height="52" viewBox="0 0 52 52"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                >
                  <motion.circle
                    cx="26" cy="26" r="24"
                    fill="none"
                    stroke="url(#grad)"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1f6bff" />
                      <stop offset="100%" stopColor="#00b8a8" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M14 26l9 9 16-18"
                    fill="none"
                    stroke="url(#grad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                  />
                </motion.svg>
              </div>
            </motion.div>

            {/* Message */}
            <motion.h3
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              style={{
                fontSize: 26, fontWeight: 800, color: "#0b1a34",
                marginBottom: 10, fontFamily: "'Outfit', sans-serif",
                letterSpacing: "-0.5px",
              }}
            >
              {message}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              style={{ fontSize: 14, color: "#6f86a3", marginBottom: 32 }}
            >
              You will be redirected to the home page shortly
            </motion.p>

            {/* Progress bar */}
            <motion.div style={{
              height: 4, borderRadius: 4,
              background: "rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "linear" }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #1f6bff, #00b8a8)",
                  borderRadius: 4,
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}