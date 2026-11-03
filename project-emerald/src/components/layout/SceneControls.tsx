import { useUI } from '@/state/ui'
import { world } from '@/state/world'
import { PROFILES, detectTier, type Tier } from '@/config/quality'

const MODES: Array<'auto' | Tier> = ['auto', 'high', 'medium', 'low']

/** Interactive scene controls: graphics quality and ambient motion. */
export function SceneControls() {
  const tier = useUI((s) => s.tier)
  const mode = useUI((s) => s.qualityMode)
  const motion = useUI((s) => s.motion)
  const webgl = useUI((s) => s.webgl)
  const set = useUI((s) => s.set)

  if (!webgl) return null

  const cycleQuality = () => {
    const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length]
    set({ qualityMode: next, tier: next === 'auto' ? detectTier() : next })
  }
  const toggleMotion = () => {
    const next = !motion
    world.motion = next ? 1 : 0
    set({ motion: next })
  }

  return (
    <div className="scene-controls" role="group" aria-label="3D scene controls">
      <button type="button" onClick={cycleQuality} aria-label={`Graphics quality: ${mode === 'auto' ? 'automatic' : PROFILES[tier].label}. Activate to change.`}>
        <span className="scene-controls__key">Quality</span>
        <span>{mode === 'auto' ? `Auto · ${PROFILES[tier].label}` : PROFILES[tier].label}</span>
      </button>
      <button type="button" onClick={toggleMotion} aria-pressed={motion} aria-label="Ambient motion">
        <span className="scene-controls__key">Motion</span>
        <span>{motion ? 'On' : 'Off'}</span>
      </button>
    </div>
  )
}
