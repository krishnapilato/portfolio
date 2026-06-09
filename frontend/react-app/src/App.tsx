import "./App.css";

export default function App() {
  return (
    <main className="site select-none">
      <div className="ambient" aria-hidden="true" />
      <div className="scene" aria-hidden="true">
        <span className="mesh" />
        <span className="ring ring-a" />
        <span className="ring ring-b" />
        <span className="ring ring-c" />
        <span className="glow glow-a" />
        <span className="glow glow-b" />
      </div>

      <section className="hero" aria-label="Portfolio preview">
        <p className="eyebrow">Designing the next version now</p>
        <h1 className="title">Krishna Pilato</h1>
        <p className="lead">
          Java full stack developer with strong experience in Java 8+, Spring
          Boot, SQL and NoSQL systems, and modern frontend engineering.
        </p>

        <p className="stack">
          React, Angular, TypeScript, JavaScript, HTML5, CSS3, C#, and Python.
        </p>

        <div className="meta">
          <span className="status-open">Open to work</span>
          <span className="pill">Portfolio relaunch</span>
          <span className="date">June 2026</span>
        </div>
      </section>
    </main>
  );
}
