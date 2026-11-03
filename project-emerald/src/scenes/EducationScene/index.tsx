import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { world } from '@/state/world'
import { EDU_PLATFORMS, ZONE, ZONE_ORIGIN, type Vec3 } from '@/config/layout'
import { COLORS } from '@/config/tuning'
import { EDUCATION } from '@/data/education'
import { damp } from '@/lib/math'
import { getMaterials, glassProps } from '../common/materials'
import { GridFloor, MetalText, PillarField, ShardField } from '../common/primitives'
import { useQuality, useZoneFrame } from '../common/Zone'

/** Floating numerals above each milestone come straight from the education data. */
const LABELS = EDUCATION.map((e) => e.result?.display ?? '2027')

interface PlatformProps {
  index: number
  position: Vec3
  label: string
}

function Platform({ index, position, label }: PlatformProps) {
  const q = useQuality()
  const m = getMaterials()
  const glass = glassProps(q.transmission)
  const ringMaterial = useMemo(() => m.glowAccent.clone(), [m])
  const column = useMemo(() => m.glowMint.clone(), [m])
  useEffect(
    () => () => {
      ringMaterial.dispose()
      column.dispose()
    },
    [ringMaterial, column],
  )
  const crystal = useRef<THREE.Mesh>(null)
  const text = useRef<THREE.Group>(null)

  useZoneFrame(ZONE.education, (time, dt, _state, raw) => {
    const active = Math.round(world.edu * (EDU_PLATFORMS.length - 1)) === index ? 1 : 0
    ringMaterial.emissiveIntensity = damp(ringMaterial.emissiveIntensity, 0.5 + active * 3.4, 4, raw)
    column.emissiveIntensity = damp(column.emissiveIntensity, 0.3 + active * 2.4, 4, raw)
    const c = crystal.current
    if (c) {
      c.rotation.y += dt * 0.5
      c.position.y = 4.4 + Math.sin(time * 0.8 + index) * 0.35
      c.scale.setScalar(damp(c.scale.x, 1 + active * 0.3, 5, raw))
    }
    const t = text.current
    if (t) t.scale.setScalar(damp(t.scale.x, 0.82 + active * 0.22, 5, raw))
  })

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[6.4, 7.2, 1, 8]} />
        <primitive object={m.metalDark} attach="material" />
      </mesh>
      <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.1, 5.35, 8]} />
        <primitive object={ringMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.24, 8]} />
        <primitive object={m.glowGold} attach="material" />
      </mesh>
      {/* Support pylon dissolving into the fog below */}
      <mesh position={[0, -18, 0]}>
        <cylinderGeometry args={[1.1, 1.7, 34, 8]} />
        <primitive object={m.metalDark} attach="material" />
      </mesh>
      {/* Light column */}
      <mesh position={[0, 16, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 30, 6]} />
        <primitive object={column} attach="material" />
      </mesh>
      {/* Milestone crystal */}
      <mesh ref={crystal} position={[0, 4.4, 0]} scale={[1, 1.5, 1]} castShadow>
        <octahedronGeometry args={[1.25, 0]} />
        <meshPhysicalMaterial {...glass} flatShading />
      </mesh>
      {/* Metallic typography */}
      <group ref={text} position={[0, 9.2, 0]}>
        <MetalText material={m.metalSteel} size={3.4} depth={0.55}>
          {label}
        </MetalText>
      </group>
    </group>
  )
}

function Bridge({ from, to }: { from: Vec3; to: Vec3 }) {
  const m = getMaterials()
  const { mid, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const direction = b.clone().sub(a)
    const len = direction.length()
    return {
      mid: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction.normalize()),
      length: len,
    }
  }, [from, to])

  return (
    <group position={mid} quaternion={quaternion}>
      <mesh>
        <boxGeometry args={[0.55, 0.12, length * 0.62]} />
        <primitive object={m.metalSteel} attach="material" />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.07, 0.03, length * 0.62]} />
        <primitive object={m.glowAccent} attach="material" />
      </mesh>
      {[-0.22, -0.11, 0, 0.11, 0.22].map((k) => (
        <mesh key={k} position={[0, -0.5 - Math.abs(k) * 2, k * length]}>
          <boxGeometry args={[1.4 - Math.abs(k) * 2, 0.08, 0.35]} />
          <primitive object={m.metalDark} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

/**
 * EXPERIENCE 03 — SPATIAL EDUCATION TIMELINE
 * An ascending architectural path: three octagonal platforms joined by bridges, each carrying a
 * refracting milestone crystal and extruded metallic numerals. Scroll moves the camera from
 * platform to platform; the active platform lights up.
 */
export function EducationScene() {
  const q = useQuality()
  const m = getMaterials()

  return (
    <group position={ZONE_ORIGIN.education}>
      {EDU_PLATFORMS.map((p, i) => (
        <Platform key={i} index={i} position={p} label={LABELS[i]} />
      ))}
      <Bridge from={EDU_PLATFORMS[0]} to={EDU_PLATFORMS[1]} />
      <Bridge from={EDU_PLATFORMS[1]} to={EDU_PLATFORMS[2]} />

      <GridFloor position={[0, -16, -8]} size={220} cell={4} color={COLORS.accent} opacity={0.2} radius={85} />
      <ShardField zone={ZONE.education} count={Math.round(60 * q.density)} radius={[14, 40]} height={[-6, 24]} size={[0.15, 0.7]} center={[0, 0, -8]} seed={41} castShadow={q.shadows} />
      <ShardField zone={ZONE.education} count={Math.round(30 * q.density)} radius={[10, 36]} height={[-6, 22]} size={[0.05, 0.14]} center={[0, 0, -8]} seed={42} material={m.glowMint} />
      <PillarField count={Math.round(44 * q.density)} radius={[30, 85]} height={[18, 60]} width={[2.5, 8]} floorY={-16} center={[0, 0, -8]} seed={13} />
    </group>
  )
}
