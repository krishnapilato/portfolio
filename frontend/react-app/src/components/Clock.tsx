const cache = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string) {
  let existing = cache.get(timeZone);
  if (!existing) {
    existing = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    cache.set(timeZone, existing);
  }
  return existing;
}

type Props = {
  label: string;
  timeZone: string;
  now: Date;
};

export default function Clock({ label, timeZone, now }: Props) {
  // One formatter call per tick — the hour comes out of the same string
  // rather than building a second Intl instance every second.
  const time = formatter(timeZone).format(now);
  const hour = Number(time.slice(0, 2));
  const daylight = hour >= 7 && hour < 20;

  return (
    <div className="clock">
      <span
        className={daylight ? "clock__orb clock__orb--day" : "clock__orb"}
        aria-hidden="true"
      />
      <span className="clock__time">{time}</span>
      <span className="clock__label">{label}</span>
    </div>
  );
}
