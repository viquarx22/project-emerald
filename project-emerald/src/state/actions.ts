import gsap from 'gsap'
import { world } from './world'
import { useUI } from './ui'
import { PROJECTS } from '@/data/projects'
import { SKILL_CATEGORIES } from '@/data/skills'
import { skillNodePosition } from '@/config/layout'

const mod = (n: number, m: number) => ((n % m) + m) % m

/** Select a project and fly the camera to its environment along the shortest path around the ring. */
export function selectProject(next: number) {
  const n = PROJECTS.length
  const target = mod(next, n)
  const current = world.projectFocus
  let delta = mod(target - current, n)
  if (delta > n / 2) delta -= n
  useUI.getState().set({ activeProject: target })
  gsap.to(world, {
    projectFocus: current + delta,
    duration: world.reduced ? 0.01 : 1.9,
    ease: 'power3.inOut',
    overwrite: 'auto',
  })
}

export const stepProject = (dir: 1 | -1) => selectProject(useUI.getState().activeProject + dir)

/** Select a skill category: the ecosystem camera glides to that crystal and its technologies unfold. */
export function selectCategory(i: number) {
  const idx = mod(i, SKILL_CATEGORIES.length)
  const [x, y, z] = skillNodePosition(idx, SKILL_CATEGORIES.length)
  world.activeCategory = idx
  world.hoverTech = -1
  useUI.getState().set({ activeCategory: idx, hoverTech: -1 })
  gsap.to(world.skill, {
    x,
    y,
    z,
    zoom: 1,
    duration: world.reduced ? 0.01 : 1.5,
    ease: 'power3.inOut',
    overwrite: 'auto',
  })
}

export function resetSkillOverview() {
  gsap.to(world.skill, { zoom: 0, duration: world.reduced ? 0.01 : 1.2, ease: 'power3.inOut', overwrite: 'auto' })
}

export function hoverInterest(i: number) {
  world.hoverInterest = i
  useUI.getState().set({ hoverInterest: i })
}

export function hoverTech(i: number) {
  world.hoverTech = i
  useUI.getState().set({ hoverTech: i })
}

export function hoverProject(i: number) {
  world.hoverProject = i
}

let toastTimer: number | undefined
export function showToast(message: string) {
  useUI.getState().set({ toast: message })
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => useUI.getState().set({ toast: null }), 2600)
}
