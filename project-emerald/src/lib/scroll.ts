import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { world } from '@/state/world'
import { useUI } from '@/state/ui'
import { SECTION_ORDER, type SectionId } from '@/types'
import { EDUCATION } from '@/data/education'
import { JOURNEY } from '@/data/journey'
import { easeInOutCubic } from './math'

let lenis: Lenis | null = null
let locked = true

const tick = (time: number) => {
  lenis?.raf(time * 1000)
}

export function setScrollLocked(value: boolean) {
  locked = value
  document.documentElement.classList.toggle('is-locked', value)
  if (!lenis) return
  if (value) lenis.stop()
  else lenis.start()
}

export function scrollToSection(id: SectionId, immediate = false) {
  const el = document.getElementById(id)
  if (!el) return
  useUI.getState().set({ menuOpen: false })
  if (lenis) {
    lenis.scrollTo(el, { duration: immediate ? 0 : 2.1, easing: easeInOutCubic, immediate })
  } else {
    el.scrollIntoView({ behavior: world.reduced || immediate ? 'auto' : 'smooth', block: 'start' })
  }
  window.setTimeout(() => el.focus({ preventScroll: true }), 60)
}

/** Scroll to a point inside a tall sticky section (0 = start of its stage, 1 = end). */
export function scrollToProgress(id: SectionId, progress: number) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY
  const range = Math.max(el.offsetHeight - window.innerHeight, 0)
  const y = top + range * Math.min(Math.max(progress, 0), 1)
  if (lenis) lenis.scrollTo(y, { duration: 1.6, easing: easeInOutCubic })
  else window.scrollTo({ top: y, behavior: world.reduced ? 'auto' : 'smooth' })
}

/**
 * Wires Lenis smooth scrolling, GSAP ScrollTrigger and the 3D world together.
 *
 *  - Every section after the first owns a "segment": while its top travels from the bottom of
 *    the viewport to the top, `world.scrollT` advances by exactly 1 and the camera flies to
 *    the next zone. In between, the camera dwells in the zone.
 *  - Sticky sections (education, journey) additionally expose their own 0..1 progress.
 *
 * Returns a cleanup function.
 */
export function initScroll(reduced: boolean): () => void {
  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.config({ ignoreMobileResize: true })

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)

  if (!reduced) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
  }
  setScrollLocked(locked)

  const segments = new Array<number>(SECTION_ORDER.length).fill(0)
  const sumSegments = () => segments.reduce((a, b) => a + b, 0)

  const ctx = gsap.context(() => {
    SECTION_ORDER.forEach((id, i) => {
      const el = document.getElementById(id)
      if (!el) return

      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) useUI.getState().set({ activeSection: id })
        },
      })

      if (i > 0) {
        const apply = (self: ScrollTrigger) => {
          segments[i] = self.progress
          world.scrollT = sumSegments()
        }
        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'top top',
          onUpdate: apply,
          onRefresh: apply,
        })
      }
    })

    const sticky = (id: SectionId, count: number, key: 'edu' | 'journey', stateKey: 'eduIndex' | 'journeyIndex') => {
      const el = document.getElementById(id)
      if (!el) return
      const apply = (self: ScrollTrigger) => {
        world[key] = self.progress
        const idx = Math.round(self.progress * (count - 1))
        if (useUI.getState()[stateKey] !== idx) useUI.getState().set({ [stateKey]: idx } as Partial<ReturnType<typeof useUI.getState>>)
      }
      ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom bottom', onUpdate: apply, onRefresh: apply })
    }
    sticky('education', EDUCATION.length, 'edu', 'eduIndex')
    sticky('journey', JOURNEY.length, 'journey', 'journeyIndex')

    // DOM reveals. Hero content has its own entrance timeline and is not tagged.
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      if (reduced) {
        gsap.set(el, { autoAlpha: 1, y: 0 })
        return
      }
      const delay = Number(el.dataset.revealDelay ?? 0)
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        },
      )
    })
  })

  const onResize = () => ScrollTrigger.refresh()
  window.addEventListener('load', onResize)

  return () => {
    window.removeEventListener('load', onResize)
    ctx.revert()
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}
