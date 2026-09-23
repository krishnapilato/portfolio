import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import "./App.css";
import Ambient from "./components/Ambient";
import Closing from "./components/Closing";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Prologue from "./components/Prologue";
import SiteFooter from "./components/SiteFooter";
import Story from "./components/Story";
import Telemetry from "./components/Telemetry";
import TopBar from "./components/TopBar";
import {
  prefersReducedMotion,
  useGlobalLight,
  useHotkey,
  useLanguage,
  useReveal,
} from "./lib/hooks";

export default function App() {
  const { lang, copy, setLang, toggle } = useLanguage();
  const shell = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useGlobalLight();
  useReveal([lang]);
  useHotkey("l", toggle);

  // A short settle on language change, so the page reads as one continuous
  // surface rather than a hard content swap.
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const target = shell.current;
    if (!target || prefersReducedMotion()) return;
    gsap.fromTo(
      target,
      { opacity: 0.4, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        clearProps: "transform,opacity",
      },
    );
  }, [lang]);

  return (
    <>
      {/* Kept outside the animated shell: these are position:fixed layers and
          a transform on an ancestor would re-anchor them to the document. */}
      <Ambient />

      <div className="shell" ref={shell}>
        <a className="skip" href="#story">
          {copy.scrollCue}
        </a>

        <TopBar copy={copy} lang={lang} onSelect={setLang} />

        <main className="content">
          <Hero copy={copy} />
          <Prologue copy={copy} />
          <Story copy={copy} />
          <Projects copy={copy} />
          <Telemetry copy={copy} />
          <Closing copy={copy} />
        </main>

        <SiteFooter copy={copy} />
      </div>
    </>
  );
}
