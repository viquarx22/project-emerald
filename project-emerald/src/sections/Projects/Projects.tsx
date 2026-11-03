import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useUI } from '@/state/ui'
import { PROJECTS } from '@/data/projects'
import { hoverProject, selectProject, stepProject } from '@/state/actions'
import { useSwipe } from '@/hooks/useSwipe'
import { Button } from '@/components/ui/Button'
import { SectionEyebrow, StatusBadge } from '@/components/ui/atoms'

const ease = [0.2, 0.75, 0.2, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * SECTION 05 — PROJECTS (EXPERIENCE 02 interface layer).
 * The 3D world flies the camera between five distinct environments; this layer carries each
 * project's real information, LIVE status and link.
 */
export function Projects() {
  const activeIndex = useUI((s) => s.activeProject)
  const section = useUI((s) => s.activeSection === 'projects')
  const project = PROJECTS[activeIndex]
  const stage = useRef<HTMLDivElement>(null)

  const next = useCallback(() => stepProject(1), [])
  const prev = useCallback(() => stepProject(-1), [])
  useSwipe(stage, next, prev)

  // Arrow keys step through the universe while the projects section is on screen.
  useEffect(() => {
    if (!section) return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [section, next, prev])

  return (
    <section id="projects" className="projects" aria-labelledby="projects-title" tabIndex={-1}>
      <div className="projects__stage" ref={stage}>
        <header className="projects__head" data-reveal>
          <SectionEyebrow index="04">Projects</SectionEyebrow>
          <h2 id="projects-title" className="display">
            The project <em>universe.</em>
          </h2>
        </header>

        <div className="projects__layout">
          <div className="projects__panel-wrap" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.article
                key={project.id}
                className="panel project-panel"
                data-ui
                initial={{ opacity: 0, x: -28, filter: 'blur(6px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 18, filter: 'blur(6px)' }}
                transition={{ duration: 0.55, ease }}
              >
                <div className="project-panel__top">
                  <span className="label">
                    {pad(activeIndex + 1)} / {pad(PROJECTS.length)}
                  </span>
                  <StatusBadge label={project.status.toUpperCase()} />
                </div>
                <h3 className="project-panel__name" style={{ ['--accent-project' as string]: project.accent }}>
                  {project.name}
                </h3>
                <p className="project-panel__kicker">{project.kicker}</p>
                <p className="project-panel__desc">{project.description}</p>

                {project.stack.length > 0 && (
                  <div className="project-panel__group">
                    <p className="label">Technology stack</p>
                    <ul className="tags">
                      {project.stack.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {project.tags.length > 0 && (
                  <div className="project-panel__group">
                    <p className="label">Focus</p>
                    <ul className="tags tags--soft">
                      {project.tags.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="project-panel__actions">
                  <Button
                    href={project.url}
                    external
                    ariaLabel={`${project.cta}: ${project.name}. Opens ${project.host} in a new tab.`}
                    cursorLabel="OPEN"
                  >
                    {project.cta}
                  </Button>
                  {project.repoUrl && (
                    <Button href={project.repoUrl} external variant="ghost" ariaLabel={`${project.name} on GitHub`}>
                      GitHub
                    </Button>
                  )}
                </div>
                <p className="project-panel__host">{project.host}</p>
              </motion.article>
            </AnimatePresence>
          </div>

          <nav className="project-rail" aria-label="Project selector">
            <ul>
              {PROJECTS.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`project-rail__item ${i === activeIndex ? 'is-active' : ''}`}
                    aria-current={i === activeIndex ? 'true' : undefined}
                    onClick={() => selectProject(i)}
                    onPointerEnter={() => hoverProject(i)}
                    onPointerLeave={() => hoverProject(-1)}
                    onFocus={() => hoverProject(i)}
                    onBlur={() => hoverProject(-1)}
                    data-cursor="FLY"
                  >
                    <span className="project-rail__index">{pad(i + 1)}</span>
                    <span className="project-rail__name">{item.name}</span>
                    <span className="project-rail__live" aria-label="Live">
                      <i aria-hidden="true" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="project-rail__arrows">
              <button type="button" onClick={prev} aria-label="Previous project" data-cursor="PREV">
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <button type="button" onClick={next} aria-label="Next project" data-cursor="NEXT">
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </nav>
        </div>

        <p className="projects__hint">Click a structure in the scene, use ← → keys, or swipe to travel between projects.</p>
      </div>
    </section>
  )
}
