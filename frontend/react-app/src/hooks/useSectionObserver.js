import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useAppStore } from "../store/index.js";

/**
 * Observes a section element and updates the global store
 * when the section enters the viewport.
 *
 * @param {number} sectionIndex - index of this section (0-based)
 * @param {object} options - IntersectionObserver options
 * @returns {{ ref }} - attach ref to the section root element
 */
export function useSectionObserver(sectionIndex, options = {}) {
  const discoverSection = useAppStore((s) => s.discoverSection);
  const setCurrentSection = useAppStore((s) => s.setCurrentSection);

  const { ref, inView } = useInView({
    threshold: 0.3,
    ...options,
  });

  useEffect(() => {
    if (inView) {
      setCurrentSection(sectionIndex);
      discoverSection(sectionIndex);
    }
  }, [inView, sectionIndex, setCurrentSection, discoverSection]);

  return { ref, inView };
}
