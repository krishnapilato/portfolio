import { Hero3D } from './components/Hero3D'
import { Navbar } from './components/Navbar'
import { StoryNarrative } from './components/StoryNarrative'
import { TeaserCards } from './components/TeaserCards'
import { LaunchTimeline } from './components/LaunchTimeline'
import { Footer } from './components/Footer'
import { ConfettiBanner } from './components/ConfettiBanner'
import { CodexProgress } from './components/CodexProgress'
import './index.css'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero3D />
        <TeaserCards />
        <StoryNarrative />
        <LaunchTimeline />
      </main>
      <Footer />
      <ConfettiBanner />
      <CodexProgress />
    </>
  )
}
