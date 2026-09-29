import type { Copy } from "../copy";

export default function Story({ copy }: { copy: Copy }) {
  return (
    <section className="story" id="story" aria-labelledby="story-title">
      <header className="sectionhead" data-reveal>
        <p className="kicker">{copy.storyKicker}</p>
        <h2 className="sectiontitle" id="story-title">
          {copy.storyTitle}
        </h2>
      </header>

      <ol className="chapters">
        <span className="chapters__spine" aria-hidden="true">
          <span className="chapters__spine-fill" />
        </span>

        {copy.chapters.map((chapter) => (
          <li className="chapter" key={chapter.id} data-reveal>
            {/* Anchored to the chapter, not the rail: the rail goes sticky on
                wide screens and static on narrow ones, and the node has to
                stay pinned to the spine in both. */}
            <span className="chapter__node" aria-hidden="true" />

            <div className="chapter__rail">
              <span className="chapter__period">{chapter.period}</span>
              <span className="chapter__place">{chapter.place}</span>
            </div>

            <article className="chapter__card glass" data-light>
              <span className="chapter__ghost" aria-hidden="true">
                {chapter.numeral}
              </span>
              <p className="chapter__kicker">{chapter.kicker}</p>
              <h3 className="chapter__title">{chapter.title}</h3>
              <p className="chapter__body">{chapter.body}</p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
