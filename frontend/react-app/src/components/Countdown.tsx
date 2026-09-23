import type { Copy } from "../i18n";
import { useTick } from "../lib/hooks";

/** Launch target for the countdown. Change this one line to move the date. */
export const LAUNCH_DATE = new Date("2026-10-01T09:00:00+02:00");

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function remainingUntil(target: Date, now: Date): Remaining | null {
  const total = Math.floor((target.getTime() - now.getTime()) / 1000);
  if (total <= 0) return null;
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  };
}

const pad = (value: number) => String(value).padStart(2, "0");

export default function Countdown({ copy }: { copy: Copy }) {
  const now = useTick();
  const left = remainingUntil(LAUNCH_DATE, now);

  return (
    <div className="countdown" data-hero>
      <p className="countdown__label">{copy.launchLabel}</p>
      {left ? (
        <div className="tiles" role="timer" aria-label={copy.launchLabel}>
          {[
            {
              value: left.days,
              label: left.days === 1 ? copy.units.day : copy.units.days,
            },
            { value: left.hours, label: copy.units.hours },
            { value: left.minutes, label: copy.units.minutes },
            { value: left.seconds, label: copy.units.seconds },
          ].map((unit) => (
            <div className="tile" key={unit.label}>
              <span className="tile__value">{pad(unit.value)}</span>
              <span className="tile__unit">{unit.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="countdown__live">{copy.live}</p>
      )}
    </div>
  );
}
