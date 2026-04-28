import { motion } from "framer-motion";

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

export default function Hero() {
  return (
    <motion.section
      className="hero"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.09, delayChildren: 0.12 }}
    >
      <div className="hero__inner">
        <div className="hero__content">
          <motion.span className="hero__eyebrow" variants={item} transition={{ duration: 0.45 }}>
            The 2024 Collection
          </motion.span>
          <motion.h2 className="hero__title" variants={item} transition={{ duration: 0.45 }}>
            Premium Eyewear
          </motion.h2>
          <motion.p className="hero__description" variants={item} transition={{ duration: 0.45 }}>
            Discover our curated selection of modern, luxurious frames designed for every face.
            Handcrafted with precision and sustainable materials.
          </motion.p>
        </div>
        <motion.button
          className="btn-primary"
          variants={item}
          transition={{ duration: 0.45 }}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View All Frames
        </motion.button>
      </div>
    </motion.section>
  );
}
