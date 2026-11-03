import { useRef } from 'react'
import * as THREE from 'three'
import { ZONE, ZONE_ORIGIN } from '@/config/layout'
import { COLORS } from '@/config/tuning'
import { getMaterials, glassProps } from '../common/materials'
import { Beam, GridFloor, PillarField, ShardField } from '../common/primitives'
import { useQuality, useZoneFrame } from '../common/Zone'

const RIPPLES = 4

/**
 * Contact beacon: a luminous spire on a plinth, floor ripples radiating outward and gold halos
 * drifting around it. A calm final landing after the journey.
 */
export function ContactScene() {
  const q = useQuality()
  const m = getMaterials()
  const glass = glassProps(q.transmission)
  const halos = useRef<THREE.Group>(null)
  const ripples = useRef<Array<THREE.Mesh | null>>([])

  useZoneFrame(ZONE.contact, (time, dt) => {
    halos.current?.children.forEach((h, i) => {
      h.rotation.x += dt * (0.2 + i * 0.08) * (i % 2 === 0 ? 1 : -1)
      h.rotation.y += dt * (0.12 + i * 0.05)
    })
    for (let i = 0; i < RIPPLES; i++) {
      const mesh = ripples.current[i]
      if (!mesh) continue
      const p = (time * 0.12 + i / RIPPLES) % 1
      mesh.scale.setScalar(2 + p * 26)
      ;(mesh.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.5
    }
  })

  return (
    <group position={ZONE_ORIGIN.contact}>
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6.8, 0.6, 64]} />
        <primitive object={m.metalDark} attach="material" />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.2, 5.4, 96]} />
        <primitive object={m.glowGold} attach="material" />
      </mesh>

      {/* Spire */}
      <mesh position={[0, 8.5, 0]} castShadow>
        <cylinderGeometry args={[0.28, 1.5, 16, 8]} />
        <meshPhysicalMaterial {...glass} flatShading />
      </mesh>
      <mesh position={[0, 8.5, 0]}>
        <cylinderGeometry args={[0.09, 0.2, 16.4, 8]} />
        <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={3.4} />
      </mesh>
      <mesh position={[0, 17.2, 0]}>
        <octahedronGeometry args={[0.7, 0]} />
        <primitive object={m.glowMint} attach="material" />
      </mesh>

      <group ref={halos} position={[0, 9, 0]}>
        <mesh>
          <torusGeometry args={[3.2, 0.035, 10, 120]} />
          <primitive object={m.gold} attach="material" />
        </mesh>
        <mesh rotation={[1.2, 0, 0]}>
          <torusGeometry args={[4.2, 0.03, 10, 120]} />
          <primitive object={m.glowMint} attach="material" />
        </mesh>
        <mesh rotation={[0.5, 0.9, 0]}>
          <torusGeometry args={[5.1, 0.026, 10, 120]} />
          <primitive object={m.metalSteel} attach="material" />
        </mesh>
      </group>

      {Array.from({ length: RIPPLES }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            ripples.current[i] = el
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.05, 0]}
        >
          <ringGeometry args={[0.97, 1, 128]} />
          <meshBasicMaterial color={COLORS.mint} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}

      <Beam position={[0, 10.5, 0]} height={21} radius={5} intensity={0.16} color={COLORS.mint} />
      <GridFloor position={[0, 0, 0]} size={220} cell={3} opacity={0.2} radius={75} />
      <ShardField zone={ZONE.contact} count={Math.round(60 * q.density)} radius={[10, 38]} height={[0, 26]} size={[0.15, 0.6]} seed={131} />
      <ShardField zone={ZONE.contact} count={Math.round(40 * q.density)} radius={[6, 34]} height={[0, 24]} size={[0.05, 0.13]} seed={132} material={m.glowMint} />
      <PillarField count={Math.round(44 * q.density)} radius={[34, 100]} height={[14, 60]} width={[3, 9]} center={[0, 0, -20]} seed={29} />
    </group>
  )
}
