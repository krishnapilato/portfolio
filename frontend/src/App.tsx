import { useScrollNarrative } from "./useScrollNarrative";
import { experience, craft } from "./profile";
import { Mark, Orbit, ProjectArt, FlightArt } from "./Illustrations";

function Navigation() {
  const links = <><a href="#work">Work</a><a href="#experience">Experience</a><a href="#about">About</a><a href="#contact">Let’s talk <span aria-hidden="true">↗</span></a></>;
  return <header className="site-header">
    <a className="brand" href="#top" aria-label="Khova Krishna Pilato, home"><Mark /><span>KKP<span className="brand-dot">.</span></span></a>
    <nav className="desktop-nav" aria-label="Main">{links}</nav>
    <details className="mobile-nav">
      <summary>Menu <span aria-hidden="true">+</span></summary>
      <nav aria-label="Mobile" onClick={(event) => { if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open"); }}>{links}</nav>
    </details>
  </header>;
}

export default function App() {
  const scope = useScrollNarrative();
  return <div ref={scope} id="top">
    <a href="#main" className="skip-link">Skip to content</a>
    <div className="reading-progress" aria-hidden="true" data-progress />
    <Navigation />
    <main id="main" tabIndex={-1}>
      <section className="intro section-shell" aria-labelledby="intro-title">
        <div className="intro-copy" data-intro-copy>
          <p className="eyebrow"><span className="status-dot" /> KHOVA KRISHNA PILATO</p>
          <h1 id="intro-title" data-intro-title>Software, built<br />with <em>care.</em></h1>
          <p className="intro-role">Full Stack Java Developer</p>
          <p className="intro-description">Reliable systems. Thoughtful interfaces. Five years of turning complex requirements into software people can depend on.</p>
          <div className="intro-actions"><a className="button" href="#work">Discover my work <span aria-hidden="true">↓</span></a><a className="text-link" href="#contact">Let’s work together ↗</a></div>
        </div>
        <Orbit />
        <div className="intro-baseline"><span>BENGALURU ROOTS. ITALIAN PERSPECTIVE.</span><a href="#principles">A little further down <span aria-hidden="true">↓</span></a><span>OPEN TO JAVA & FULL-STACK OPPORTUNITIES</span></div>
      </section>

      <section id="principles" className="principles-section" aria-labelledby="principles-title">
        <div className="section-shell">
          <p className="eyebrow light-label">01 / THE RESPONSIBILITY BEHIND THE CODE</p>
          <h2 id="principles-title" className="reading-statement" data-reading>Every system asks for something. Time. Attention. Trust. Build as though those things belong to someone.</h2>
          <div className="principle-notes">
            <p><span>PRIVACY FIRST</span>Some things deserve to stay yours. Collect less; protect what matters.</p>
            <p><span>SECURITY BY DESIGN</span>Trust begins long before the interface. Give it a sound foundation.</p>
            <p><span>PURPOSEFULLY SIMPLE</span>Complexity has a human cost. Leave clarity for the next person.</p>
          </div>
        </div>
      </section>

      <section id="work" className="work-section section-shell" aria-labelledby="work-title">
        <div className="section-heading"><p className="eyebrow">02 / SELECTED PERSONAL WORK</p><h2 id="work-title" data-reveal>Care becomes real<br />when you <em>build it.</em></h2><p>Two different problems.<br />The same attention to detail.</p></div>
        <article className="project project-map">
          <ProjectArt type="map" />
          <div className="project-copy"><p className="eyebrow">01 / GEOSPATIAL APPLICATION</p><h3 data-reveal>BiMap<span className="project-period">.</span></h3><p className="project-lead">Every place has a story.<br />Give it a little context.</p><p>A full-stack application for Italian cadastral and heritage assets, bringing maps, property data and authenticated access into one experience.</p><p className="project-stack">Angular · Spring Boot microservices · JWT<br />MySQL · Leaflet · Docker Compose · GitHub Actions</p><span className="project-footnote">PERSONAL PROJECT / FULL STACK</span></div>
        </article>
        <article className="project project-scanner">
          <div className="project-copy"><p className="eyebrow">02 / OFFLINE-FIRST ANDROID APP</p><h3 data-reveal>PixelPaper<span className="project-period">.</span></h3><p className="project-lead">Useful technology.<br />A more private default.</p><p>An offline-first Android scanner with edge detection and optical character recognition. Built with Flutter and Google ML Kit to make everyday documents easier to work with.</p><p className="project-stack">Flutter · Google ML Kit · Edge detection · OCR</p><span className="project-footnote">PERSONAL PROJECT / MOBILE</span></div>
          <ProjectArt type="scanner" />
        </article>
        <p className="visual-disclaimer">Original conceptual illustrations of the projects, rather than application screenshots.</p>
      </section>

      <section className="impact-section" aria-labelledby="impact-title"><div className="section-shell impact-grid">
        <div><p className="eyebrow">03 / TIME IS A HUMAN RESOURCE</p><h2 id="impact-title" data-reveal>Give people<br />their time <em>back.</em></h2><p>At ATM Milano, I built ComunicatiNET to manage service notices from drafting and review through approval and publication.</p><p>Automating repetitive steps reduced processing time by <strong>90% per notice</strong>. Eighteen minutes returned to the person doing the work.</p><span className="impact-stack">C# / .NET 8 / SQL SERVER</span></div>
        <div className="impact-measure" aria-label="Notice processing time reduced from 20 minutes to 2 minutes"><div className="before-time"><span>BEFORE</span><strong>20<small>min</small></strong><i /></div><div className="after-time"><span>AFTER</span><strong data-reveal>2<small>min</small></strong><i data-measure /></div><span className="measure-caption">LESS REPETITION. MORE ROOM TO THINK.</span></div>
      </div></section>

      <section id="experience" className="experience-section section-shell" aria-labelledby="experience-title">
        <div className="section-heading"><p className="eyebrow">04 / EXPERIENCE</p><h2 id="experience-title" data-reveal>Different industries.<br />One <em>standard of care.</em></h2><p>Production software since 2021.<br />Responsibility, learned in practice.</p></div>
        <div className="experience-list">{experience.map((item) => <article className="experience-row" key={item.company + item.period}><p className="experience-period">{item.period}</p><div><h3 data-reveal>{item.company}</h3><p className="experience-role">{item.role}</p><p className="experience-detail">{item.detail}</p></div><span className="experience-sector">{item.sector}</span></article>)}</div>
      </section>

      <section className="craft-section section-shell" aria-labelledby="craft-title">
        <div className="section-heading"><p className="eyebrow">05 / THE TOOLKIT</p><h2 id="craft-title" data-reveal>Good judgment.<br />Then the <em>right tools.</em></h2><p>Architecture is a decision.<br />Maintainability is a commitment.</p></div>
        <div className="craft-grid">{craft.map((item) => <article key={item.number}><span className="craft-number">{item.number}</span><h3 data-reveal>{item.title}</h3><p className="craft-tools">{item.tools}</p><p className="craft-note">{item.note}</p></article>)}</div>
      </section>

      <section id="about" className="about-section" aria-labelledby="about-title"><div className="section-shell about-grid">
        <FlightArt />
        <div><p className="eyebrow">06 / A LITTLE MORE HUMAN</p><h2 id="about-title" data-reveal>Precision takes<br />a little <em>humility.</em></h2><p className="about-lead">Born in Bengaluru.<br />Raised in Italy. Building in Java.</p><p>Aviation and flight simulation remind me to respect uncertainty. Checklists, situational awareness and disciplined decisions shape how I approach engineering, too.</p><p>Thoughtful architecture and meaningful tests are ways of caring for people I may never meet: the next developer, the operator on a difficult day, the person trusting the screen.</p><div className="about-details"><p><span>EDUCATION</span>Computer Science & Telecommunications<br />IIS A. Maserati, Voghera · 2016–2021</p><p><span>LANGUAGES</span>Italian & English<br />Full professional proficiency</p></div></div>
      </div></section>

      <section id="contact" className="contact-section section-shell" aria-labelledby="contact-title">
        <p className="eyebrow"><span className="status-dot" /> 07 / THE NEXT CHAPTER</p>
        <h2 id="contact-title" data-reveal>Build something<br />worth <em>trusting.</em></h2>
        <div className="contact-bottom"><p>Looking for a developer who cares about the system and the people around it? I’m open to full-stack Java and backend engineering roles in Italy and internationally.</p><a className="contact-email" href="mailto:krishnak.pilato@gmail.com">Let’s work together <span aria-hidden="true">↗</span><small>krishnak.pilato@gmail.com</small></a></div>
        <div className="contact-links"><span>GOOD CONVERSATIONS START SIMPLY.</span><a href="https://www.linkedin.com/in/khovakrishnapilato" rel="noreferrer">LinkedIn ↗</a><a href="https://github.com/krishnapilato" rel="noreferrer">GitHub ↗</a></div>
      </section>
    </main>
    <footer className="site-footer section-shell"><a className="brand" href="#top" aria-label="Back to top"><Mark /><span>Khova Krishna Pilato</span></a><p>No analytics. No tracking cookies. Just the work.</p><a href="#top">Back to top ↑</a></footer>
  </div>;
}
