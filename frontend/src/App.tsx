import { useScrollNarrative } from "./useScrollNarrative";
import { opening, chapters, closing } from "./profile";
import { Mark } from "./Illustrations";

export default function App() {
  const scope = useScrollNarrative();
  return <div ref={scope} id="top" className="page">
    <a href="#main" className="skip-link">Skip to the story</a>
    <div className="reading-progress" aria-hidden="true" data-progress />
    <div className="lamp" aria-hidden="true" data-lamp />
    <header className="site-header shell">
      <a className="brand" href="#top" aria-label={`${opening.name}, back to the beginning`}><Mark /></a>
      <a className="note" href="#contact">Write to me <span aria-hidden="true">↗</span></a>
    </header>
    <main id="main" tabIndex={-1}>
      <section className="opening shell" aria-labelledby="opening-title">
        <p className="note" data-fade>{opening.name} · {opening.role}</p>
        <h1 id="opening-title" data-intro-title>{opening.title}</h1>
        <p className="opening-lead" data-fade>{opening.lead}</p>
        <p className="note hint" aria-hidden="true" data-fade>{opening.hint}</p>
      </section>

      {chapters.map((chapter) => <section className="chapter shell" id={chapter.id} key={chapter.id} aria-labelledby={`${chapter.id}-title`}>
        <p className="note marker" data-fade>{chapter.numeral} <span aria-hidden="true">·</span> {chapter.theme}</p>
        <h2 id={`${chapter.id}-title`} className="statement" data-reveal>{chapter.statement}</h2>
        <div className="prose">
          {chapter.paragraphs.map((paragraph) => <p key={paragraph} data-fade>{paragraph}</p>)}
          {chapter.record && <p className="note record" data-fade>{chapter.record}</p>}
        </div>
        {chapter.pause && <p className="pause" data-reading>{chapter.pause}</p>}
      </section>)}

      <section className="chapter closing shell" id="contact" aria-labelledby="contact-title">
        <p className="note marker" data-fade>An invitation</p>
        <h2 id="contact-title" className="statement" data-reveal>{closing.statement}</h2>
        <div className="prose">
          <p data-fade>{closing.invitation}</p>
          <p data-fade><a className="email" href={`mailto:${closing.email}`}>{closing.email}</a></p>
          <p className="note record" data-fade>Or find me on <a href={closing.linkedin} rel="noreferrer">LinkedIn</a> and <a href={closing.github} rel="noreferrer">GitHub</a>.</p>
        </div>
      </section>
    </main>
    <footer className="site-footer shell note"><p>No analytics. No cookies. Just the work.</p><a href="#top">Back to the beginning ↑</a></footer>
  </div>;
}
