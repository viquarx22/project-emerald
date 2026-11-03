export type Tier = 'high' | 'medium' | 'low'

export interface QualityProfile {
  label: string
  dpr: [number, number]
  post: boolean
  msaa: number
  shadows: boolean
  shadowMap: number
  /** Real refraction (transmission) and planar reflections are the most expensive materials. */
  transmission: boolean
  reflector: boolean
  /** Multiplier applied to every instanced object count. */
  density: number
  dust: number
}

export const PROFILES: Record<Tier, QualityProfile> = {
  high: {
    label: 'Cinematic',
    dpr: [1, 1.75],
    post: true,
    msaa: 4,
    shadows: true,
    shadowMap: 2048,
    transmission: true,
    reflector: true,
    density: 1,
    dust: 1500,
  },
  medium: {
    label: 'Balanced',
    dpr: [1, 1.5],
    post: true,
    msaa: 0,
    shadows: true,
    shadowMap: 1024,
    transmission: false,
    reflector: false,
    density: 0.6,
    dust: 800,
  },
  low: {
    label: 'Lite',
    dpr: [1, 1.25],
    post: false,
    msaa: 0,
    shadows: false,
    shadowMap: 512,
    transmission: false,
    reflector: false,
    density: 0.35,
    dust: 380,
  },
}

export const TIER_ORDER: Tier[] = ['high', 'medium', 'low']

/** Picks a starting tier from input type, viewport and device hints. */
export function detectTier(): Tier {
  if (typeof window === 'undefined') return 'medium'
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.innerWidth < 820
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  if (coarse || narrow) return 'low'
  if (cores <= 4 || memory <= 4) return 'medium'
  return 'high'
}

export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}
