import { onCut } from "../motion/cut";

/** A skip link: visible only when focused; jumps like every in-book link. */
export default function SkipLink({ to, children, className = "" }: { to: string; children: string; className?: string }) {
  return (
    <a className={`skip ${className}`} href={`#${to}`} onClick={(event) => onCut(event, to)}>
      {children}
    </a>
  );
}
