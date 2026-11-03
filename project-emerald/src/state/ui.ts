import { create } from 'zustand'
import type { SectionId } from '@/types'
import { TIER_ORDER, type Tier } from '@/config/quality'
import type { WorldPhase } from './world'

export interface UIState {
  phase: WorldPhase
  /** True once the lazy 3D chunk has mounted and its shaders have compiled. */
  sceneReady: boolean
  webgl: boolean
  tier: Tier
  qualityMode: 'auto' | Tier
  motion: boolean
  activeSection: SectionId
  activeProject: number
  activeCategory: number
  eduIndex: number
  journeyIndex: number
  hoverInterest: number
  hoverTech: number
  menuOpen: boolean
  toast: string | null
  set: (patch: Partial<UIState>) => void
  degrade: () => void
}

export const useUI = create<UIState>((set, get) => ({
  phase: 'loading',
  sceneReady: false,
  webgl: true,
  tier: 'medium',
  qualityMode: 'auto',
  motion: true,
  activeSection: 'home',
  activeProject: 0,
  activeCategory: 0,
  eduIndex: 0,
  journeyIndex: 0,
  hoverInterest: -1,
  hoverTech: -1,
  menuOpen: false,
  toast: null,
  set: (patch) => set(patch),
  degrade: () => {
    const { tier, qualityMode } = get()
    if (qualityMode !== 'auto') return // the visitor chose a tier; respect it
    const next = TIER_ORDER[Math.min(TIER_ORDER.indexOf(tier) + 1, TIER_ORDER.length - 1)]
    if (next !== tier) set({ tier: next })
  },
}))
