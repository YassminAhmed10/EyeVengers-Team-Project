import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

export default function PageHero({
  eyebrow,
  title,
  description,
  actionLabel,
  actionTo,
}) {
  return (
    <section className="page-hero">
      {eyebrow && (
        <motion.p
          className="page-hero__eyebrow"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          {eyebrow}
        </motion.p>
      )}

      <motion.h1
        className="page-hero__title"
        variants={fadeUp}
        custom={0.1}
        initial="hidden"
        animate="visible"
      >
        {title}
      </motion.h1>

      {description && (
        <motion.p
          className="page-hero__description"
          variants={fadeUp}
          custom={0.2}
          initial="hidden"
          animate="visible"
        >
          {description}
        </motion.p>
      )}

      {actionLabel && actionTo && (
        <motion.div
          className="page-hero__action"
          variants={fadeUp}
          custom={0.3}
          initial="hidden"
          animate="visible"
        >
          <Link to={actionTo} className="btn-primary">
            {actionLabel}
          </Link>
        </motion.div>
      )}
    </section>
  );
}