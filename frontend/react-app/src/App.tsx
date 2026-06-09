import { useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BootSequence } from "./components/BootSequence";
import { Hero } from "./components/Hero";
import { Outro } from "./components/Outro";
import { StoryChapter } from "./components/StoryChapter";
import { useLenis } from "./hooks/useLenis";

gsap.registerPlugin(ScrollTrigger);

const chapters = [
  {
    id: "chapter-genesis",
    title: "The Genesis",
    subtitle: "Chapter I",
    body: "From backend-first foundations, Krishna built production APIs with Java and Spring Boot, shaping secure authentication, dependable migrations, and data layers that stay stable under pressure.",
    image:
      "radial-gradient(circle at 20% 20%, rgba(0, 240, 255, 0.42), transparent 48%), linear-gradient(145deg, rgba(26, 11, 28, 0.92), rgba(5, 5, 7, 0.96)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80')",
  },
  {
    id: "chapter-friction",
    title: "The Friction",
    subtitle: "Chapter II",
    body: "As systems expanded, the focus moved to orchestration across SQL and NoSQL data, resilient service boundaries, and frontend experiences where React and Angular delivered clarity over complexity.",
    image:
      "radial-gradient(circle at 72% 24%, rgba(224, 90, 61, 0.42), transparent 46%), linear-gradient(130deg, rgba(26, 11, 28, 0.84), rgba(5, 5, 7, 0.95)), url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80')",
    reverse: true,
  },
  {
    id: "chapter-resolution",
    title: "The Resolution",
    subtitle: "Chapter III",
    body: "Today, each release blends elegant interaction design with enterprise pragmatism—crafting interfaces and APIs that feel cinematic to users and dependable for the teams maintaining them.",
    image:
      "radial-gradient(circle at 50% 10%, rgba(0, 240, 255, 0.28), transparent 52%), linear-gradient(160deg, rgba(26, 11, 28, 0.86), rgba(5, 5, 7, 0.96)), url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80')",
  },
] as const;

export default function App() {
  useLenis();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to("[data-parallax='slow']", {
        yPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: ".foreground-layer",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      gsap.to("[data-parallax='fast']", {
        yPercent: -34,
        ease: "none",
        scrollTrigger: {
          trigger: ".foreground-layer",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.4,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="experience-root">
      <BootSequence onComplete={() => setReady(true)} />

      <div className="background-layer" aria-hidden="true">
        <div className="radial-light radial-light-cyan" data-parallax="slow" />
        <div className="radial-light radial-light-terracotta" data-parallax="fast" />
        <div className="grain-overlay" />
      </div>

      <div className="foreground-layer">
        <Hero ready={ready} />
        {chapters.map((chapter) => (
          <StoryChapter key={chapter.id} {...chapter} />
        ))}
        <Outro />
      </div>
    </main>
  );
}
