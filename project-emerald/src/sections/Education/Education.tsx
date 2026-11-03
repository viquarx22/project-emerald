import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '@/state/ui'
import { EDUCATION } from '@/data/education'
import { scrollToProgress } from '@/lib/scroll'
import { CountUp, SectionEyebrow } from '@/components/ui/atoms'

const ease = [0.2, 0.75, 0.2, 1] as const

/**
 * SECTION 03 — EDUCATION (EXPERIENCE 03 interface layer).
 * A tall section whose stage is sticky. Scrolling inside it travels between platforms in the 3D
 * world; the rail always lists every milestone with its institution, qualification and result.
 */
export function Education() {
  const active = useUI((s) => s.eduIndex)
  const record = EDUCATION[active]

  return (
    <section id="education" className="education" aria-labelledby="education-title" tabIndex={-1}>
      <div className="education__stage">
        <header className="education__head" data-reveal>
          <SectionEyebrow index="02">Education</SectionEyebrow>
          <h2 id="education-title" className="display">
            A spatial path <em>through learning.</em>
          </h2>
          <p className="education__hint">Scroll to travel from platform to platform, or choose a milestone.</p>
        </header>

        <div className="education__layout">
          <ol className="edu-rail" aria-label="Education milestones, in chronological order">
            {EDUCATION.map((item, i) => (
              <li key={item.id} className={`edu-rail__item ${i === active ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`}>
                <button
                  type="button"
                  onClick={() => scrollToProgress('education', i / (EDUCATION.length - 1))}
                  aria-current={i === active ? 'step' : undefined}
                  data-cursor="TRAVEL"
                >
                  <span className="edu-rail__index">0{item.index}</span>
                  <span className="edu-rail__text">
                    <strong>{item.institution}</strong>
                    <span>{item.qualification}</span>
                  </span>
                  <span className="edu-rail__result">{item.result ? item.result.display : 'Incoming'}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="education__panel-wrap" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.article
                key={record.id}
                className="panel edu-panel"
                data-ui
                initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
                transition={{ duration: 0.55, ease }}
              >
                <p className="label">
                  Milestone 0{record.index} · {record.period}
                </p>
                <h3 className="edu-panel__institution">{record.institution}</h3>
                <p className="edu-panel__qualification">{record.qualification}</p>

                <dl className="edu-panel__meta">
                  {record.board && (
                    <div>
                      <dt>Board</dt>
                      <dd>{record.board}</dd>
                    </div>
                  )}
                  {record.location && (
                    <div>
                      <dt>Location</dt>
                      <dd>{record.location}</dd>
                    </div>
                  )}
                  {record.detail && (
                    <div>
                      <dt>Focus</dt>
                      <dd>{record.detail}</dd>
                    </div>
                  )}
                </dl>

                {record.result ? (
                  <div className="edu-panel__result">
                    <CountUp value={record.result.value} />
                    <span>{record.result.label}</span>
                  </div>
                ) : (
                  <div className="edu-panel__result edu-panel__result--upcoming">
                    <span className="badge">Incoming</span>
                    <span>Next stage of the journey</span>
                  </div>
                )}
              </motion.article>
            </AnimatePresence>
          </div>
        </div>

        <div className="education__progress" aria-hidden="true">
          {EDUCATION.map((item, i) => (
            <span key={item.id} className={i <= active ? 'is-on' : ''} />
          ))}
        </div>
      </div>
    </section>
  )
}
