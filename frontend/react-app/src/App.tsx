import { useLayoutEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { BootSequence } from "./components/BootSequence";
import { useLenis } from "./hooks/useLenis";

gsap.registerPlugin(ScrollTrigger);

type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type SubmitState =
  | { type: "idle"; message: "" }
  | { type: "pending"; message: "" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const PORTFOLIO_OWNER_NAME = "Khova Krishna Pilato";
const CONTACT_EMAIL = "krishnak.pilato@gmail.com";

const workProjects = [
  {
    title: "Enterprise CRM Evolution",
    timeframe: "Intesa Sanpaolo · 2024–2025",
    summary:
      "Delivered new custodian workflows across Angular and Java Spring Boot while improving reliability and data throughput for large internal teams.",
    stack: "Angular · Java · Spring Boot · MongoDB",
  },
  {
    title: "Insurance Operations Platform",
    timeframe: "Fincons Group · 2025",
    summary:
      "Designed responsive process-oriented UI modules and streamlined integration boundaries to accelerate a mission-critical insurance delivery phase.",
    stack: "Angular · Spring · Mule · REST APIs",
  },
  {
    title: "Pharma Packaging Experience",
    timeframe: "SEA Vision · 2025–2026",
    summary:
      "Built high-performance, component-driven dashboards with real-time visibility for packaging operations while sustaining quality in agile release cycles.",
    stack: "Angular 18 · Material CDK · Real-time UI",
  },
] as const;

export default function App() {
  useLenis();
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState<ContactFormValues>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitState, setSubmitState] = useState<SubmitState>({
    type: "idle",
    message: "",
  });

  const emailConfig = useMemo(
    () => ({
      serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined,
      templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined,
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined,
    }),
    [],
  );

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to("[data-parallax='slow']", {
        yPercent: -16,
        ease: "none",
        scrollTrigger: {
          trigger: ".foreground-layer",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      gsap.to("[data-parallax='fast']", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: ".foreground-layer",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.25,
        },
      });

      gsap.fromTo(
        ".reveal-section",
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.18,
          scrollTrigger: {
            trigger: ".main-content",
            start: "top 70%",
          },
        },
      );
    });

    return () => ctx.revert();
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    if (!trimmed.name || !trimmed.email || !trimmed.subject || !trimmed.message) {
      setSubmitState({
        type: "error",
        message: "Please complete all fields before sending.",
      });
      return;
    }

    setSubmitState({ type: "pending", message: "" });

    const hasEmailJsConfig =
      Boolean(emailConfig.serviceId) &&
      Boolean(emailConfig.templateId) &&
      Boolean(emailConfig.publicKey);

    if (hasEmailJsConfig) {
      try {
        await emailjs.send(
          emailConfig.serviceId!,
          emailConfig.templateId!,
          {
            from_name: trimmed.name,
            reply_to: trimmed.email,
            subject: trimmed.subject,
            message: trimmed.message,
          },
          {
            publicKey: emailConfig.publicKey,
          },
        );

        setSubmitState({
          type: "success",
          message: "Message sent successfully. Thank you for reaching out.",
        });
        setForm({ name: "", email: "", subject: "", message: "" });
        return;
      } catch {
        setSubmitState({
          type: "error",
          message: "Email service failed. Please use the fallback email link below.",
        });
        return;
      }
    }

    const mailtoSubject = encodeURIComponent(trimmed.subject);
    const mailtoBody = encodeURIComponent(
      `Hi ${PORTFOLIO_OWNER_NAME},%0D%0A%0D%0A${trimmed.message}%0D%0A%0D%0AFrom: ${trimmed.name} (${trimmed.email})`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;

    setSubmitState({
      type: "success",
      message: "Opened your email app with a pre-filled message.",
    });
  };

  return (
    <main className="experience-root">
      <BootSequence onComplete={() => setReady(true)} />

      <div className="background-layer" aria-hidden="true">
        <div className="radial-light radial-light-cyan" data-parallax="slow" />
        <div className="radial-light radial-light-terracotta" data-parallax="fast" />
        <div className="grain-overlay" />
      </div>

      <div className="foreground-layer main-content">
        <section className="hero-panel section reveal-section" id="home">
          <motion.div
            className="hero-main"
            initial={{ opacity: 0, y: 32 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow">Full Stack Java Developer</p>
            <h1 className="hero-name text-mask">
              <span>Khova Krishna Pilato</span>
            </h1>
            <p className="hero-tagline">
              Building resilient backend systems and premium frontend experiences
              across finance, insurance, automotive, and energy domains.
            </p>
          </motion.div>

          <motion.ul
            className="hero-contact"
            initial={{ opacity: 0, y: 32 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.95, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <li>
              <Phone size={16} aria-hidden="true" />
              <a href="tel:+393382965483">+39 338 296 5483</a>
            </li>
            <li>
              <Mail size={16} aria-hidden="true" />
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </li>
            <li>
              <MapPin size={16} aria-hidden="true" />
              <span>Pavia, Italy</span>
            </li>
            <li>
              <Globe size={16} aria-hidden="true" />
              <a href="#projects">Portfolio</a>
            </li>
          </motion.ul>
        </section>

        <section className="section content-section reveal-section" id="about">
          <p className="section-kicker">About Me</p>
          <h2>Profile</h2>
          <p>
            Full-Stack Java Developer with 4+ years of experience designing and
            delivering scalable, high-performance web applications. Strong
            expertise in Java (Spring Boot), Angular, microservices architecture,
            cloud-native systems, REST APIs, event-driven solutions, Docker,
            AWS, and CI/CD pipelines with a focus on clean and maintainable code.
          </p>
        </section>

        <section className="section content-section reveal-section" id="projects">
          <p className="section-kicker">Projects</p>
          <h2>Selected Work</h2>
          <div className="project-grid">
            {workProjects.map((project) => (
              <article key={project.title} className="project-card glass-panel">
                <p className="project-timeframe">{project.timeframe}</p>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <p className="project-stack">{project.stack}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section content-section reveal-section" id="contact">
          <p className="section-kicker">Contact Me</p>
          <h2>Let&apos;s build something meaningful</h2>
          <form className="contact-form glass-panel" onSubmit={handleContactSubmit}>
            <div className="field-row">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleInputChange}
                autoComplete="name"
                required
              />
            </div>

            <div className="field-row">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleInputChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="field-row">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="field-row">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" disabled={submitState.type === "pending"}>
              {submitState.type === "pending" ? "Sending..." : "Send Message"}
            </button>

            {submitState.message ? (
              <p className={`form-status is-${submitState.type}`}>{submitState.message}</p>
            ) : null}

          </form>
        </section>
      </div>
    </main>
  );
}
