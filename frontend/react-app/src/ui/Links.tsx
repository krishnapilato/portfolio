import { useEffect, useState } from "react";
import type { Link } from "../content/beats";

type Props = { links: Link[]; compact?: boolean };

/**
 * A list of real links. Email and telephone also copy to the clipboard,
 * with a mailto/tel href underneath so the action never silently fails.
 * External links say so, with a glyph for the eye and words for readers.
 */
export default function Links({ links, compact = false }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

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

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
    } catch {
      setCopied(null);
    }
  };

  return (
    <ul className={compact ? "links links--compact" : "links"}>
      {links.map((link) => (
        <li className="links__item" key={link.label}>
          <a
            className="links__link"
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
          >
            <span className="links__label">{link.label}</span>
            {link.value ? <span className="links__value">{link.value}</span> : null}
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
              onClick={() => copy(link.copy!)}
              aria-label={`Copy ${link.label.toLowerCase()}`}
              data-copied={copied === link.copy}
            >
              {copied === link.copy ? "Copied" : "Copy"}
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
