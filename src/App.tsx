import { useScrollNarrative } from "./useScrollNarrative";
import { opening, chapters, closing } from "./profile";
import { useEffect } from "react";

export default function App() {
  const scope = useScrollNarrative();
  useEffect(() => {
    const prevent = (event: Event) => event.preventDefault();
    const menuKey = (event: KeyboardEvent) => {
      if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) event.preventDefault();
    };
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("selectstart", prevent);
    document.addEventListener("keydown", menuKey);
    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("selectstart", prevent);
      document.removeEventListener("keydown", menuKey);
    };
  }, []);
  return <div ref={scope} id="top" className="page">
    <a href="#main" className="skip-link">Skip to the story</a>
    <div className="lamp" aria-hidden="true" data-lamp />
    <main id="main" className="stage" tabIndex={-1}>
      <section className="scene introduction shell" aria-labelledby="opening-title">
        <p className="note">{opening.role}</p>
        <h1 id="opening-title" className="statement">{opening.name}</h1>
        <p className="prose">{opening.lead}</p>
      </section>

      <section className="scene portrait-opening shell" aria-label={opening.name}>
        <img className="portrait" src={import.meta.env.BASE_URL + "portrait.png"} alt={opening.name} width="400" height="400" draggable={false} />
      </section>

      {chapters.map((chapter) => <section className="scene shell professional-chapter" key={chapter.id} id={chapter.id} aria-label={chapter.theme}>
        <p className="note">{chapter.theme}</p>
        <h2 className="statement" data-reveal>{chapter.statement}</h2>
        <div className="prose">
          {chapter.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        {chapter.record && <p className="note record">{chapter.record}</p>}
        {chapter.links && <div className="project-links note">
          {chapter.links.map((link) => <a key={link.href} href={link.href}>{link.label}<span aria-hidden="true"> ↗</span></a>)}
        </div>}
      </section>)}

      <section className="scene closing shell" id="contact" aria-labelledby="contact-title">
        <p className="note marker">An invitation</p>
        <h2 id="contact-title" className="statement" data-reveal>{closing.statement}</h2>
        <div className="prose">
          <p>{closing.invitation}</p>
          <p><a className="email" href={`mailto:${closing.email}`}>{closing.email}</a></p>
          <p className="note record">Or find me on <a href={closing.linkedin} rel="noreferrer">LinkedIn</a> and <a href={closing.github} rel="noreferrer">GitHub</a>.</p>
        </div>
      </section>
    </main>
  </div>;
}




