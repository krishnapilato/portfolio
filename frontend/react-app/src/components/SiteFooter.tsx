import type { Copy } from "../i18n";
import { useTick } from "../lib/hooks";

const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Rome",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default function SiteFooter({ copy }: { copy: Copy }) {
  const now = useTick();

  return (
    <footer className="footer">
      <span>{copy.location}</span>
      <span className="footer__time">
        {clock.format(now)} {copy.localTime}
      </span>
      <span className="footer__hint">
        <kbd>L</kbd>
        <span>{copy.hotkeyHint}</span>
      </span>
      <span>© {now.getFullYear()} Khova Krishna Pilato</span>
    </footer>
  );
}
