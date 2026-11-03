import { Suspense, lazy } from 'react'
import { useUI } from '@/state/ui'
import { useBootstrap } from '@/hooks/useBootstrap'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { StaticBackdrop } from '@/components/layout/StaticBackdrop'
import { SpatialNav } from '@/components/navigation/SpatialNav'
import { IntroOverlay } from '@/components/intro/IntroOverlay'
import { Cursor } from '@/components/ui/Cursor'
import { Toast } from '@/components/ui/Toast'
import { Hero } from '@/sections/Hero/Hero'
import { About } from '@/sections/About/About'
import { Education } from '@/sections/Education/Education'
import { Skills } from '@/sections/Skills/Skills'
import { Projects } from '@/sections/Projects/Projects'
import { Journey } from '@/sections/Journey/Journey'
import { Contact } from '@/sections/Contact/Contact'

// The entire 3D world (three.js, R3F, drei, postprocessing) is a separate, lazily loaded chunk.
const World = lazy(() => import('@/scenes/World'))

export default function App() {
  useBootstrap()
  const phase = useUI((s) => s.phase)
  const webgl = useUI((s) => s.webgl)

  return (
    <div className="site" data-phase={phase} data-webgl={webgl ? 'on' : 'off'}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {webgl ? (
        <Suspense fallback={null}>
          <World />
        </Suspense>
      ) : (
        <StaticBackdrop />
      )}

      <Header />
      <SpatialNav />

      <main id="main" className="site__content">
        <Hero />
        <About />
        <Education />
        <Skills />
        <Projects />
        <Journey />
        <Contact />
      </main>
      <Footer />

      <IntroOverlay />
      <Toast />
      <Cursor />
    </div>
  )
}
