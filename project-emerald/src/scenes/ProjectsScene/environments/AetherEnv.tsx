import { useRef } from 'react'
import * as THREE from 'three'
import { ZONE } from '@/config/layout'
import { COLORS } from '@/config/tuning'
import { getMaterials, glassProps } from '../../common/materials'
import { Beam, ShardField } from '../../common/primitives'
import { useQuality, useZoneFrame } from '../../common/Zone'
import { projectBoost } from '../boost'

/**
 * AETHER — abstract futuristic digital architecture:
 * a glass-skinned spire encircled by counter-rotating square frames and a helix of floating slabs.
 */
export function AetherEnv({ index }: { index: number }) {
  const q = useQuality()
  const m = getMaterials()
  const glass = glassProps(q.transmission)
  const root = useRef<THREE.Group>(null)
  const frames = useRef<THREE.Group>(null)
  const spire = useRef<THREE.Group>(null)

  useZoneFrame(ZONE.projects, (time, dt) => {
    const b = projectBoost[index]
    frames.current?.children.forEach((c, i) => {
      c.rotation.y += dt * (0.2 + i * 0.06) * (1 + b * 1.8) * (i % 2 === 0 ? 1 : -1)
    })
    if (spire.current) {
      spire.current.rotation.y += dt * (0.1 + b * 0.5)
      spire.current.position.y = 8 + Math.sin(time * 0.5) * 0.2
    }
    root.current?.scale.setScalar(1 + b * 0.04)
  })

  return (
    <group ref={root}>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[7.5, 8.2, 0.5, 6]} />
        <primitive object={m.metalDark} attach="material" />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.6, 6.8, 6]} />
        <primitive object={m.glowAccent} attach="material" />
      </mesh>

      <group ref={spire} position={[0, 8, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.35, 1.5, 15, 6]} />
          <primitive object={m.metalSteel} attach="material" />
        </mesh>
        <mesh scale={[1.25, 1, 1.25]}>
          <cylinderGeometry args={[0.45, 1.8, 15.2, 6]} />
          <meshPhysicalMaterial {...glass} />
        </mesh>
        <mesh position={[0, 8.2, 0]}>
          <octahedronGeometry args={[0.7, 0]} />
          <primitive object={m.glowMint} attach="material" />
        </mesh>
      </group>

      <group ref={frames} position={[0, 8, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <group key={i} position={[0, (i - 2) * 2.8, 0]}>
            <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
              <torusGeometry args={[3 + (2 - Math.abs(i - 2)) * 0.9, 0.07, 4, 4]} />
              <primitive object={i % 2 === 0 ? m.glowAccent : m.gold} attach="material" />
            </mesh>
          </group>
        ))}
      </group>

      <ShardField
        zone={ZONE.projects}
        count={Math.round(26 * q.density) + 6}
        shape="box"
        stretch={[3, 0.12, 3]}
        radius={[8, 13]}
        height={[-1, 16]}
        size={[0.5, 1.1]}
        seed={61}
        color="#1b4d3c"
        emissive={COLORS.accent}
      />
      <ShardField zone={ZONE.projects} count={Math.round(30 * q.density)} radius={[5, 14]} height={[0, 17]} size={[0.05, 0.13]} seed={62} material={m.glowMint} />
      <Beam position={[0, 10, 0]} height={20} radius={5} intensity={0.2} />
    </group>
  )
}
