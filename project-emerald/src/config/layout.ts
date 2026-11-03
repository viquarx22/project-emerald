/**
 * Spatial layout of the 3D world. Pure numbers (no three.js import) so the DOM bundle can share it.
 * The world is a long corridor running along -Z; each portfolio section owns one zone.
 */
export type Vec3 = [number, number, number]

export const ZONE = {
  gateway: 0,
  hero: 1,
  about: 2,
  education: 3,
  skills: 4,
  projects: 5,
  journey: 6,
  contact: 7,
} as const

export const ZONE_COUNT = 8

export const ZONE_ORIGIN: Record<keyof typeof ZONE, Vec3> = {
  gateway: [0, 0, 0],
  hero: [0, 0, -80],
  about: [0, 0, -160],
  education: [0, 0, -250],
  skills: [0, 0, -355],
  projects: [0, 0, -490],
  journey: [0, 0, -640],
  contact: [0, 0, -830],
}

/* ---------------------------------- Education --------------------------------- */
/** Platform centres relative to the education zone origin: an ascending architectural path. */
export const EDU_PLATFORMS: Vec3[] = [
  [-9, -3, 18],
  [1, 0, -8],
  [11, 3, -34],
]

/* ----------------------------------- Skills ----------------------------------- */
export const SKILL_RING_RADIUS = 9.5

export function skillNodePosition(i: number, n = 6): Vec3 {
  const a = (i / n) * Math.PI * 2 + Math.PI / 6
  return [Math.cos(a) * SKILL_RING_RADIUS, Math.sin(a * 2) * 1.6, Math.sin(a) * SKILL_RING_RADIUS * 0.8]
}

/* ---------------------------------- Projects ---------------------------------- */
export const PROJECT_RING_RADIUS = 75

/** Position of a project environment relative to the projects zone origin. */
export function projectPosition(i: number, n: number): Vec3 {
  const a = (i / n) * Math.PI * 2
  return [Math.sin(a) * PROJECT_RING_RADIUS, 0, Math.cos(a) * PROJECT_RING_RADIUS]
}

/** Outward unit direction (XZ) of a project environment. */
export function projectOutward(i: number, n: number): [number, number] {
  const a = (i / n) * Math.PI * 2
  return [Math.sin(a), Math.cos(a)]
}

/* ----------------------------------- Journey ---------------------------------- */
export const JOURNEY_GATE_SPACING = 28
export const JOURNEY_GATE_RADIUS = 7.2
