import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../lib/cn";

type StoryChapterProps = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  image: string;
  reverse?: boolean;
};

export function StoryChapter({
  id,
  title,
  subtitle,
  body,
  image,
  reverse = false,
}: StoryChapterProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !mediaRef.current || !copyRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(mediaRef.current, {
        clipPath: "inset(26% 18% 26% 18% round 30px)",
        scale: 1.28,
      });
      gsap.set(copyRef.current, { opacity: 0.2, yPercent: 24 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=130%",
          scrub: 1,
          pin: true,
        },
      });

      timeline
        .to(mediaRef.current, {
          clipPath: "inset(0% 0% 0% 0% round 24px)",
          scale: 1,
          ease: "none",
        })
        .to(
          copyRef.current,
          {
            opacity: 1,
            yPercent: 0,
            ease: "none",
          },
          0.1,
        )
        .to(
          mediaRef.current,
          {
            yPercent: -10,
            ease: "none",
          },
          0.2,
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id={id} className="chapter section">
      <div className={cn("chapter-inner", reverse && "is-reverse")}>
        <div className="chapter-media-frame glass-panel">
          <div
            ref={mediaRef}
            className="chapter-media"
            style={{ backgroundImage: image }}
            aria-hidden="true"
          />
        </div>

        <div ref={copyRef} className="chapter-copy glass-panel">
          <p className="chapter-subtitle">{subtitle}</p>
          <h2 className="chapter-title text-mask">
            <span>{title}</span>
          </h2>
          <p className="chapter-body">{body}</p>
        </div>
      </div>
    </section>
  );
}
