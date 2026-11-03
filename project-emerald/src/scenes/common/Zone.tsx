import { Component, useRef, type ReactNode } from 'react'
import { useFrame, type RootState } from '@react-three/fiber'
import type { Group } from 'three'
import { world } from '@/state/world'
import { PROFILES } from '@/config/quality'
import { useUI } from '@/state/ui'

/** Isolates failures: if one scene throws, the rest of the world (and the page) keep working. */
export class SceneBoundary extends Component<{ children: ReactNode; name?: string; onError?: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.error(`[emerald] scene "${this.props.name ?? 'unnamed'}" failed to render`, error)
    this.props.onError?.()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** A zone is a group the camera rig shows only while the camera is near it. */
export function Zone({ index, name, children }: { index: number; name: string; children: ReactNode }) {
  const ref = useRef<Group>(null)
  useFrame(() => {
    const group = ref.current
    const visible = world.visibleZones[index]
    if (group && group.visible !== visible) group.visible = visible
  })
  return (
    <SceneBoundary name={name}>
      <group ref={ref}>{children}</group>
    </SceneBoundary>
  )
}

/**
 * Frame callback that only runs while the zone is visible.
 * `time` is world time (frozen when ambient motion is off); `dt` is already scaled by motion;
 * `rawDt` is not, and should be used for interaction feedback (hover, selection) that must always animate.
 */
export function useZoneFrame(
  zone: number,
  callback: (time: number, dt: number, state: RootState, rawDt: number) => void,
) {
  useFrame((state, delta) => {
    if (!world.visibleZones[zone]) return
    const raw = Math.min(delta, 0.05)
    callback(world.time, raw * world.motion, state, raw)
  })
}

export function useQuality() {
  const tier = useUI((s) => s.tier)
  return PROFILES[tier]
}
