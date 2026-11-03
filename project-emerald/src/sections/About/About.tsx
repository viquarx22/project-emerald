import { useState } from 'react'
import { useUI } from '@/state/ui'
import { ABOUT } from '@/data/profile'
import { hoverInterest } from '@/state/actions'
import { SectionEyebrow } from '@/components/ui/atoms'

/** SECTION 02 — ABOUT. Interests are linked to the six orbiting nodes in the 3D constellation. */
export function About() {
  const highlighted = useUI((s) => s.hoverInterest)
  const [pinned, setPinned] = useState(-1)

  return (
    <section id="about" className="section about" aria-labelledby="about-title" tabIndex={-1}>
      <div className="about__grid">
        <header className="about__head" data-reveal>
          <SectionEyebrow index="01">About</SectionEyebrow>
          <h2 id="about-title" className="display">
            Building a foundation, <em>one project at a time.</em>
          </h2>
        </header>

        <div className="about__body">
          <p className="lead" data-reveal>
            {ABOUT.lead}
          </p>
          {ABOUT.paragraphs.map((text) => (
            <p key={text} className="body" data-reveal>
              {text}
            </p>
          ))}

          <ul className="traits" data-reveal aria-label="Personal traits">
            {ABOUT.traits.map((trait, i) => (
              <li key={trait}>
                <span>0{i + 1}</span>
                {trait}
              </li>
            ))}
          </ul>

          <div className="interests" data-reveal>
            <h3 className="label">Areas of interest — hover to light up the constellation</h3>
            <ul>
              {ABOUT.interests.map((interest, i) => (
                <li key={interest}>
                  <button
                    type="button"
                    className={`chip ${highlighted === i ? 'is-active' : ''}`}
                    aria-pressed={pinned === i}
                    onPointerEnter={() => pinned < 0 && hoverInterest(i)}
                    onPointerLeave={() => pinned < 0 && hoverInterest(-1)}
                    onFocus={() => pinned < 0 && hoverInterest(i)}
                    onBlur={() => pinned < 0 && hoverInterest(-1)}
                    onClick={() => {
                      const next = pinned === i ? -1 : i
                      setPinned(next)
                      hoverInterest(next)
                    }}
                  >
                    {interest}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
