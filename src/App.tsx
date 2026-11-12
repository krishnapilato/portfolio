import { useMemo, useState, type ReactNode } from "react";
import { person, scenes } from "./profile";
import { useStory } from "./useStory";

// Words are split once at render so each can be revealed, and lit, on its own.
const words = (text: string): ReactNode[] => text.split(" ").flatMap((word, i) => [i ? " " : null, <span className="w" key={i}>{word}</span>]);

export default function App() {
  const ids = useMemo(() => scenes.map(scene => scene.id), []);
  const { root, active, go } = useStory(ids);
  const [copied, setCopied] = useState(false);
  const last = scenes.length - 1;
  const copy = async () => { await navigator.clipboard.writeText(person.email); setCopied(true); };

  return <div className="stage" ref={root}>
    <div className="glow" aria-hidden="true" />
    <header className="bar">
      <button type="button" onClick={() => go(0)} hidden={active === 0}>{person.name}</button>
      <button type="button" className="to-contact" onClick={() => go(last)} hidden={active === last}>Contact</button>
    </header>

    <main>
      {scenes.map((scene, index) => {
        const current = index === active, Title = index === 0 ? "h1" : "h2";
        return <section className={`scene ${index === 0 ? "opening" : ""}`} key={scene.id} inert={!current} aria-hidden={!current}>
          <div className="copy">
            <Title>{words(scene.title)}</Title>
            {index === last && <p className="address"><a href={`mailto:${person.email}`}>{words(person.email)}</a></p>}
            {scene.text.map(text => <p key={text}>{words(text)}</p>)}
            {scene.note && <p className="note">{words(scene.note)}</p>}
            {scene.links && <p className="links">{scene.links.map(link => <a href={link.href} target="_blank" rel="noreferrer" key={link.href}>{words(link.label)}</a>)}</p>}
            {index === last && <p className="links">
              <button type="button" onClick={copy}>{words(copied ? "Address copied" : "Copy address")}</button>
              <a href={person.linkedin} target="_blank" rel="noreferrer">{words("LinkedIn")}</a>
              <a href={person.github} target="_blank" rel="noreferrer">{words("GitHub")}</a>
            </p>}
          </div>
        </section>;
      })}
    </main>

    <footer className="bar">
      <p className="hint" aria-hidden="true"><span className="with-mouse">Scroll</span><span className="with-touch">Swipe up</span></p>
      <div className="progress" aria-hidden="true"><span data-progress /></div>
      <div className="arrows">
        <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" /></svg></button>
        <button type="button" onClick={() => go(active + 1)} disabled={active === last} aria-label="Next"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14m-6-6 6 6 6-6" /></svg></button>
      </div>
    </footer>
    <p className="announce" aria-live="polite">{`${active + 1} of ${scenes.length}: ${scenes[active].title}`}</p>
  </div>;
}
