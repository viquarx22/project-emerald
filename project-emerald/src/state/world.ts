import { ZONE_COUNT } from '@/config/layout'

export type WorldPhase = 'loading' | 'gateway' | 'entering' | 'world'

/**
 * Mutable, per-frame world state shared by GSAP (writes) and React Three Fiber (reads).
 * It lives outside React on purpose: scroll and tween values change every frame and must
 * never trigger React renders. React-visible state lives in `ui.ts`.
 *
 * Ownership rules (so animation systems never fight):
 *  - introT, dolly, ambience, portal ........ intro timeline (lib/intro.ts)
 *  - scrollT, edu, journey .................. ScrollTrigger (lib/scroll.ts)
 *  - projectFocus, skill ................... actions.ts tweens
 *  - pointer, aspect, portrait, reduced ..... bootstrap listeners
 *  - time, speed, visibleZones .............. camera rig only
 */
export const world = {
  phase: 'loading' as WorldPhase,

  introT: 0,
  dolly: 0,
  scrollT: 0,

  edu: 0,
  journey: 0,
  projectFocus: 0,
  skill: { x: 0, y: 0, z: 0, zoom: 0 },
  activeCategory: 0,

  ambience: 0,
  portal: 0,
  energy: 0,

  pointer: { x: 0, y: 0 },
  hoverProject: -1,
  hoverInterest: -1,
  hoverTech: -1,

  speed: 0,
  time: 0,
  /** 1 = full ambient motion, 0 = frozen ambient motion (reduced-motion / user toggle). */
  motion: 1,

  aspect: 16 / 9,
  portrait: false,
  reduced: false,

  visibleZones: Array.from({ length: ZONE_COUNT }, () => true) as boolean[],
}
