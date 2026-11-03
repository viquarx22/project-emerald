import { useRef, type KeyboardEvent } from 'react'
import { useUI } from '@/state/ui'
import { SKILL_CATEGORIES } from '@/data/skills'
import { hoverTech, resetSkillOverview, selectCategory } from '@/state/actions'
import { SectionEyebrow } from '@/components/ui/atoms'

/** SECTION 04 — TECHNICAL SKILLS: a category selector wired to the 3D technology ecosystem. */
export function Skills() {
  const activeIndex = useUI((s) => s.activeCategory)
  const hoveredTech = useUI((s) => s.hoverTech)
  const category = SKILL_CATEGORIES[activeIndex]
  const tabs = useRef<Array<HTMLButtonElement | null>>([])

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (activeIndex + dir + SKILL_CATEGORIES.length) % SKILL_CATEGORIES.length
    selectCategory(next)
    tabs.current[next]?.focus()
  }

  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title" tabIndex={-1}>
      <div className="skills__grid">
        <header className="skills__head" data-reveal>
          <SectionEyebrow index="03">Technical skills</SectionEyebrow>
          <h2 id="skills-title" className="display">
            A technology <em>ecosystem.</em>
          </h2>
          <p className="body">Choose a category to fly to its crystal and unfold the technologies orbiting it.</p>
        </header>

        <div className="skills__tabs" role="tablist" aria-orientation="vertical" aria-label="Skill categories" onKeyDown={onKey} data-reveal>
          {SKILL_CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              ref={(el) => {
                tabs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`skill-tab-${c.id}`}
              aria-selected={i === activeIndex}
              aria-controls="skill-panel"
              tabIndex={i === activeIndex ? 0 : -1}
              className={`skill-tab ${i === activeIndex ? 'is-active' : ''}`}
              onClick={() => selectCategory(i)}
              data-cursor="SELECT"
            >
              <span className="skill-tab__index">0{i + 1}</span>
              <span className="skill-tab__label">{c.label}</span>
              <span className="skill-tab__count">{c.skills.length}</span>
            </button>
          ))}
        </div>

        <div
          id="skill-panel"
          role="tabpanel"
          aria-labelledby={`skill-tab-${category.id}`}
          className="panel skill-panel"
          data-ui
          data-reveal
        >
          <p className="body">{category.blurb}</p>
          <ul className="skill-list">
            {category.skills.map((skill, i) => (
              <li
                key={skill.name}
                className={`skill-item ${hoveredTech === i ? 'is-active' : ''} ${skill.status === 'exploring' ? 'is-exploring' : ''}`}
                onPointerEnter={() => hoverTech(i)}
                onPointerLeave={() => hoverTech(-1)}
              >
                <span>{skill.name}</span>
                <em>{skill.status === 'exploring' ? 'Exploring' : 'Used in projects'}</em>
              </li>
            ))}
          </ul>
          <div className="skill-panel__foot">
            <span className="legend">
              <i className="legend__dot legend__dot--used" aria-hidden="true" /> Used in projects
            </span>
            <span className="legend">
              <i className="legend__dot legend__dot--exploring" aria-hidden="true" /> Currently exploring
            </span>
            <button type="button" className="link-button" onClick={resetSkillOverview} data-cursor="VIEW">
              Overview
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
