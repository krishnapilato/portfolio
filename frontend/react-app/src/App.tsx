import { lazy, Suspense, useEffect } from 'react'
import { useGPU } from './hooks/useGPU'
import { useScrollProgress } from './hooks/useScrollProgress'
import { Hero } from './sections/Hero'
import { Identity } from './sections/Identity'
import { Experience } from './sections/Experience'
import { SystemThinking } from './sections/SystemThinking'
import { TechStack } from './sections/TechStack'

const Philosophy = lazy(() => import('./sections/Philosophy').then(m => ({ default: m.Philosophy })))
const FinalCTA = lazy(() => import('./sections/FinalCTA').then(m => ({ default: m.FinalCTA })))

function SectionFallback() {
  return <div className="w-full h-screen bg-black" />
}

function App() {
  useGPU()
  useScrollProgress()

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto'
  }, [])

  return (
    <main className="relative bg-black">
      <Hero />
      <Identity />
      <Experience />
      <SystemThinking />
      <TechStack />
      <Suspense fallback={<SectionFallback />}>
        <Philosophy />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <FinalCTA />
      </Suspense>
    </main>
  )
}

export default App
