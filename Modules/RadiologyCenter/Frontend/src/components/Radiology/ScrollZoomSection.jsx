import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollZoomSection({
  as = "section",
  className = "",
  children,
  startScale = 0.9,
  midScale = 1.02,
  endScale = 0.96,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 15%"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [startScale, midScale, endScale]);
  const opacity = useTransform(scrollYProgress, [0, 0.14, 0.86, 1], [0.28, 1, 1, 0.74]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [42, 0, -34]);
  const rotateZ = useTransform(scrollYProgress, [0, 0.5, 1], [-0.9, 0, 0.9]);

  const MotionTag = motion[as] ?? motion.section;

  return (
    <MotionTag ref={ref} className={`${className} framer-zoom-section`} style={{ scale, opacity, y, rotateZ }}>
      {children}
    </MotionTag>
  );
}
