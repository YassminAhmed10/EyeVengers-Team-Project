import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./Footer.css";

const footerLinks = {
  Collections: [
    { label: "Shop", to: "/shop" },
    { label: "Search", to: "/search" },
    { label: "Size Guide", to: "/size-guide" },
    { label: "Virtual Try-On", to: "/virtual-try-on" },
    { label: "Fit Assistant", to: "/fit-assistant" },
  ],
  Support: [
    { label: "Returns Center", to: "/returns-center" },
    { label: "Help Center", to: "/help-center" },
    { label: "Shipping & Returns", to: "/shipping-returns" },
    { label: "Warranty", to: "/warranty" },
    { label: "FAQ", to: "/faq" },
    { label: "Contact Us", to: "/contact" },
  ],
};

const trustPills = ["Free Shipping 500+ EGP", "14-Day Return", "1-Year Warranty"];
const paymentMarks = ["VISA", "Mastercard", "Apple Pay", "Cash on Delivery"];
const socialIcons = ["language", "share", "public"];
const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Cookies", to: "/cookies" },
];

const MotionDiv = motion.div;
const MotionSpan = motion.span;

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay, ease: "easeOut" },
  }),
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <MotionDiv
          className="footer__content"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="footer__topbar">
            {trustPills.map((item, index) => (
              <MotionSpan
                key={item}
                className="footer__pill"
                variants={rise}
                custom={index * 0.05}
              >
                {item}
              </MotionSpan>
            ))}
          </div>

          <div className="footer__grid">
            <MotionDiv className="footer__brand" variants={rise} custom={0.08}>
              <div className="footer__logo">
                <div>
                  <svg fill="none" viewBox="0 0 48 48">
                    <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
                  </svg>
                </div>
                <h2 className="footer__logo-text">AURA</h2>
              </div>

              <p className="footer__description">
                Redefining perspective through modern eyewear. Crafted for comfort, confidence, and
                all-day clarity.
              </p>

              <div className="footer__contact">
                <span>Support: +20 100 000 0000</span>
                <span>Email: support@aura-eg.com</span>
              </div>

              <div className="footer__socials">
                {socialIcons.map((icon) => (
                  <a key={icon} href="#" className="footer__social-link" aria-label={icon}>
                    <span className="material-symbols-outlined">{icon}</span>
                  </a>
                ))}
              </div>
            </MotionDiv>

            {Object.entries(footerLinks).map(([title, links], index) => (
              <MotionDiv key={title} variants={rise} custom={0.12 + index * 0.06}>
                <h4 className="footer__col-title">{title}</h4>
                <ul className="footer__links">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="footer__link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </MotionDiv>
            ))}

            <MotionDiv variants={rise} custom={0.24}>
              <h4 className="footer__col-title">Newsletter</h4>
              <p className="footer__newsletter-text">
                Get launches, style edits, and member-only discounts.
              </p>
              <div className="footer__newsletter-form">
                <input className="footer__newsletter-input" placeholder="Enter your email" type="email" />
                <button className="footer__newsletter-btn">Join</button>
              </div>
              <p className="footer__newsletter-note">No spam. Unsubscribe anytime.</p>
            </MotionDiv>
          </div>

          <div className="footer__payments">
            {paymentMarks.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="footer__bottom">
            <p className="footer__copyright">© 2026 AURA Eyewear. All rights reserved.</p>
            <div className="footer__legal">
              {legalLinks.map((item) => (
                <Link key={item.label} to={item.to} className="footer__legal-link">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </MotionDiv>
      </div>
    </footer>
  );
}