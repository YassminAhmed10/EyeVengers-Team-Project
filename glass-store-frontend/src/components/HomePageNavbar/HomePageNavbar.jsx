import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import "./HomePageNavbar.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    // GSAP Animation on mount
    gsap.fromTo(navbarRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );
    
    gsap.fromTo(logoRef.current,
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)", delay: 0.3 }
    );
    
    linksRef.current.forEach((link, index) => {
      gsap.fromTo(link,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, delay: 0.5 + index * 0.1, ease: "power3.out" }
      );
    });
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav ref={navbarRef} className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <h1 ref={logoRef} className="logo">Opti<span>Store</span></h1>

        <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
          {["Home", "Shop", "Try On", "Contact"].map((link, index) => (
            <a 
              key={link} 
              href="#"
              ref={el => linksRef.current[index] = el}
            >
              {link}
            </a>
          ))}
        </div>

        <button className="btn-primary">Login</button>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;