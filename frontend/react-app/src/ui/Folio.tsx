/** A page number, as printed at the foot of a page. */
export default function Folio({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`folio ${className}`} aria-hidden="true" data-reveal="">
      {n}
    </span>
  );
}
