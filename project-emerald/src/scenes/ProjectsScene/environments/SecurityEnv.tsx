import { useEffect, useMemo, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { ZONE } from '@/config/layout'
import { COLORS } from '@/config/tuning'
import { getMaterials } from '../../common/materials'
import { GridFloor, ShardField } from '../../common/primitives'
import { useQuality, useZoneFrame } from '../../common/Zone'
import { projectBoost } from '../boost'

function shieldShape() {
  const s = new THREE.Shape()
  s.moveTo(0, 4.8)
  s.lineTo(3.9, 3.6)
  s.lineTo(3.9, -0.2)
  s.quadraticCurveTo(3.9, -3.2, 0, -5)
  s.quadraticCurveTo(-3.9, -3.2, -3.9, -0.2)
  s.lineTo(-3.9, 3.6)
  s.lineTo(0, 4.8)
  return s
}

/**
 * PASSWORD SECURITY LAB — a cybersecurity vault: rotating lock rings and bolts around a golden
 * padlock, a glowing shield outline behind it, a pulsing grid floor and falling data-rain.
 */
export function SecurityEnv({ index }: { index: number }) {
  const q = useQuality()
  const m = getMaterials()
  const root = useRef<THREE.Group>(null)
  const rings = useRef<THREE.Group>(null)
  const shield = useMemo(() => new THREE.ShapeGeometry(shieldShape(), 24), [])
  const shieldEdges = useMemo(() => new THREE.EdgesGeometry(shield), [shield])
  useEffect(
    () => () => {
      shield.dispose()
      shieldEdges.dispose()
    },
    [shield, shieldEdges],
  )

  useZoneFrame(ZONE.projects, (_time, dt) => {
    const b = projectBoost[index]
    rings.current?.children.forEach((r, i) => {
      r.rotation.z += dt * (0.25 + i * 0.12) * (1 + b * 2) * (i % 2 === 0 ? 1 : -1)
    })
    root.current?.scale.setScalar(1 + b * 0.04)
  })

  return (
    <group ref={root}>
      <GridFloor position={[0, 0, 0]} size={120} cell={1.6} color={COLORS.mint} opacity={0.4} radius={34} />

      <group position={[0, 6.4, 0]}>
        <group ref={rings}>
          <mesh>
            <torusGeometry args={[5.2, 0.22, 16, 120]} />
            <primitive object={m.metalSteel} attach="material" />
          </mesh>
          <mesh>
            <torusGeometry args={[4.1, 0.14, 12, 100, Math.PI * 1.5]} />
            <primitive object={m.glowAccent} attach="material" />
          </mesh>
          <mesh>
            <torusGeometry args={[3.1, 0.1, 12, 100, Math.PI * 1.2]} />
            <primitive object={m.glowMint} attach="material" />
          </mesh>
        </group>

        {/* Locking bolts */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 5.9, Math.sin(a) * 5.9, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[0.9, 0.34, 0.5]} />
              <primitive object={m.metalDark} attach="material" />
            </mesh>
          )
        })}

        {/* Padlock */}
        <RoundedBox args={[2.6, 2.1, 1]} radius={0.18} smoothness={3} position={[0, -0.5, 0.4]} castShadow>
          <primitive object={m.gold} attach="material" />
        </RoundedBox>
        <mesh position={[0, 0.55, 0.4]}>
          <torusGeometry args={[0.8, 0.2, 12, 40, Math.PI]} />
          <primitive object={m.gold} attach="material" />
        </mesh>
        <mesh position={[0, -0.35, 0.92]}>
          <circleGeometry args={[0.24, 24]} />
          <meshBasicMaterial color="#04130d" />
        </mesh>
        <mesh position={[0, -0.75, 0.92]}>
          <planeGeometry args={[0.16, 0.5]} />
          <meshBasicMaterial color="#04130d" />
        </mesh>

        {/* Shield */}
        <group position={[0, 0, -1.8]} scale={1.15}>
          <lineSegments geometry={shieldEdges}>
            <lineBasicMaterial color={COLORS.mint} transparent opacity={0.8} />
          </lineSegments>
          <mesh geometry={shield}>
            <meshBasicMaterial color={COLORS.accent} transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      </group>

      <ShardField
        zone={ZONE.projects}
        count={Math.round(60 * q.density) + 12}
        shape="box"
        mode="rain"
        stretch={[0.05, 1.2, 0.05]}
        radius={[3, 14]}
        height={[0, 17]}
        size={[0.5, 1.2]}
        speed={1.2}
        seed={81}
        material={m.glowMint}
      />
    </group>
  )
}
