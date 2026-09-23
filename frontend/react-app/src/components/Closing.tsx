import type { Copy } from "../i18n";
import { EMAIL, GITHUB, LINKEDIN } from "../links";

export default function Closing({ copy }: { copy: Copy }) {
  return (
    <section className="closing" aria-labelledby="closing-title">
      <div className="closing__panel glass glass--deep" data-light data-reveal>
        <span className="hero__seam" aria-hidden="true" />
        <p className="kicker">{copy.closingKicker}</p>
        <h2 className="closing__title" id="closing-title">
          {copy.closingTitle}
        </h2>
        <p className="closing__body">{copy.closingBody}</p>

        <div className="actions">
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

        <a className="closing__mail" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
      </div>
    </section>
  );
}
