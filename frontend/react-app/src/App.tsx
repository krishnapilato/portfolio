import "./App.css";
import Ambient from "./components/Ambient";
import Closing from "./components/Closing";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Prologue from "./components/Prologue";
import SiteFooter from "./components/SiteFooter";
import Story from "./components/Story";
import Telemetry from "./components/Telemetry";
import TopBar from "./components/TopBar";
import { COPY } from "./copy";
import {
  useGlobalLight,
  useReveal,
} from "./lib/hooks";

export default function App() {
  const copy = COPY;

  useGlobalLight();
  useReveal();

  return (
    <>
      {/* Kept outside the animated shell: these are position:fixed layers and
          a transform on an ancestor would re-anchor them to the document. */}
      <Ambient />

      <div className="shell">
        <a className="skip" href="#story">
          {copy.scrollCue}
        </a>

        <TopBar copy={copy} />

        <main className="content">
          <Hero copy={copy} />
          <Prologue copy={copy} />
          <Story copy={copy} />
          <Projects copy={copy} />
          <Telemetry copy={copy} />
          <Closing copy={copy} />
        </main>

        <SiteFooter copy={copy} />
      </div>
    </>
  );
}
