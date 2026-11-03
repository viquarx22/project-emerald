import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ChevronDown } from 'lucide-react'
import { useUI } from '@/state/ui'
import { world } from '@/state/world'
import { PROFILE } from '@/data/profile'
import { scrollToSection } from '@/lib/scroll'
import { Button } from '@/components/ui/Button'
import { SplitChars } from '@/components/ui/atoms'
import type { SectionId } from '@/types'

const go = (id: SectionId) => (e: { preventDefault: () => void }) => {
  e.preventDefault()
  scrollToSection(id)
}

/** SECTION 01 — HERO. The camera rests on the Emerald Core; this is the typographic layer in front of it. */
export function Hero() {
  const phase = useUI((s) => s.phase)
  const root = useRef<HTMLElement>(null)

  // Layout effect: set the GSAP start state before the first painted frame so nothing flashes.
  useLayoutEffect(() => {
    if (phase !== 'world' || !root.current) return
    const scope = root.current
    if (world.reduced) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .from('.hero__eyebrow', { opacity: 0, y: 16, duration: 0.9 }, 0.15)
        .from('.hero__name .split__char', { yPercent: 115, duration: 1.2, stagger: 0.03 }, 0.2)
        .from('.hero__role', { opacity: 0, y: 20, duration: 1 }, 0.7)
        .from('.hero__tagline', { opacity: 0, y: 20, duration: 1 }, 0.85)
        .from('.hero__actions > *', { opacity: 0, y: 24, duration: 0.9, stagger: 0.1 }, 1.0)
        .from('.hero__meta, .hero__scroll', { opacity: 0, duration: 1.2 }, 1.3)
    }, scope)
    return () => ctx.revert()
  }, [phase])

  return (
    <section id="home" ref={root} className="hero" aria-labelledby="hero-title" tabIndex={-1}>
      <div className="hero__inner">
        <p className="hero__eyebrow eyebrow">
          <span className="eyebrow__index">00</span>
          <span className="eyebrow__rule" aria-hidden="true" />
          <span>Portfolio · 2026</span>
        </p>
        <h1 id="hero-title" className="hero__name" aria-label={PROFILE.name}>
          <span className="hero__line">
            <SplitChars text="Mohammed" />
          </span>
          <span className="hero__line">
            <SplitChars text="Viquaruddin" />
          </span>
        </h1>
        <p className="hero__role">
          Information Technology Developer <i aria-hidden="true">|</i> Creative Technologist <i aria-hidden="true">|</i> 3D Web Enthusiast
        </p>
        <p className="hero__tagline">
          Curiosity into <em>creation.</em>
        </p>
        <div className="hero__actions">
          <Button href="#projects" onClick={go('projects')} arrow cursorLabel="FLY">
            Explore Projects
          </Button>
          <Button href="#about" onClick={go('about')} variant="ghost" cursorLabel="FLY">
            About Me
          </Button>
          <Button href="#contact" onClick={go('contact')} variant="ghost" cursorLabel="FLY">
            Contact
          </Button>
        </div>
        <p className="hero__meta">
          <span>{PROFILE.base}</span>
          <span aria-hidden="true">·</span>
          <span>Open to learning &amp; collaboration</span>
        </p>
      </div>
      <a className="hero__scroll" href="#about" onClick={go('about')} aria-label="Scroll to About" data-cursor="SCROLL">
        <span>Scroll</span>
        <ChevronDown size={16} aria-hidden="true" />
      </a>
    </section>
  )
}
