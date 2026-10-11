import { useEffect, useRef, useState } from "react";
import { setupGsap } from "../motion/gsap";
import { swapLabel } from "../motion/swap";

type Props = {
  value: string;
  /** What the value is called in announcements: "email address". */
  noun: string;
  /** Id of the element holding the visible value, selected if copying fails. */
  valueId: string;
  onAnnounce: (message: string) => void;
};

/**
 * Copy, then Copied for two seconds: the label swaps behind a mask, the
 * row's rule turns pencil, and a polite live region says what happened.
 * If the clipboard is refused (plain http, a strict embed), the value is
 * selected instead so one more keystroke copies it.
 */
export default function CopyButton({ value, noun, valueId, onAnnounce }: Props) {
  const [copied, setCopied] = useState(false);
  const labels = useRef<HTMLSpanElement>(null);
  const swap = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!labels.current) return;
    setupGsap();
    swap.current = swapLabel(labels.current);
    return () => {
      swap.current?.kill();
      swap.current = null;
    };
  }, []);

  useEffect(() => {
    const tl = swap.current;
    if (tl) {
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (still) tl.progress(copied ? 1 : 0).pause();
      else if (copied) tl.play();
      else tl.reverse();
    }
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCopied(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onAnnounce(`${noun[0].toUpperCase()}${noun.slice(1)} copied`);
    } catch {
      const node = document.getElementById(valueId);
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setCopied(false);
      onAnnounce(`Could not copy. The ${noun} is selected; press Ctrl+C or Cmd+C.`);
    }
  };

  return (
    <button
      type="button"
      className="copy"
      data-copied={copied}
      onClick={copy}
      aria-label={`${copied ? "Copied" : "Copy"} ${noun}`}
    >
      <span className="copy__labels" ref={labels} aria-hidden="true">
        <span className="copy__label">Copy</span>
        <span className="copy__label">Copied</span>
      </span>
    </button>
  );
}
