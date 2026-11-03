/**
 * One place to tune the look and feel of the 3D world.
 * The scenes were authored without a visual feedback loop, so if something feels too dark,
 * too bright or too bloomy on your screen, these are the first numbers to change.
 */
export const COLORS = {
  bg: '#061A14',
  bg2: '#0B241B',
  surface: '#102D22',
  accent: '#00DFA0',
  mint: '#8AFFC1',
  gold: '#C8B88A',
  text: '#E8F2EC',
  muted: '#8FA99A',
  void: '#03100B',
} as const

export const TUNING = {
  background: '#030D09',
  fog: { color: '#04120D', density: 0.0125 },
  /** Master brightness of image-based lighting (reflections). */
  environment: 1.0,
  lights: {
    hemisphere: 0.55,
    key: 2.4,
    /** Point lights that travel with the camera (candela). */
    emerald: 180,
    gold: 90,
  },
  bloom: { intensity: 0.85, threshold: 0.82, smoothing: 0.25 },
  rig: {
    dampIntro: 9,
    dampWorld: 3.4,
    fovDesktop: 38,
    fovPortrait: 52,
    fovKick: 7,
    parallaxDesktop: 1.7,
    parallaxPortrait: 0.5,
  },
  intro: {
    dollySeconds: 7,
    enterSeconds: 4.4,
    loaderMinSeconds: 1.6,
    loaderTimeoutSeconds: 18,
  },
} as const
