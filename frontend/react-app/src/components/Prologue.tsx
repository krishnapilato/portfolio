import type { Copy } from "../i18n";
import { useTick } from "../lib/hooks";
import Clock from "./Clock";

/**
 * The opening beat of the story: two cities, two live clocks, and a thread
 * running between them.
 */
export default function Prologue({ copy }: { copy: Copy }) {
  const now = useTick();

  return (
    <section className="prologue">
      <p className="kicker" data-reveal>
        {copy.prologueKicker}
      </p>
      <p className="prologue__line" data-reveal>
        {copy.prologueLine}
      </p>
      <p className="prologue__body" data-reveal>
        {copy.prologueBody}
      </p>

      <div className="clocks" data-reveal>
        <Clock label="Bengaluru" timeZone="Asia/Kolkata" now={now} />
        <span className="clocks__thread" aria-hidden="true">
          <span className="clocks__spark" />
        </span>
        <Clock label="Pavia" timeZone="Europe/Rome" now={now} />
      </div>
    </section>
  );
}
