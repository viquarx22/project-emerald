import { world } from '@/state/world'
import { PROJECTS } from '@/data/projects'
import { clamp, damp, mod } from '@/lib/math'

/**
 * How "awake" each project environment is (0..1): raised by hover and by the camera's proximity.
 * Environments read this to spin faster, glow and swell. Written once per frame by ProjectsScene.
 */
export const projectBoost = new Float32Array(PROJECTS.length)

export function updateProjectBoost(rawDt: number) {
  const n = PROJECTS.length
  for (let i = 0; i < n; i++) {
    const d = Math.abs(mod(world.projectFocus - i + n / 2, n) - n / 2)
    const focus = 1 - clamp(d, 0, 1)
    const hover = world.hoverProject === i ? 1 : 0
    projectBoost[i] = damp(projectBoost[i], Math.max(focus * 0.6, hover), 5, rawDt)
  }
}
