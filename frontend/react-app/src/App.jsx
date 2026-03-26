import { AnimatePresence } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import AchievementToast from "./components/ui/AchievementToast.jsx";
import Cursor from "./components/ui/Cursor.jsx";
import ProgressBar from "./components/ui/ProgressBar.jsx";
import NavBar from "./components/layout/NavBar.jsx";
import { useLenis } from "./hooks/useLenis.js";
import { useAppStore } from "./store/index.js";
import content from "./data/content.json";
import "./App.css";

// Sections (lazy-loaded for performance)
const EntrySequence = lazy(() => import("./sections/Entry.jsx"));
const HeroSection   = lazy(() => import("./sections/Hero.jsx"));
const AboutSection  = lazy(() => import("./sections/About.jsx"));
const SkillsSection = lazy(() => import("./sections/Skills.jsx"));
const ExperienceSection = lazy(() => import("./sections/Experience.jsx"));
const ProjectsSection   = lazy(() => import("./sections/Projects.jsx"));
const ContactSection    = lazy(() => import("./sections/Contact.jsx"));

export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [showEntry, setShowEntry] = useState(true);

  const setScrollProgress = useAppStore((s) => s.setScrollProgress);
  const unlockAchievement = useAppStore((s) => s.unlockAchievement);

  // Smooth scroll
  useLenis();

  // Responsive detection
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Scroll progress tracker
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) setScrollProgress(window.scrollY / total);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [setScrollProgress]);

  // Easter egg: Konami code
  useEffect(() => {
    const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let idx = 0;
    const onKey = (e) => {
      if (e.key === seq[idx]) {
        idx++;
        if (idx === seq.length) {
          useAppStore.getState().findEasterEgg();
          idx = 0;
        }
      } else {
        idx = 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Unlock achievement when all sections discovered
  const discoveredSections = useAppStore((s) => s.discoveredSections);
  useEffect(() => {
    if (discoveredSections.size >= 7) {
      unlockAchievement("explorer", "Full journey completed!");
    }
  }, [discoveredSections.size, unlockAchievement]);

  return (
    <div
      className="relative min-h-screen"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #0e0e12 0%, #050505 65%)" }}
    >
      {/* Custom cursor (desktop only) */}
      {!isMobile && <Cursor />}

      {/* Global overlays */}
      <ProgressBar />
      <NavBar />
      <AchievementToast />

      {/* Entry sequence */}
      <AnimatePresence>
        {showEntry && (
          <Suspense fallback={null}>
            <EntrySequence onComplete={() => setShowEntry(false)} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main>
        <Suspense fallback={null}>
          <HeroSection personal={content.personal} isMobile={isMobile} />
        </Suspense>
        <Suspense fallback={null}>
          <AboutSection
            about={content.about}
            stats={content.stats}
          />
        </Suspense>
        <Suspense fallback={null}>
          <SkillsSection skills={content.skills} isMobile={isMobile} />
        </Suspense>
        <Suspense fallback={null}>
          <ExperienceSection experience={content.experience} />
        </Suspense>
        <Suspense fallback={null}>
          <ProjectsSection projects={content.projects} />
        </Suspense>
        <Suspense fallback={null}>
          <ContactSection personal={content.personal} contacts={content.contacts} />
        </Suspense>
      </main>
    </div>
  );
}
