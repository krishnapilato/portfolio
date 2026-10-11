import { useBootstrap } from "./motion/bootstrap";
import Away from "./sections/Away";
import BookIndex from "./sections/BookIndex";
import Correspondence from "./sections/Correspondence";
import Experience from "./sections/Experience";
import OneHabit from "./sections/OneHabit";
import PlainWords from "./sections/PlainWords";
import TitlePage from "./sections/TitlePage";
import Work from "./sections/Work";
import SkipLink from "./ui/SkipLink";

/**
 * FAIR COPY: the portfolio set as a small printed book. Plain sentences
 * above the rule, the detail below it. Pages in reading order; no navbar,
 * no footer: the Contents and the Index are the navigation.
 */
export default function App() {
  useBootstrap();
  return (
    <>
      <SkipLink to="correspondence">Skip to correspondence</SkipLink>
      <main id="main">
        <TitlePage />
        <OneHabit />
        <PlainWords />
        <Experience />
        <Work />
        <Away />
        <BookIndex />
        <Correspondence />
      </main>
    </>
  );
}
