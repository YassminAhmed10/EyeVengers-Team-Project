import { useEffect, useState } from "react";

export default function useGlobalUiMotion(page, showSendModal) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setScrollProgress(Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [page]);

  useEffect(() => {
    const candidates = document.querySelectorAll(
      ".section, .page-header, .card, .booking-panel, .booking-sidebar, .contact-form-wrap, .result-row, .step-item, .trust-item, .faq-item, .cinematic-card",
    );
    const revealItems = [];

    candidates.forEach((el, idx) => {
      if (el.dataset.motionBound === "true") {
        return;
      }
      el.dataset.motionBound = "true";
      el.classList.add("reveal-item");
      el.style.setProperty("--reveal-delay", `${(idx % 10) * 56}ms`);
      revealItems.push(el);
    });

    if (typeof window.IntersectionObserver !== "function") {
      revealItems.forEach((el) => el.classList.add("is-visible"));
      return undefined;
    }

    let observer;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
      );

      revealItems.forEach((el) => observer.observe(el));
    } catch {
      revealItems.forEach((el) => el.classList.add("is-visible"));
      return undefined;
    }

    return () => observer.disconnect();
  }, [page, showSendModal]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target.closest(
        "button, .card, .chip, .time-slot, .result-btn, .nav-link, .doctor-btn, .send-option, .svc-arrow, .footer-col a, .step-tab",
      );

      if (!target) {
        return;
      }

      target.classList.remove("press-pop");
      // Force reflow so repeated clicks restart the animation.
      void target.offsetWidth;
      target.classList.add("press-pop");
      const cleanup = () => target.classList.remove("press-pop");
      target.addEventListener("animationend", cleanup, { once: true });
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return scrollProgress;
}
