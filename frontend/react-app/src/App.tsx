import { useIntro } from "./useIntro";

const CORNERS = [
  "top-6 left-6 border-t border-l sm:top-10 sm:left-10",
  "top-6 right-6 border-t border-r sm:top-10 sm:right-10",
  "bottom-6 left-6 border-b border-l sm:bottom-10 sm:left-10",
  "bottom-6 right-6 border-b border-r sm:bottom-10 sm:right-10",
];

const SMALL_CAPS = "uppercase leading-[1.15] tracking-[0.2em] text-muted";

// Positions are percentages of the 1512 × 982 Figma frame, so the composition holds at every size.
export default function App() {
  const scope = useIntro();

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden" ref={scope}>
      <div aria-hidden="true" className="pointer-events-none *:absolute">
        {CORNERS.map((corner) => (
          <span className={`size-3 border-ink ${corner}`} data-decor key={corner} />
        ))}
        <span
          className="top-[27.3%] left-[4.2%] aspect-square w-[clamp(140px,14.8vw,260px)] -translate-1/2 rounded-full border border-circle"
          data-decor
        />
        <span
          className="top-[72.2%] left-[94.8%] aspect-square w-[clamp(170px,17.9vw,320px)] -translate-1/2 rounded-full border border-circle"
          data-decor
        />
        <span className="top-1/4 left-[83.6%] h-px w-[8.5vw] bg-hairline" data-decor />
        <span className="top-[73%] left-[9%] h-px w-[10.6vw] bg-hairline" data-decor />
        <span className="top-[12%] left-[82.6%] size-1.5 bg-ink" data-decor />
      </div>

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className={`flex gap-[1.4em] text-[10px] ${SMALL_CAPS}`} data-intro>
          <span className="text-ink">01</span>
          Portfolio in progress
        </p>
        <h1 className="mt-14 text-[15vw] leading-[0.775] font-normal tracking-[-0.085em] sm:text-[clamp(3rem,9.6vw,10rem)]">
          <span className="block overflow-hidden">
            <span className="block" data-line>Khova Krishna</span>
          </span>
          <span className="block overflow-hidden">
            <span className="block" data-line>Pilato</span>
          </span>
        </h1>
        <p
          className={`mt-10 flex items-center gap-[18px] text-[11px] before:h-px before:w-7 before:bg-muted sm:mt-[57px] sm:text-[12px] ${SMALL_CAPS}`}
          data-intro
        >
          Full Stack Java Developer
        </p>
      </main>

      <footer
        className={`absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-[1.1em] text-[10px] leading-3 sm:right-[72px] sm:bottom-10 sm:left-auto sm:translate-x-0 ${SMALL_CAPS}`}
        data-intro
      >
        Coming soon
        <span aria-hidden="true" className="size-1 rounded-full bg-ink" />
        2026
      </footer>
    </div>
  );
}