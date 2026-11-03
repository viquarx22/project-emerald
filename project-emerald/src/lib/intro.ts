import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { world } from '@/state/world'
import { useUI } from '@/state/ui'
import { TUNING } from '@/config/tuning'
import { scrollToSection, setScrollLocked } from './scroll'
import type { SectionId } from '@/types'
import { SECTION_ORDER } from '@/types'

const STORAGE_KEY = 'emerald-entered'

export function hasEnteredBefore(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function setPhase(phase: typeof world.phase) {
  world.phase = phase
  useUI.getState().set({ phase })
}

/** Phase 1: the scene is ready. The camera slowly reveals the gateway out of darkness. */
export function revealGateway() {
  if (world.phase !== 'loading') return
  setPhase('gateway')
  gsap.to(world, { ambience: 0.5, duration: 2.6, ease: 'power2.out' })
  gsap.to(world, { dolly: 1, duration: TUNING.intro.dollySeconds, ease: 'power2.out' })
}

function finish() {
  world.introT = 1
  world.dolly = 1
  world.portal = 0
  setPhase('world')
  setScrollLocked(false)
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* storage can be unavailable (private mode); the intro simply replays next visit */
  }
  window.requestAnimationFrame(() => {
    ScrollTrigger.refresh()
    const hash = window.location.hash.replace('#', '') as SectionId
    if (hash && (SECTION_ORDER as readonly string[]).includes(hash) && hash !== 'home') scrollToSection(hash, true)
  })
}

/** Phase 2: the camera travels through the gateway into the portfolio. */
export function enterWorld() {
  if (world.phase !== 'gateway') return
  if (world.reduced) {
    skipIntro()
    return
  }
  setPhase('entering')
  gsap.killTweensOf(world, 'dolly')

  const tl = gsap.timeline({ onComplete: finish })
  tl.to(world, { ambience: 1, duration: 2.8, ease: 'power2.inOut' }, 0)
    .to(world, { portal: 1, duration: 1.7, ease: 'power2.in' }, 0)
    .to(world, { introT: 1, duration: TUNING.intro.enterSeconds, ease: 'power3.inOut' }, 0.15)
    .to(world, { portal: 0, duration: 1.2, ease: 'power2.out' }, 2.5)

  if (document.getElementById('flash')) {
    tl.fromTo('#flash', { opacity: 0 }, { opacity: 0.85, duration: 0.35, ease: 'power2.in' }, 1.55).to(
      '#flash',
      { opacity: 0, duration: 0.9, ease: 'power2.out' },
      1.9,
    )
  }
}

/** Skip: go straight to the portfolio with a short light-up, never replaying the cinematic. */
export function skipIntro() {
  if (world.phase === 'world') return
  gsap.killTweensOf(world)
  world.introT = 1
  world.dolly = 1
  world.portal = 0
  gsap.to(world, { ambience: 1, duration: world.reduced ? 0.01 : 1.4, ease: 'power2.out' })
  finish()
}
