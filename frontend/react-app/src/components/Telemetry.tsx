import { useRef } from "react";
import type { Copy } from "../i18n";
import { TELEMETRY_HISTORY, useTelemetry } from "../lib/hooks";

const CEILING = 120;

/** Turns the frame-rate history into a left-anchored sparkline path. */
function sparkline(history: number[]) {
  if (history.length < 2) return "";
  const scale = Math.max(CEILING, ...history);
  return history
    .map((value, index) => {
      const x = (index / (TELEMETRY_HISTORY - 1)) * 100;
      const y = 100 - (value / scale) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

/**
 * A footnote that proves the point instead of asserting it: every value is
 * measured in the visitor's own browser, nothing is sent anywhere.
 */
export default function Telemetry({ copy }: { copy: Copy }) {
  const root = useRef<HTMLElement>(null);
  const { fps, history, load, paint, viewport, timeZone, reducedMotion } =
    useTelemetry(root);

  const rows = [
    {
      label: copy.telemetryLabels.load,
      value: load === null ? "—" : `${load} ms`,
    },
    {
      label: copy.telemetryLabels.paint,
      value: paint === null ? "—" : `${paint} ms`,
    },
    { label: copy.telemetryLabels.viewport, value: viewport },
    { label: copy.telemetryLabels.timezone, value: timeZone },
    {
      label: copy.telemetryLabels.motion,
      value: reducedMotion ? copy.motionReduced : copy.motionFull,
    },
  ];

  return (
    <section className="telemetry" ref={root} aria-labelledby="telemetry-title">
      <header className="sectionhead" data-reveal>
        <p className="kicker">{copy.telemetryKicker}</p>
        <h2 className="sectiontitle" id="telemetry-title">
          {copy.telemetryTitle}
        </h2>
        <p className="sectionnote">{copy.telemetryNote}</p>
      </header>

      <div className="gauge glass" data-light data-reveal>
        <div className="gauge__fps">
          <span className="gauge__value">{fps ?? "··"}</span>
          <span className="gauge__unit">{copy.telemetryLabels.fps}</span>
        </div>

        <svg
          className="spark"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <polyline className="spark__line" points={sparkline(history)} />
        </svg>

        <dl className="gauge__rows">
          {rows.map((row) => (
            <div className="gauge__row" key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
