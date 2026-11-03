import { useEffect, useMemo, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { world } from '@/state/world'
import { ZONE, ZONE_ORIGIN } from '@/config/layout'
import { COLORS } from '@/config/tuning'
import { setCursor3D } from '@/lib/dom'
import { getMaterials, glassProps } from '../common/materials'
import { GridFloor, PillarField, ShardField } from '../common/primitives'
import { useQuality, useZoneFrame } from '../common/Zone'

/**
 * The Emerald Core: a faceted, refracting crystal with a luminous heart, gyroscopic gold rings,
 * orbiting shards and monolith silhouettes. Hover it to spin up the rings.
 */
export function HeroScene() {
  const q = useQuality()
  const m = getMaterials()
  const glass = glassProps(q.transmission)
  const core = useRef<THREE.Group>(null)
  const gyro = useRef<THREE.Group>(null)
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.64, 1)), [])
  useEffect(() => () => edges.dispose(), [edges])

  useZoneFrame(ZONE.hero, (time, dt) => {
    const c = core.current
    if (c) {
      c.rotation.y += dt * (0.14 + world.energy * 0.9)
      c.rotation.x = Math.sin(time * 0.25) * 0.12 + world.pointer.y * 0.2 * world.motion
      c.rotation.z = Math.cos(time * 0.2) * 0.08
    }
    gyro.current?.children.forEach((ring, i) => {
      const dir = i % 2 === 0 ? 1 : -1
      ring.rotation.x += dt * (0.18 + i * 0.07 + world.energy * 0.5) * dir
      ring.rotation.y += dt * (0.1 + i * 0.05)
    })
    world.energy = Math.max(0, world.energy - dt * 0.6)
  })

  const hover = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    world.energy = 1
    setCursor3D(true)
  }

  return (
    <group position={ZONE_ORIGIN.hero}>
      {/* Plinth */}
      <mesh position={[0, -6.4, 0]} receiveShadow>
        <cylinderGeometry args={[9.5, 10.5, 0.8, 72]} />
        <primitive object={m.metalDark} attach="material" />
      </mesh>
      <mesh position={[0, -5.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8.1, 8.35, 96]} />
        <primitive object={m.glowAccent} attach="material" />
      </mesh>
      <mesh position={[0, -5.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.2, 6.27, 96]} />
        <primitive object={m.glowGold} attach="material" />
      </mesh>
      <GridFloor position={[0, -5.95, 0]} size={120} cell={3} opacity={0.22} radius={46} />

      {/* Core */}
      <group ref={core} position={[0, 1, 0]}>
        <mesh castShadow onPointerMove={hover} onPointerOver={hover} onPointerOut={() => setCursor3D(false)}>
          <icosahedronGeometry args={[2.6, 1]} />
          <meshPhysicalMaterial {...glass} flatShading />
        </mesh>
        <mesh>
          <octahedronGeometry args={[1.15, 0]} />
          <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={3.2} />
        </mesh>
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={COLORS.mint} transparent opacity={0.5} />
        </lineSegments>
      </group>

      {/* Gyroscope */}
      <group ref={gyro} position={[0, 1, 0]}>
        <mesh>
          <torusGeometry args={[3.9, 0.04, 12, 160]} />
          <primitive object={m.gold} attach="material" />
        </mesh>
        <mesh rotation={[1.1, 0.4, 0]}>
          <torusGeometry args={[4.7, 0.032, 12, 160]} />
          <primitive object={m.glowMint} attach="material" />
        </mesh>
        <mesh rotation={[0.4, 1.2, 0.5]}>
          <torusGeometry args={[5.5, 0.026, 12, 160]} />
          <primitive object={m.metalSteel} attach="material" />
        </mesh>
      </group>

      <ShardField zone={ZONE.hero} count={Math.round(46 * q.density)} radius={[6, 11]} height={[-3, 6]} size={[0.12, 0.45]} seed={21} castShadow={q.shadows} />
      <ShardField zone={ZONE.hero} count={Math.round(26 * q.density)} radius={[5, 12]} height={[-4, 8]} size={[0.05, 0.14]} seed={22} material={m.glowMint} />
      <PillarField count={Math.round(46 * q.density)} radius={[30, 95]} height={[12, 55]} width={[2.5, 8]} floorY={-6} center={[0, 0, -20]} seed={5} />
    </group>
  )
}
