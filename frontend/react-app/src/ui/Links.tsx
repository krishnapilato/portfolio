import { useEffect, useRef, useState } from "react";
import type { Link } from "../content/beats";

type Props = { links: Link[] };

type Status = { text: string; key: number } | null;

/**
 * A list of real links. Email and telephone also copy to the clipboard,
 * with a mailto/tel href underneath so the action never silently fails:
 * a copy that the browser refuses selects the value instead and says so,
 * and every outcome is announced to assistive technology. External links
 * say so, with a glyph for the eye and words for readers.
 */
export default function Links({ links }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  // A new key per announcement, so repeating the same message is read again.
  const announcements = useRef(0);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(null), 1600);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCopied(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [copied]);

  const copy = async (link: Link, valueNode: HTMLElement | null) => {
    const value = link.copy!;
    const what = link.label === "Email" ? "Email address" : `${link.label} number`;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setStatus({ text: `${what} copied`, key: ++announcements.current });
    } catch {
      // No clipboard here (a plain http preview, a restrictive embed):
      // leave the value selected so one more keystroke copies it.
      if (valueNode) {
        const range = document.createRange();
        range.selectNodeContents(valueNode);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setCopied(null);
      setStatus({ text: `Could not copy. The ${what.toLowerCase()} is selected, or use the link.`, key: ++announcements.current });
    }
  };

  return (
    <>
      <ul className="links">
        {links.map((link) => (
          <li className="links__item" key={link.label}>
            <a
              className="links__link"
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
            >
              <span className="links__label">{link.label}</span>
              {link.value ? <span className="links__value" id={`link-value-${link.label}`}>{link.value}</span> : null}
              {link.external ? (
                <>
                  <span className="links__glyph" aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </>
              ) : null}
            </a>
            {link.copy ? (
              <button
                className="links__copy"
                type="button"
                onClick={() => copy(link, document.getElementById(`link-value-${link.label}`))}
                aria-label={`${copied === link.copy ? "Copied" : "Copy"} ${link.label.toLowerCase()}`}
                data-copied={copied === link.copy}
              >
                {copied === link.copy ? "Copied" : "Copy"}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <span className="sr-only" role="status" aria-live="polite" key={status?.key ?? 0}>
        {status?.text ?? ""}
      </span>
    </>
  );
}
