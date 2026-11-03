import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '@/state/ui'
import { PROFILE } from '@/data/profile'
import { enterWorld, skipIntro } from '@/lib/intro'
import { Button } from '@/components/ui/Button'
import { SplitChars } from '@/components/ui/atoms'
import gsap from 'gsap'

const LOADER_LINES = ['Assembling geometry', 'Compiling shaders', 'Lighting the gateway']

/**
 * Loader and cinematic opening overlay (EXPERIENCE 01 interface layer).
 * loading   -> progress read-out
 * gateway   -> name, ENTER EXPERIENCE, skip
 * entering  -> fades away while the camera flies through the gateway
 */
export function IntroOverlay() {
  const phase = useUI((s) => s.phase)
  const sceneReady = useUI((s) => s.sceneReady)
  const [lineIndex, setLineIndex] = useState(0)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    if (phase !== 'loading') return
    const id = window.setInterval(() => setLineIndex((i) => Math.min(i + 1, LOADER_LINES.length - 1)), 1100)
    return () => window.clearInterval(id)
  }, [phase])

  // Name letters + button reveal once the gateway has emerged from the dark.
  useEffect(() => {
    if (phase !== 'gateway') return
    const chars = document.querySelectorAll('.intro__name .split__char')
    const tl = gsap.timeline()
    tl.fromTo(
      chars,
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.1, ease: 'power4.out', stagger: 0.035 },
      1.2,
    ).add(() => setShowButton(true), 2.9)
    return () => {
      tl.kill()
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'gateway' && phase !== 'loading') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skipIntro()
      if (e.key === 'Enter' && phase === 'gateway') enterWorld()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  const active = phase === 'loading' || phase === 'gateway'

  return (
    <>
      <div id="flash" className="flash" aria-hidden="true" />
      <AnimatePresence>
        {phase !== 'world' && (
          <motion.div
            key="intro"
            className={`intro intro--${phase}`}
            role="dialog"
            aria-modal="false"
            aria-label="Portfolio introduction"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === 'entering' ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: phase === 'entering' ? 1.1 : 0.6, ease: 'easeInOut' }}
            style={{ pointerEvents: active ? 'auto' : 'none' }}
          >
            <div className="intro__top">
              <span className="intro__brand">MV</span>
              {active && (
                <button type="button" className="intro__skip" onClick={skipIntro} data-cursor="SKIP">
                  Skip intro <kbd>Esc</kbd>
                </button>
              )}
            </div>

            {phase === 'loading' && (
              <div className="intro__loader">
                <p className="intro__loader-line" role="status">
                  {sceneReady ? 'Ready' : LOADER_LINES[lineIndex]}
                  <span aria-hidden="true">…</span>
                </p>
                <div className="intro__bar" aria-hidden="true">
                  <span className={sceneReady ? 'is-done' : ''} />
                </div>
              </div>
            )}

            {phase === 'gateway' && (
              <div className="intro__center">
                <p className="intro__kicker">Portfolio · 2026</p>
                <h1 className="intro__name" aria-label={PROFILE.nameUpper}>
                  <SplitChars text={PROFILE.nameUpper} />
                </h1>
                <p className="intro__role">{PROFILE.positioning}</p>
                <div className="intro__cta" style={{ visibility: showButton ? 'visible' : 'hidden' }}>
                  <Button onClick={enterWorld} arrow cursorLabel="ENTER" className="btn--enter">
                    Enter experience
                  </Button>
                  <span className="intro__hint">
                    Press <kbd>Enter</kbd>
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
