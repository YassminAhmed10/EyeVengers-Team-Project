import { useLocation } from "react-router-dom";
import PageHero from "../components/PageHero";
import PlaceholderImage from "../components/PlaceholderImage";

const PAGE_CONTENT = {
  "/about": {
    eyebrow: "About",
    title: "Crafted For Clarity",
    description: "Aura designs modern eyewear that combines comfort, precision, and premium materials.",
    bullets: [
      "Handpicked frame materials and durable hinges",
      "Lens options for digital, outdoor, and prescription needs",
      "Local support with easy exchanges and returns",
    ],
  },
  "/contact": {
    eyebrow: "Contact",
    title: "We Are Here To Help",
    description: "Reach us through phone, WhatsApp, or email for fitting and prescription support.",
    bullets: [
      "Phone: +20 100 000 0000",
      "WhatsApp: +20 100 000 0000",
      "Email: support@aura-eg.com",
    ],
  },
  "/faq": {
    eyebrow: "FAQ",
    title: "Frequently Asked Questions",
    description: "Quick answers about size, prescription, shipping, and warranty.",
    bullets: [
      "How can I know my frame size?",
      "Can I upload a prescription image?",
      "How long does delivery usually take?",
      "What is your exchange policy?",
    ],
  },
  "/shipping-returns": {
    eyebrow: "Policy",
    title: "Shipping & Returns",
    description: "Clear shipping times and easy return rules for every order.",
    bullets: [
      "Cairo and Giza: 2-4 business days",
      "Other governorates: 3-6 business days",
      "Returns accepted within 14 days if unused",
    ],
  },
  "/warranty": {
    eyebrow: "Policy",
    title: "Warranty Coverage",
    description: "Every frame includes quality warranty and support.",
    bullets: [
      "365-day warranty against manufacturing defects",
      "Covers hinge and material failures",
      "Does not cover accidental damage",
    ],
  },
  "/privacy": {
    eyebrow: "Legal",
    title: "Privacy Policy",
    description: "How we collect, store, and process your personal data.",
    bullets: [
      "Data used only for order processing and support",
      "Payment data handled by secure providers",
      "You can request deletion of your account data",
    ],
  },
  "/terms": {
    eyebrow: "Legal",
    title: "Terms of Service",
    description: "Rules and conditions for using Aura website and services.",
    bullets: [
      "Product details may change without notice",
      "Orders can be cancelled before shipping",
      "Misuse of services may lead to account restrictions",
    ],
  },
  "/cookies": {
    eyebrow: "Legal",
    title: "Cookie Policy",
    description: "Information about analytics and preference cookies.",
    bullets: [
      "Necessary cookies keep checkout and login working",
      "Analytics cookies help improve user experience",
      "You can manage cookie preferences in your browser",
    ],
  },
};

export default function ContentPage() {
  const location = useLocation();
  const page = PAGE_CONTENT[location.pathname] ?? PAGE_CONTENT["/about"];

  return (
    <main className="main container">
      <PageHero eyebrow={page.eyebrow} title={page.title} description={page.description} />

      <section className="content-layout">
        <div>
          <ul className="content-list">
            {page.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <PlaceholderImage label={`${page.title} image placeholder`} ratio="4 / 3" />
      </section>
    </main>
  );
}
