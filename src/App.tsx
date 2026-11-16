import { lazy, Suspense } from 'react'
import { Loader } from './components/Loader'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Skills } from './components/Skills'
import { Work } from './components/Work'
import { Experience } from './components/Experience'
import { Awards } from './components/Awards'
import { Contact, Footer } from './components/Contact'
import { useScrollChoreography, useSmoothScroll } from './lib/motion'

// three.js is split into its own chunk so text paints before the scene loads.
const Scene = lazy(() => import('./webgl/Scene'))

export default function App() {
  useSmoothScroll()
  useScrollChoreography()

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="scene-wrap" aria-hidden>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>
      <div className="grain" aria-hidden />
      <Loader />

      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Work />
        <Experience />
        <Awards />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
