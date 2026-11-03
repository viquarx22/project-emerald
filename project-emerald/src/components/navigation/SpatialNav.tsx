import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useUI } from '@/state/ui'
import { world } from '@/state/world'
import { NAV } from '@/data/profile'
import { ZONE_ORIGIN } from '@/config/layout'
import { scrollToSection } from '@/lib/scroll'

const ZONE_Z = [ZONE_ORIGIN.hero, ZONE_ORIGIN.about, ZONE_ORIGIN.education, ZONE_ORIGIN.skills, ZONE_ORIGIN.projects, ZONE_ORIGIN.journey, ZONE_ORIGIN.contact].map((v) => v[2])

/**
 * Spatial navigation: a vertical "flight path" that mirrors the camera's route through the 3D
 * world. A probe slides along it as you scroll, and every node is a real link that flies the
 * camera to that zone. Fully keyboard accessible.
 */
export function SpatialNav() {
  const active = useUI((s) => s.activeSection)
  const phase = useUI((s) => s.phase)
  const probe = useRef<HTMLSpanElement>(null)
  const depth = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const update = () => {
      const t = Math.min(Math.max(world.introT + world.scrollT - 1, 0), NAV.length - 1)
      if (probe.current) probe.current.style.setProperty('--p', String(t / (NAV.length - 1)))
      if (depth.current) {
        const i = Math.min(Math.floor(t), ZONE_Z.length - 2)
        const z = ZONE_Z[i] + (ZONE_Z[i + 1] - ZONE_Z[i]) * (t - i)
        depth.current.textContent = `Z ${String(Math.round(-z)).padStart(3, '0')}`
      }
    }
    gsap.ticker.add(update)
    return () => gsap.ticker.remove(update)
  }, [])

  return (
    <nav className={`spatial-nav ${phase === 'world' ? 'is-visible' : ''}`} aria-label="Main navigation">
      <span className="spatial-nav__depth" ref={depth} aria-hidden="true">
        Z 080
      </span>
      <div className="spatial-nav__body">
        <span className="spatial-nav__rail" aria-hidden="true">
          <span className="spatial-nav__probe" ref={probe} />
        </span>
        <ol className="spatial-nav__list">
          {NAV.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="spatial-nav__link"
                aria-current={active === item.id ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(item.id)
                }}
                data-cursor="FLY"
              >
                <span className="spatial-nav__label">{item.label}</span>
                <span className="spatial-nav__node" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
