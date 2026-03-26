import { Environment, Float, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./App.css";

// ─── EASING ──────────────────────────────────────────────────────────────────
const easeApple = [0.16, 1, 0.3, 1];

// ─── 3D SCENE ────────────────────────────────────────────────────────────────
const GlassGyroscope = ({ isMobile }) => {
  const groupRef = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();
  const sphereRef = useRef();
  const lightRef = useRef();
  const timeRef = useRef(0);
  const currentScale = useRef(0);
  const target = useRef(new THREE.Vector2(0, 0));

  const targetScale = isMobile ? 0.6 : 0.9;

  useEffect(() => {
    const move = (x, y) => {
      target.current.x = (x / window.innerWidth) * 2 - 1;
      target.current.y = -(y / window.innerHeight) * 2;
    };
    const onMouse = (e) => move(e.clientX, e.clientY);
    const onTouch = (e) => {
      if (e.touches.length > 0) move(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    currentScale.current = THREE.MathUtils.damp(currentScale.current, targetScale, 2, delta);
    const unfold = 1 - Math.pow(1 - Math.min(t * 0.5, 1), 4);

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, target.current.x * 1.5, 2, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, target.current.y * 1.5, 2, delta);
    state.camera.lookAt(0, 0, 0);

    if (lightRef.current) {
      lightRef.current.position.set(
        THREE.MathUtils.lerp(lightRef.current.position.x, target.current.x * 10, delta * 4),
        THREE.MathUtils.lerp(lightRef.current.position.y, target.current.y * 10, delta * 4),
        5,
      );
    }

    if (ring1.current) {
      ring1.current.rotation.x = t * 0.4 * unfold;
      ring1.current.rotation.z = Math.sin(t) * 0.15 * unfold;
    }
    if (ring2.current) {
      ring2.current.rotation.y = (t * 0.2 + Math.PI / 4) * unfold;
      ring2.current.rotation.x = Math.cos(t * 0.5) * 0.2 * unfold;
    }
    if (ring3.current) {
      ring3.current.rotation.z = (t * 0.1 + Math.PI / 2) * unfold;
      ring3.current.rotation.y = Math.sin(t * 0.3) * 0.15 * unfold;
    }
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * 0.05;
      sphereRef.current.rotation.x = t * 0.02;
    }

    if (groupRef.current) {
      groupRef.current.scale.setScalar(currentScale.current);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, target.current.x * 0.3, 2, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, -target.current.y * 0.3, 2, delta);
    }
  });

  const glass = { transmission: 1, thickness: 1.5, roughness: 0.05, ior: 1.4, chromaticAberration: 0.06, clearcoat: 1, clearcoatRoughness: 0.1, color: "#ffffff", resolution: isMobile ? 512 : 1024 };

  return (
    <>
      <pointLight ref={lightRef} intensity={80} distance={20} color="#ffffff" />
      <ambientLight intensity={0.8} />
      <spotLight position={[-10, 10, -10]} intensity={3} angle={0.4} penumbra={1} color="#ffffff" />
      <spotLight position={[10, -10, -10]} intensity={1.5} angle={0.4} penumbra={1} color="#e0f2fe" />

      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        <group ref={groupRef}>
          <mesh ref={sphereRef}>
            <sphereGeometry args={[1, 64, 64]} />
            <MeshTransmissionMaterial {...glass} thickness={2} ior={1.6} />
          </mesh>
          <mesh ref={ring1}>
            <torusGeometry args={[1.45, 0.03, 64, 128]} />
            <MeshTransmissionMaterial {...glass} />
          </mesh>
          <mesh ref={ring2}>
            <torusGeometry args={[1.85, 0.03, 64, 128]} />
            <MeshTransmissionMaterial {...glass} />
          </mesh>
          <mesh ref={ring3}>
            <torusGeometry args={[2.25, 0.03, 64, 128]} />
            <MeshTransmissionMaterial {...glass} />
          </mesh>
        </group>
      </Float>

      <Environment resolution={isMobile ? 256 : 512}>
        <Lightformer form="rect" intensity={2} position={[0, 10, 0]} scale={[20, 2, 1]} target={[0, 0, 0]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[-10, 0, -10]} scale={[2, 20, 1]} target={[0, 0, 0]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[10, 0, -10]} scale={[2, 20, 1]} target={[0, 0, 0]} color="#ffffff" />
        <Lightformer form="ring" intensity={1} position={[0, -5, -20]} scale={[10, 10, 1]} target={[0, 0, 0]} color="#ffffff" />
      </Environment>
    </>
  );
};

// ─── SCROLL REVEAL WRAPPER ───────────────────────────────────────────────────
const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: easeApple, delay }}
    >
      {children}
    </motion.div>
  );
};

