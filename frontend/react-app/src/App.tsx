import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CloudCog,
  Code2,
  Globe,
  MapPin,
  ServerCog,
} from "lucide-react";
import { BootSequence } from "./components/BootSequence";
import { useLenis } from "./hooks/useLenis";

gsap.registerPlugin(ScrollTrigger);

const PORTFOLIO_OWNER_NAME = "Khova Krishna Pilato";
const CONTACT_EMAIL = "krishnak.pilato@gmail.com";

const storyChapters = [
  {
    chapter: "01",
    title: "Origin",
    headline: "Born in India. Raised in Italy. Built across cultures.",
    copy: "My path combines Indian roots with an Italian upbringing. That perspective shapes how I collaborate in international teams and build software that stays clear for both users and stakeholders.",
  },
  {
    chapter: "02",
    title: "Identity Bridge",
    headline: "4 years of delivery across finance, insurance, automotive, and energy.",
    copy: "From consulting contexts to product delivery, I focus on reliability, maintainability, and clean communication between frontend, backend, and business requirements.",
  },
  {
    chapter: "03",
    title: "Capability",
    headline: "Java-first systems thinking. Full-stack execution.",
    copy: "I build resilient services with Java and Spring Boot, design responsive Angular interfaces, and ship through Docker and CI/CD practices with a strong focus on testing and performance.",
  },
] as const;

const capabilityPillars = [
  {
    icon: ServerCog,
    title: "Backend Systems",
    points: "Java 8+, Spring Boot, microservices architecture, REST APIs, and event-driven integration patterns.",
  },
  {
    icon: Code2,
    title: "Frontend Craft",
    points: "Angular 10-21, Angular 18 + Material CDK, reusable components, and responsive UI for real-time workflows.",
  },
  {
    icon: CloudCog,
    title: "Delivery Ops",
    points: "Docker, AWS fundamentals, CI/CD pipelines, Agile Scrum delivery, and clean-code testing discipline.",
  },
] as const;

const careerPathEntries = [
  {
    title: "IoT and Utility Billing Delivery",
    timeframe: "Capgemini Engineering · Jan 2022 - Jan 2024",
    summary:
      "Maintained an electricity billing platform with Java 8, Oracle DB, and GWT, then moved into a full-stack role on a Bosch R&D IoT project with end-to-end feature ownership.",
    stack: "Java 8 · Oracle DB · GWT · Full-Stack Delivery",
  },
  {
    title: "Enterprise CRM Evolution",
    timeframe: "Intesa Sanpaolo · Jan 2024 - Apr 2025",
    summary:
      "Enhanced the Custody CRM application with new features and performance improvements across Angular, Java, Spring Boot, and MongoDB in a high-accountability consulting context.",
    stack: "Angular · Java · Spring Boot · MongoDB",
  },
  {
    title: "Insurance Operations Platform",
    timeframe: "Fincons Group · Apr 2025 - Jun 2025",
    summary:
      "Supported a critical insurance delivery phase by developing responsive Angular 12 interfaces and ensuring clean integration with Spring and Mule services.",
    stack: "Angular · Spring · Mule · REST APIs",
  },
  {
    title: "Pharma Packaging Experience",
    timeframe: "SEA Vision · Jul 2025 - Apr 2026",
    summary:
      "Designed and developed high-performance interfaces with Angular 18 and Material CDK for pharmaceutical packaging software, optimizing reusable components and real-time data views.",
    stack: "Angular 18 · Material CDK · Real-time UI",
  },
] as const;

