import type { CSSProperties } from "react";
import type { Copy } from "../copy";

export default function Projects({ copy }: { copy: Copy }) {
  return (
    <section className="projects" aria-labelledby="projects-title">
      <header className="sectionhead" data-reveal>
        <p className="kicker">{copy.projectsKicker}</p>
        <h2 className="sectiontitle" id="projects-title">
          {copy.projectsTitle}
        </h2>
        <p className="sectionnote">{copy.projectsNote}</p>
      </header>

      <ul className="projects__grid">
        {copy.projects.map((project, index) => (
          <li
            className="project glass"
            key={project.name}
            style={{ "--i": index } as CSSProperties}
            data-light
            data-reveal
          >
            <span className="project__index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="project__name">{project.name}</h3>
            <p className="project__blurb">{project.blurb}</p>
            <p className="project__tech">{project.tech}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
