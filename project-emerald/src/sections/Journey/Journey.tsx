import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '@/state/ui'
import { JOURNEY } from '@/data/journey'
import { scrollToProgress } from '@/lib/scroll'
import { SectionEyebrow } from '@/components/ui/atoms'

const ease = [0.2, 0.75, 0.2, 1] as const

/**
 * SECTION 06 — DEVELOPMENT JOURNEY. A tall section with a sticky stage: scrolling flies the
 * camera through a tunnel of ring-gates, one per stage, while this layer narrates it.
 */
export function Journey() {
  const active = useUI((s) => s.journeyIndex)
  const stage = JOURNEY[active]

  return (
    <section id="journey" className="journey" aria-labelledby="journey-title" tabIndex={-1}>
      <div className="journey__stage">
        <header className="journey__head" data-reveal>
          <SectionEyebrow index="05">Development journey</SectionEyebrow>
          <h2 id="journey-title" className="display">
            Stages of a <em>digital build.</em>
          </h2>
        </header>

        <div className="journey__current" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
              transition={{ duration: 0.55, ease }}
            >
              <p className="label">
                Stage {stage.index} · {stage.label}
              </p>
              <h3 className="journey__title">{stage.title}</h3>
              <p className="journey__body">{stage.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <ol className="journey__track" aria-label="Journey stages">
          {JOURNEY.map((item, i) => (
            <li key={item.id} className={`${i === active ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`}>
              <button
                type="button"
                onClick={() => scrollToProgress('journey', i / (JOURNEY.length - 1))}
                aria-current={i === active ? 'step' : undefined}
                data-cursor="TRAVEL"
              >
                <span className="journey__node" aria-hidden="true" />
                <span className="journey__step-index">{item.index}</span>
                <span className="journey__step-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