// ─── NAVIGATION ──────────────────────────────────────────────────────────────
const NavBar = ({ isMobile }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const links = ["About", "Stack", "Work", "Contact"];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goto = (id) => {
    setOpen(false);
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      className={`kp-nav${scrolled ? " kp-nav--scrolled" : ""}`}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: easeApple }}
    >
      {/* Logo */}
      <button className="kp-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <span className="kp-logo__mark">KP</span>
        {!isMobile && <span className="kp-logo__name">KRISHNA PILATO</span>}
      </button>

      {/* Desktop links */}
      {!isMobile && (
        <div className="kp-nav__links">
          {links.map((l) => (
            <button key={l} className="kp-nav__link" onClick={() => goto(l)}>{l}</button>
          ))}
        </div>
      )}

      {/* Mobile toggle */}
      {isMobile && (
        <button className={`kp-burger${open ? " kp-burger--open" : ""}`} onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      )}

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && isMobile && (
          <motion.div
            className="kp-drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: easeApple }}
          >
            {links.map((l) => (
              <button key={l} className="kp-drawer__link" onClick={() => goto(l)}>{l}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// ─── HERO ────────────────────────────────────────────────────────────────────
const HeroSection = ({ isMobile }) => (
  <section id="hero" className="kp-hero">
    {/* 3D canvas — pointer-events off so scroll passes through */}
    <motion.div
      className="kp-hero__canvas"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3, ease: easeApple }}
    >
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 9], fov: 35 }}>
        <GlassGyroscope isMobile={isMobile} />
      </Canvas>
    </motion.div>

    {/* Text overlay */}
    <div className="kp-hero__overlay">
      <motion.p
        className="kp-hero__role"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5, ease: easeApple }}
      >
        Full-Stack Java Developer
      </motion.p>

      <motion.h1
        className="kp-hero__title"
        initial={{ opacity: 0, filter: "blur(20px)", y: 30 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 1.5, ease: easeApple }}
      >
        KRISHNA<br />
        <span className="kp-hero__title--bold">PILATO</span>
      </motion.h1>
    </div>

    {/* Scroll cue */}
    <motion.div
      className="kp-hero__scroll"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.2, duration: 1 }}
    >
      <span className="kp-hero__scroll-label">Scroll</span>
      <motion.div
        className="kp-hero__scroll-line"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  </section>
);

