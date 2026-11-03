import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ZONE } from '@/config/layout'
import { COLORS } from '@/config/tuning'
import { getMaterials } from '../../common/materials'
import { Beam, GridFloor, MetalText, ShardField } from '../../common/primitives'
import { useQuality, useZoneFrame } from '../../common/Zone'
import { projectBoost } from '../boost'

/**
 * PERSONAL PORTFOLIO — a monolith carrying the MV monogram, framed by a wireframe "window" and
 * a slow orbit of rings: the site you are standing in, rendered as an object.
 */
export function PortfolioEnv({ index }: { index: number }) {
  const q = useQuality()
  const m = getMaterials()
  const root = useRef<THREE.Group>(null)
  const orbit = useRef<THREE.Group>(null)
  const frame = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(11, 7.4, 0.6)), [])
  useEffect(() => () => frame.dispose(), [frame])

  useZoneFrame(ZONE.projects, (time, dt) => {
    const b = projectBoost[index]
    orbit.current?.children.forEach((r, i) => {
      r.rotation.z += dt * (0.2 + i * 0.1) * (1 + b * 2) * (i % 2 === 0 ? 1 : -1)
    })
    if (root.current) {
      root.current.scale.setScalar(1 + b * 0.04)
      root.current.position.y = Math.sin(time * 0.5) * 0.12
    }
  })

  return (
    <group ref={root}>
      <GridFloor position={[0, 0, 0]} size={120} cell={2} opacity={0.3} radius={34} />
      <mesh position={[0, 6.2, 0]} castShadow>
        <boxGeometry args={[7, 10, 0.8]} />
        <primitive object={m.metalDark} attach="material" />
      </mesh>
      <MetalText material={m.gold} size={3.2} depth={0.4} position={[0, 6.4, 0.62]}>
        MV
      </MetalText>
      <lineSegments geometry={frame} position={[0, 6.2, -2.2]}>
        <lineBasicMaterial color={COLORS.mint} transparent opacity={0.65} />
      </lineSegments>
      <group ref={orbit} position={[0, 6.2, 0]}>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[7.5, 0.04, 8, 140]} />
          <primitive object={m.glowAccent} attach="material" />
        </mesh>
        <mesh rotation={[Math.PI / 2.1, 0.4, 0]}>
          <torusGeometry args={[8.6, 0.03, 8, 140, Math.PI * 1.4]} />
          <primitive object={m.gold} attach="material" />
        </mesh>
      </group>
      <ShardField zone={ZONE.projects} count={Math.round(26 * q.density) + 6} radius={[8, 14]} height={[-1, 15]} size={[0.15, 0.5]} seed={101} />
      <Beam position={[0, 10, 0]} height={20} radius={4.5} intensity={0.18} />
    </group>
  )
}
