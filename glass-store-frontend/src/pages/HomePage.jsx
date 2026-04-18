import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ThreeScene from "../components/ThreeScene";
import ProductsSlider from "../components/ProductsSlider";
import transitionsVideo from "../assets/TRANSITIONS_D.WEBM";
import bluelightVideo from "../assets/BLUELIGHT_D.WEBM";
import sunVideo from "../assets/SUN_D.WEBM";
import "./HomePage.css";
import {
  IoMdCube,
  IoMdPeople,
  IoMdGlasses,
  IoMdArrowForward,
  IoMdPlay,
} from "react-icons/io";
import { FaShieldAlt, FaTachometerAlt, FaStar } from "react-icons/fa";
import { MdOutlineColorLens, MdOutlineLocalShipping } from "react-icons/md";
import { SiVirtualbox } from "react-icons/si";

import speedyBg from "/src/assets/GL_HP_Omnichannel_D.jpg";

gsap.registerPlugin(ScrollTrigger);

const lensData = [
  {
    key: "Transitions®",
    title: "Transitions®",
    desc: "They quickly darken in sunlight and fade back to clear indoors: protecting you from UV rays and filtering blue-violet light. Available in prescription and non-prescription glasses.",
    video: transitionsVideo,
  },
  {
    key: "Blue-violet light",
    title: "Blue-violet light lenses",
    desc: "Designed to reduce exposure to blue-violet light from natural and artificial sources. Available in prescription and non-prescription glasses.",
    video: bluelightVideo,
  },
  {
    key: "Prescription sun",
    title: "Prescription sun",
    desc: "Protect your eyes from the sun, without compromising on your vision needs. Choose prescription sun lenses on any frame.",
    video: sunVideo,
  },
];

const HomePage = ({ adultProducts = [], kidsProducts = [] }) => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const videoRefs = useRef([]);

  const allProducts = [...adultProducts, ...kidsProducts];

  const [activeLensIndex, setActiveLensIndex] = useState(0);

  const handleLensClick = (index) => {
    if (index === activeLensIndex) return;
    setActiveLensIndex(index);
  };

  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (v) v.play().catch(() => {});
    });
  }, []);

  useEffect(() => {
    gsap.to(".hero-content", {
      y: 50,
      scrollTrigger: {
        trigger: ".hero",
        scrub: true,
      },
    });
  }, []);

  const features = [
    {
      icon: <SiVirtualbox size={40} color="#3b82f6" />,
      title: "Virtual Try-On",
      desc: "See exactly how each frame looks on your face with our AR-powered mirror technology.",
    },
    {
      icon: <FaShieldAlt size={40} color="#3b82f6" />,
      title: "Lifetime Guarantee",
      desc: "Every pair backed by our lifetime warranty.",
    },
    {
      icon: <FaTachometerAlt size={40} color="#3b82f6" />,
      title: "Same-Day Lenses",
      desc: "Get lenses within hours, not weeks.",
    },
    {
      icon: <MdOutlineColorLens size={40} color="#3b82f6" />,
      title: "Blue Light Shield",
      desc: "Protect your eyes from screens.",
    },
    {
      icon: <IoMdCube size={40} color="#3b82f6" />,
      title: "100+ Frames",
      desc: "Premium designs & exclusive styles.",
    },
    {
      icon: <MdOutlineLocalShipping size={40} color="#3b82f6" />,
      title: "Free Delivery",
      desc: "Orders above EGP 1,500 delivered free.",
    },
  ];

  return (
    <div className="home">

      {/* HERO */}
      <section ref={heroRef} className="hero">
        <ThreeScene />
        <div className="hero-overlay" />

        <div className="hero-container">
          <div className="hero-content">

            <h1 className="hero-title">
              See the World in <span className="gradient-text">Style</span>
            </h1>

            <p className="hero-text">
              Premium eyewear crafted for modern lifestyle.
            </p>

            <div className="hero-buttons">
              <button
                className="btn-primary-large"
                onClick={() => navigate("/shop")}
              >
                Shop Now <IoMdArrowForward />
              </button>

              <button className="btn-secondary">
                <IoMdPlay /> Watch Demo
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">50K+</span>
                <span className="stat-label">
                  <IoMdPeople /> Customers
                </span>
              </div>

              <div className="stat-item">
                <span className="stat-value">100+</span>
                <span className="stat-label">
                  <IoMdGlasses /> Frames
                </span>
              </div>

              <div className="stat-item">
                <span className="stat-value">4.9★</span>
                <span className="stat-label">
                  <FaStar /> Rating
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES WITH BACKGROUND */}
      <section
        className="speedy-delivery"
        style={{ backgroundImage: `url(${speedyBg})` }}
      >
        <div className="container">

          <div className="section-header">
            <span className="section-tag">Why OptiStore</span>

            <h2 className="section-title">
              Everything You Need for <span className="gradient-text">Perfect Vision</span>
            </h2>

            <p className="section-subtitle">
              From cutting-edge lens technology to world-class service.
            </p>
          </div>

          <div className="speedy-grid">
            {features.map((f, i) => (
              <div key={i} className="speedy-card">
                <div className="speedy-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* PRODUCTS — homePage prop hides Try On & Add to Cart */}
      <section className="products-section">
        <div className="container">
          <ProductsSlider products={allProducts} homePage={true} />
        </div>
      </section>

      {/* LENS TYPES */}
      <section className="lens-types">
        <div className="lens-types__box">

          {/* All 3 videos stacked — active one fades in, others fade out */}
          {lensData.map((lens, i) => (
            <video
              key={lens.key}
              ref={(el) => (videoRefs.current[i] = el)}
              className="lens-types__bg-video"
              style={{ opacity: i === activeLensIndex ? 1 : 0 }}
              loop
              muted
              playsInline
              autoPlay
            >
              <source src={lens.video} type="video/mp4" />
            </video>
          ))}

          {/* Content grid sits on top of videos */}
          <div className="lens-types__content">

            <div className="lens-types__col">
              <h2 className="lens-types__main-title">Our lenses</h2>
              <ul className="lens-types__options">
                {lensData.map((lens, i) => (
                  <li
                    key={lens.key}
                    className={`lens-types__option ${activeLensIndex === i ? "lens-types__option--active" : ""}`}
                    onClick={() => handleLensClick(i)}
                  >
                    {lens.key}
                  </li>
                ))}
              </ul>
              <button className="lens-types__discover-btn">Discover all lenses</button>
            </div>

            {/* Empty middle column — video shows through */}
            <div className="lens-types__col" />

            <div className="lens-types__col">
              <h3 className="lens-types__content-title">
                {lensData[activeLensIndex].title}
              </h3>
              <p className="lens-types__content-desc">
                {lensData[activeLensIndex].desc}
              </p>
              <button className="lens-types__shop-btn">
                Shop {lensData[activeLensIndex].title}
              </button>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;