export default function App() {
  useLenis();
  const careerTrackRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [canScrollCareerLeft, setCanScrollCareerLeft] = useState(false);
  const [canScrollCareerRight, setCanScrollCareerRight] = useState(true);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to("[data-drift='slow']", {
        yPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: ".atlas-shell",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      gsap.to("[data-drift='fast']", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: ".atlas-shell",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 56 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const track = careerTrackRef.current;

    if (!track) {
      return;
    }

    const updateScrollAvailability = () => {
      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      setCanScrollCareerLeft(track.scrollLeft > 2);
      setCanScrollCareerRight(track.scrollLeft < maxScrollLeft - 2);
    };

    updateScrollAvailability();
    track.addEventListener("scroll", updateScrollAvailability);
    window.addEventListener("resize", updateScrollAvailability);

    return () => {
      track.removeEventListener("scroll", updateScrollAvailability);
      window.removeEventListener("resize", updateScrollAvailability);
    };
  }, []);

  const handleCareerScroll = (direction: "left" | "right") => {
    const track = careerTrackRef.current;

    if (!track) {
      return;
    }

    const delta = track.clientWidth * 0.9;
    track.scrollBy({
      left: direction === "left" ? -delta : delta,
      behavior: "smooth",
    });
  };

  return (
    <main className="atlas-experience">
      <BootSequence onComplete={() => setReady(true)} />

      <div className="atlas-atmosphere" aria-hidden="true">
        <div className="field-glow field-glow-cyan" data-drift="slow" />
        <div className="field-glow field-glow-copper" data-drift="fast" />
        <div className="field-grid" />
        <div className="field-lines" data-drift="fast" />
      </div>

      <div className="atlas-shell">
        <section className="masthead reveal-section" id="home">
          <div className="masthead-grid">
            <motion.div
              className="masthead-copy"
              initial={{ opacity: 0, y: 26 }}
              animate={ready ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="masthead-code">A01 / CROSS-CULTURAL SYSTEMS</p>
              <h1>
                {PORTFOLIO_OWNER_NAME}
                <span>Java Full Stack Developer</span>
              </h1>
              <p>
                I engineer dependable backend platforms and expressive frontend
                systems for high-stakes domains where clarity and performance are
                equally non-negotiable.
              </p>
            </motion.div>

            <motion.ul
              className="masthead-meta"
              initial={{ opacity: 0, y: 30 }}
              animate={ready ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <li>
                <MapPin size={16} aria-hidden="true" />
                Pavia, Italy
              </li>
              <li>
                <Globe size={16} aria-hidden="true" />
                Bangalore roots, Italian upbringing
              </li>
              <li>
                <ArrowUpRight size={16} aria-hidden="true" />
                Finance, insurance, automotive, energy
              </li>
            </motion.ul>
          </div>
        </section>

        <section className="identity-stage reveal-section" id="story">
          <header className="stage-head">
            <p className="stage-kicker">Narrative System</p>
            <h2>Identity, translated into delivery discipline</h2>
          </header>
          <div className="identity-track">
            {storyChapters.map((chapter) => (
              <article key={chapter.chapter} className="identity-node">
                <div className="identity-node-meta">
                  <p>{chapter.chapter}</p>
                  <p>{chapter.title}</p>
                </div>
                <div className="identity-node-copy">
                  <h3>{chapter.headline}</h3>
                  <p>{chapter.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="capability-stage reveal-section" id="capability">
          <header className="stage-head">
            <p className="stage-kicker">Execution Layers</p>
            <h2>One profile, three synchronized engines</h2>
          </header>
          <div className="capability-stack">
            {capabilityPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article key={pillar.title} className="capability-layer">
                  <div className="capability-layer-head">
                    <Icon size={20} aria-hidden="true" />
                    <h3>{pillar.title}</h3>
                  </div>
                  <p>{pillar.points}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="career-stage reveal-section" id="projects">
          <header className="stage-head stage-head-with-controls">
            <div>
              <p className="stage-kicker">Career Path</p>
              <h2>Professional experience timeline</h2>
            </div>
            <div className="carousel-controls" aria-label="Career timeline controls">
              <button
                type="button"
                className="carousel-control"
                onClick={() => handleCareerScroll("left")}
                disabled={!canScrollCareerLeft}
                aria-label="Scroll timeline left"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="carousel-control"
                onClick={() => handleCareerScroll("right")}
                disabled={!canScrollCareerRight}
                aria-label="Scroll timeline right"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </header>
          <div ref={careerTrackRef} className="career-track">
            {careerPathEntries.map((project, index) => (
              <article key={project.title} className="career-panel">
                <p className="career-order">0{index + 1}</p>
                <p className="career-timeframe">{project.timeframe}</p>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <p className="career-stack">{project.stack}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-stage-panel reveal-section" id="contact">
          <div className="contact-intro">
            <p className="stage-kicker">Connection</p>
            <h2>Let&apos;s build your next reliable and unmistakable platform</h2>
            <ul>
              <li>
                <FontAwesomeIcon icon={faPhone} aria-hidden="true" />
                <a href="tel:+393382965483">+39 338 296 5483</a>
              </li>
              <li>
                <FontAwesomeIcon icon={faEnvelope} aria-hidden="true" />
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
              <li>
                <FontAwesomeIcon icon={faGithub} aria-hidden="true" />
                <a
                  href="https://github.com/krishnapilato/"
                  target="_blank"
                  rel="noreferrer"
                >
                  github.com/krishnapilato
                </a>
              </li>
              <li>
                <FontAwesomeIcon icon={faLinkedin} aria-hidden="true" />
                <a
                  href="https://www.linkedin.com/in/khovakrishnapilato"
                  target="_blank"
                  rel="noreferrer"
                >
                  linkedin.com/in/khovakrishnapilato
                </a>
              </li>
            </ul>
            <p className="contact-note">
              I prefer direct conversations. Reach me by email, LinkedIn, or phone for
              collaboration opportunities.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
