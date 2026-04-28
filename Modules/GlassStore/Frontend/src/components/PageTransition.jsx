// src/components/PageTransition/PageTransition.jsx
// ضيف الملف ده في: src/components/PageTransition/PageTransition.jsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// ======================================================
// Variants للـ page transition الرئيسي
// Fade + Slide من تحت لفوق مع scale خفيف
// ======================================================
const pageVariants = {
  initial: {
    opacity: 0,
    y: 40,
    scale: 0.98,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier (ease out expo)
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.99,
    filter: "blur(2px)",
    transition: {
      duration: 0.4,
      ease: [0.55, 0, 1, 0.45],
    },
  },
};

// ======================================================
// Overlay transition — شريط أزرق بيتحرك فوق الصفحة
// بيدي الإحساس إن في "loading" حقيقي
// ======================================================
const overlayVariants = {
  initial: { scaleX: 0, originX: 0 },
  animate: {
    scaleX: [0, 1, 1, 0],
    originX: ["0%", "0%", "100%", "100%"],
    transition: {
      duration: 0.9,
      times: [0, 0.4, 0.6, 1],
      ease: "easeInOut",
    },
  },
};

// ======================================================
// PageTransition — الـ wrapper الرئيسي
// استخدامه: <PageTransition key={location.pathname}> ... </PageTransition>
// ======================================================
const PageTransition = ({ children, showOverlay = true }) => {
  return (
    <>
      {/* Overlay شريط اللون */}
      {showOverlay && (
        <motion.div
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #3b82f6, #60a5fa, #2563eb)",
            zIndex: 9999,
            transformOrigin: "left",
          }}
        />
      )}

      {/* محتوى الصفحة */}
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default PageTransition;


// ======================================================
// SectionReveal — لكل section داخل الصفحة
// بيستخدم whileInView عشان يظهر لما يدخل الـ viewport
// ======================================================
export const SectionReveal = ({
  children,
  delay = 0,
  direction = "up", // "up" | "down" | "left" | "right" | "none"
  duration = 0.7,
  className = "",
  style = {},
}) => {
  const directionMap = {
    up:    { y: 60, x: 0 },
    down:  { y: -60, x: 0 },
    left:  { x: 60, y: 0 },
    right: { x: -60, y: 0 },
    none:  { x: 0, y: 0 },
  };

  const offset = directionMap[direction] || directionMap.up;

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, ...offset, filter: "blur(3px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
};


// ======================================================
// StaggerChildren — بيعمل stagger على أي قائمة عناصر
// مثال: feature cards, product cards
// ======================================================
export const StaggerChildren = ({
  children,
  staggerDelay = 0.08,
  className = "",
  style = {},
}) => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      style={style}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};


// ======================================================
// HeroTextReveal — animation خاص بـ hero title
// كل سطر ييجي من تحت بـ stagger
// ======================================================
export const HeroTextReveal = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, skewY: 2 }}
      animate={{ opacity: 1, y: 0, skewY: 0 }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
};


// ======================================================
// ScaleOnHover — لأي عنصر تحب يكبر لما تـ hover عليه
// ======================================================
export const ScaleOnHover = ({
  children,
  scale = 1.04,
  className = "",
  style = {},
}) => {
  return (
    <motion.div
      className={className}
      style={{ ...style, cursor: "pointer" }}
      whileHover={{ scale, transition: { duration: 0.3, ease: "easeOut" } }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.div>
  );
};