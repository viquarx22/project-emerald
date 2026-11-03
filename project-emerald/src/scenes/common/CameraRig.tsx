import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { world } from '@/state/world'
import { ZONE_COUNT } from '@/config/layout'
import { TUNING } from '@/config/tuning'
import { damp } from '@/lib/math'
import { makePose, samplePose } from './poses'

const UP = new THREE.Vector3(0, 1, 0)
const _dir = new THREE.Vector3()
const _right = new THREE.Vector3()

/**
 * The single owner of the camera. Reads `world` (written by GSAP) and produces one smoothed
 * camera pose per frame, so scroll, intro and pointer never fight over the camera.
 */
export function CameraRig() {
  const target = useMemo(makePose, [])
  const smooth = useMemo(makePose, [])
  const ready = useRef(false)
  const prevT = useRef(0)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const camera = state.camera as THREE.PerspectiveCamera

    world.aspect = state.size.width / Math.max(state.size.height, 1)
    world.portrait = world.aspect < 0.9
    world.time += dt * world.motion

    const t = world.introT + world.scrollT
    const speedNow = Math.abs(t - prevT.current) / Math.max(dt, 1e-4)
    prevT.current = t
    world.speed = damp(world.speed, Math.min(speedNow, 3), 4, dt)

    samplePose(t, target)

    // Pointer parallax: the whole world subtly leans toward the visitor's cursor / finger.
    const parallax =
      (world.portrait ? TUNING.rig.parallaxPortrait : TUNING.rig.parallaxDesktop) * world.motion
    if (parallax > 0) {
      _dir.subVectors(target.look, target.pos).normalize()
      _right.crossVectors(_dir, UP).normalize()
      target.pos.addScaledVector(_right, world.pointer.x * parallax).addScaledVector(UP, world.pointer.y * parallax * 0.6)
      target.look.addScaledVector(_right, world.pointer.x * parallax * 0.35)
    }

    if (!ready.current) {
      smooth.pos.copy(target.pos)
      smooth.look.copy(target.look)
      ready.current = true
    } else {
      const lambda = world.phase === 'world' ? TUNING.rig.dampWorld : TUNING.rig.dampIntro
      const k = 1 - Math.exp(-lambda * dt)
      smooth.pos.lerp(target.pos, k)
      smooth.look.lerp(target.look, k)
    }

    camera.position.copy(smooth.pos)
    camera.lookAt(smooth.look)

    // Field of view widens slightly with travel speed for a sense of velocity.
    const baseFov = world.portrait ? TUNING.rig.fovPortrait : TUNING.rig.fovDesktop
    const fov = baseFov + Math.min(world.speed, 2) * TUNING.rig.fovKick * 0.5 * world.motion
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = damp(camera.fov, fov, 6, dt)
      camera.updateProjectionMatrix()
    }

    for (let z = 0; z < ZONE_COUNT; z++) world.visibleZones[z] = Math.abs(t - z) < 1.65
  })

  return null
}
