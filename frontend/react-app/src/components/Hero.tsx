import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import type { Copy } from "../i18n";
import { CORE_STACK, EMAIL, GITHUB, LINKEDIN } from "../links";
import Countdown from "./Countdown";

export default function Hero({ copy }: { copy: Copy }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(".hero__panel", {
            autoAlpha: 0,
            y: 28,
            scale: 0.99,
            duration: 0.85,
          })
          .from(
            ".hero__line > span",
            { yPercent: 112, duration: 0.95, stagger: 0.07 },
            0.08,
          )
          .from(
            "[data-hero]",
            { autoAlpha: 0, y: 14, duration: 0.65, stagger: 0.055 },
            0.32,
          );
      });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <section className="hero" ref={root}>
      <article className="hero__panel glass glass--deep" data-light>
        <span className="hero__seam" aria-hidden="true" />

        <div className="hero__head" data-hero>
          <span>{copy.headLeft}</span>
          <span>{copy.headRight}</span>
        </div>

        <p className="eyebrow" data-hero>
          {copy.eyebrow}
        </p>

        <h1 className="hero__name">
          <span className="hero__line">
            <span>Khova Krishna</span>
          </span>
          <span className="hero__line">
            <span className="hero__last">Pilato</span>
          </span>
        </h1>

        <p className="hero__role" data-hero>
          {copy.rolePre} <em>{copy.roleAccent}</em>
          {copy.rolePost ? ` ${copy.rolePost}` : ""}
        </p>

        <p className="hero__lede" data-hero>
          {copy.lede}
        </p>

        <Countdown copy={copy} />

        <div className="stack" data-hero>
          <p className="stack__label">{copy.stackLabel}</p>
          <ul className="stack__list">
            {CORE_STACK.map((item) => (
              <li className="chip" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="actions" data-hero>
          <a className="btn btn--primary" href={`mailto:${EMAIL}`}>
            {copy.contact}
          </a>
          <a
            className="btn"
            href={GITHUB}
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub
          </a>
          <a
            className="btn"
            href={LINKEDIN}
            target="_blank"
            rel="noreferrer noopener"
          >
            LinkedIn
          </a>
        </div>
      </article>

      <a className="scrollcue" href="#story" data-hero>
        <span className="scrollcue__text">{copy.scrollCue}</span>
        <span className="scrollcue__rule" aria-hidden="true" />
      </a>
    </section>
  );
}
