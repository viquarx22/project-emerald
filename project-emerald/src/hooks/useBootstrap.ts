import { useEffect, useLayoutEffect, useRef } from 'react'
import { useUI } from '@/state/ui'
import { world } from '@/state/world'
import { TUNING } from '@/config/tuning'
import { detectTier, detectWebGL } from '@/config/quality'
import { initScroll } from '@/lib/scroll'
import { hasEnteredBefore, revealGateway, skipIntro } from '@/lib/intro'

/**
 * Boots the whole experience:
 *  1. capability detection (reduced motion, WebGL, performance tier)
 *  2. pointer + viewport tracking
 *  3. Lenis + ScrollTrigger
 *  4. the loader -> gateway -> world state machine
 */
export function useBootstrap() {
  const startedAt = useRef(performance.now())

  // Capability detection runs before paint so first render already has the right tier.
  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    world.reduced = reduced
    world.motion = reduced ? 0 : 1
    world.aspect = window.innerWidth / Math.max(window.innerHeight, 1)
    world.portrait = world.aspect < 0.9
    useUI.getState().set({ webgl: detectWebGL(), tier: detectTier(), motion: !reduced })
  }, [])

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      world.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      world.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    const onResize = () => {
      world.aspect = window.innerWidth / Math.max(window.innerHeight, 1)
      world.portrait = world.aspect < 0.9
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => initScroll(world.reduced), [])

  const webgl = useUI((s) => s.webgl)
  const sceneReady = useUI((s) => s.sceneReady)

  // No WebGL (or the 3D world crashed): go straight to the fully usable DOM portfolio.
  useEffect(() => {
    if (!webgl) {
      world.ambience = 1
      skipIntro()
    }
  }, [webgl])

  // Scene ready -> hold the loader for a minimum time, then reveal the gateway (or skip).
  useEffect(() => {
    if (!webgl || !sceneReady || world.phase !== 'loading') return
    const elapsed = (performance.now() - startedAt.current) / 1000
    const wait = Math.max(0, TUNING.intro.loaderMinSeconds - elapsed)
    const hash = window.location.hash.replace('#', '')
    const autoSkip = world.reduced || hasEnteredBefore() || (hash.length > 0 && hash !== 'home')
    const id = window.setTimeout(() => (autoSkip ? skipIntro() : revealGateway()), wait * 1000)
    return () => window.clearTimeout(id)
  }, [webgl, sceneReady])

  // Failsafe: if the 3D chunk never becomes ready, fall back instead of hanging on the loader.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!useUI.getState().sceneReady && world.phase === 'loading') {
        console.warn('[emerald] 3D world did not become ready in time; continuing without it.')
        useUI.getState().set({ webgl: false })
      }
    }, TUNING.intro.loaderTimeoutSeconds * 1000)
    return () => window.clearTimeout(id)
  }, [])
}
