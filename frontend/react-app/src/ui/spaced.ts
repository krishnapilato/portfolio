import type { ReactNode } from "react";

/** Joins word nodes with real spaces, so the text copies and reads normally. */
export function spaced(nodes: ReactNode[]) {
  return nodes.flatMap((node, i) => (i === 0 ? [node] : [" ", node]));
}