// ─── ABOUT ───────────────────────────────────────────────────────────────────
const AboutSection = ({ isMobile }) => {
  const cards = [
    { icon: "⬡", title: "Backend Architecture", desc: "Designing scalable, high-performance systems with Java & Spring Boot." },
    { icon: "◎", title: "Frontend Craft", desc: "Building modern, responsive interfaces with React and a sharp eye for detail." },
    { icon: "△", title: "Full-Stack Vision", desc: "Bridging server and client seamlessly — from DB design to pixel-perfect UI." },
  ];
  return (
    <section id="about" className={`kp-section${isMobile ? " kp-section--mobile" : ""}`}>
      <div className="kp-section__inner">
        <Reveal><p className="kp-label">01 / About</p></Reveal>

        <div className={`kp-about__grid${isMobile ? " kp-about__grid--mobile" : ""}`}>
          <Reveal delay={0.1}>
            <h2 className="kp-heading">
              Crafting digital <em>experiences</em> through code.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="kp-body">
              I&apos;m Krishna Pilato — a full-stack developer with a passion for building clean, high-performance web applications. From robust Java backends to polished React frontends, I bring ideas to life with precision and intent.
            </p>
          </Reveal>
        </div>

        <div className="kp-cards">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={0.08 * (i + 1)}>
              <motion.div className="kp-card" whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }} transition={{ duration: 0.2 }}>
                <span className="kp-card__icon">{c.icon}</span>
                <h3 className="kp-card__title">{c.title}</h3>
                <p className="kp-card__desc">{c.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── STACK ───────────────────────────────────────────────────────────────────
const StackSection = ({ isMobile }) => {
  const groups = [
    { cat: "Backend",       items: ["Java", "Spring Boot", "Spring Security", "Hibernate", "JPA", "REST APIs"] },
    { cat: "Frontend",      items: ["React", "JavaScript", "TypeScript", "Three.js", "Framer Motion", "CSS3"] },
    { cat: "Data & Cloud",  items: ["PostgreSQL", "MySQL", "Redis", "Docker", "AWS", "CI/CD"] },
  ];
  return (
    <section id="stack" className={`kp-section kp-section--tinted${isMobile ? " kp-section--mobile" : ""}`}>
      <div className="kp-section__inner">
        <Reveal><p className="kp-label">02 / Stack</p></Reveal>
        <Reveal delay={0.05}>
          <h2 className="kp-heading kp-heading--spaced">Technologies I work with.</h2>
        </Reveal>

        <div className={`kp-stack__grid${isMobile ? " kp-stack__grid--mobile" : ""}`}>
          {groups.map((g, gi) => (
            <Reveal key={g.cat} delay={0.1 * gi}>
              <p className="kp-sublabel">{g.cat}</p>
              <div className="kp-badges">
                {g.items.map((tech, ti) => (
                  <motion.span
                    key={tech}
                    className="kp-badge"
                    initial={{ opacity: 0, scale: 0.88 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: ti * 0.04, ease: easeApple }}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.22)" }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── WORK ────────────────────────────────────────────────────────────────────
const WorkSection = ({ isMobile }) => {
  const projects = [
    {
      num: "01", year: "2025",
      cat: "Full-Stack Web App", title: "Portfolio Platform",
      desc: "Modern portfolio built with React, Three.js, and a Java Spring Boot backend — showcasing 3D visuals and dynamic content.",
      stack: ["React", "Three.js", "Spring Boot", "PostgreSQL"],
    },
    {
      num: "02", year: "2024",
      cat: "Backend Architecture", title: "E-Commerce Engine",
      desc: "High-performance e-commerce engine with inventory management, payment processing, and real-time analytics.",
      stack: ["Java", "Spring Boot", "Redis", "PostgreSQL"],
    },
    {
      num: "03", year: "2024",
      cat: "API Design", title: "REST API Gateway",
      desc: "Scalable API gateway with JWT authentication, rate limiting, request routing, and comprehensive documentation.",
      stack: ["Spring Security", "Java", "Docker", "AWS"],
    },
  ];

  return (
    <section id="work" className={`kp-section${isMobile ? " kp-section--mobile" : ""}`}>
      <div className="kp-section__inner">
        <Reveal><p className="kp-label">03 / Work</p></Reveal>
        <Reveal delay={0.05}>
          <h2 className="kp-heading kp-heading--spaced">Selected projects.</h2>
        </Reveal>

        <div className="kp-work__list">
          {projects.map((p, i) => (
            <Reveal key={p.num} delay={0.05 * i}>
              <motion.div
                className={`kp-project${isMobile ? " kp-project--mobile" : ""}`}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
                transition={{ duration: 0.2 }}
              >
                <span className="kp-project__num">{p.num}</span>
                <div>
                  <p className="kp-project__cat">{p.cat}</p>
                  <h3 className="kp-project__title">{p.title}</h3>
                </div>
                <p className="kp-project__desc">{p.desc}</p>
                <div className={`kp-project__meta${isMobile ? " kp-project__meta--mobile" : ""}`}>
                  <span className="kp-project__year">{p.year}</span>
                  <div className="kp-project__tags">
                    {p.stack.map((s) => <span key={s} className="kp-project__tag">{s}</span>)}
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
          <div className="kp-divider" />
        </div>
      </div>
    </section>
  );
};

// ─── CONTACT ─────────────────────────────────────────────────────────────────
const ContactSection = ({ isMobile }) => {
  const contacts = [
    { label: "Email",    val: "krishna@pilato.dev",         href: "mailto:krishna@pilato.dev" },
    { label: "GitHub",   val: "github.com/krishnapilato",    href: "https://github.com/krishnapilato" },
    { label: "LinkedIn", val: "linkedin.com/in/krishnapilato", href: "https://linkedin.com/in/krishnapilato" },
  ];

  return (
    <section id="contact" className={`kp-section kp-section--tinted${isMobile ? " kp-section--mobile" : ""}`}>
      <div className="kp-section__inner">
        <Reveal><p className="kp-label">04 / Contact</p></Reveal>

        <div className={`kp-contact__grid${isMobile ? " kp-contact__grid--mobile" : ""}`}>
          <Reveal delay={0.1}>
            <h2 className="kp-heading kp-heading--xl">
              Let&apos;s build something <em>great</em> together.
            </h2>
            <p className="kp-body kp-body--dim">
              Open to freelance projects, full-time opportunities, and interesting collaborations.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="kp-contact__links">
              {contacts.map((c) => (
                <motion.a
                  key={c.label}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kp-contact__row"
                  whileHover={{ x: 8, color: "#ffffff" }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="kp-contact__label">{c.label}</span>
                  <span className="kp-contact__val">{c.val}</span>
                </motion.a>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

// ─── FOOTER ──────────────────────────────────────────────────────────────────
const SiteFooter = ({ isMobile }) => (
  <footer className={`kp-footer${isMobile ? " kp-footer--mobile" : ""}`}>
    <p className="kp-footer__copy">© 2025 Krishna Pilato. All rights reserved.</p>
    <p className="kp-footer__built">Designed &amp; built with React + Three.js</p>
  </footer>
);

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="kp-root">
      <NavBar isMobile={isMobile} />
      <HeroSection isMobile={isMobile} />
      <AboutSection isMobile={isMobile} />
      <StackSection isMobile={isMobile} />
      <WorkSection isMobile={isMobile} />
      <ContactSection isMobile={isMobile} />
      <SiteFooter isMobile={isMobile} />
    </div>
  );
}