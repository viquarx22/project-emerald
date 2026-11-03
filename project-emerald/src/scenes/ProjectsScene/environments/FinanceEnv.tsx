import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { ZONE } from '@/config/layout'
import { COLORS } from '@/config/tuning'
import { getMaterials } from '../../common/materials'
import { GridFloor, ShardField } from '../../common/primitives'
import { useQuality, useZoneFrame } from '../../common/Zone'
import { projectBoost } from '../boost'

const BARS = [2.0, 3.2, 2.7, 4.4, 5.3, 4.8, 6.6, 7.5, 9.2]

/**
 * STUDENT FINANCE MANAGER — financial-technology skyline: a rising bar-chart of metal towers with
 * golden caps, an orbiting ring of coins and a luminous trend line carrying a travelling pulse.
 */
export function FinanceEnv({ index }: { index: number }) {
  const q = useQuality()
  const m = getMaterials()
  const root = useRef<THREE.Group>(null)
  const bars = useRef<THREE.InstancedMesh>(null)
  const caps = useRef<THREE.InstancedMesh>(null)
  const pulse = useRef<THREE.Mesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const trend = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 40; i++) {
      const t = i / 40
      pts.push(new THREE.Vector3((t - 0.5) * 15, 3.4 + t * 9.5 + Math.sin(t * 9) * 0.6, 1.4))
    }
    return pts
  }, [])

  const update = (time: number, boost: number) => {
    const b = bars.current
    const c = caps.current
    if (!b || !c) return
    BARS.forEach((base, i) => {
      const h = base * (1 + 0.07 * Math.sin(time * 0.8 + i) + boost * 0.12)
      const x = (i - 4) * 1.7
      dummy.position.set(x, h / 2, 0)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, h, 1)
      dummy.updateMatrix()
      b.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x, h + 0.07, 0)
      dummy.scale.set(1.08, 1, 1.08)
      dummy.updateMatrix()
      c.setMatrixAt(i, dummy.matrix)
    })
    b.instanceMatrix.needsUpdate = true
    c.instanceMatrix.needsUpdate = true
  }

  useLayoutEffect(() => {
    update(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const b = bars.current
    const c = caps.current
    return () => {
      b?.dispose()
      c?.dispose()
    }
  }, [])

  useZoneFrame(ZONE.projects, (time) => {
    const boost = projectBoost[index]
    update(time, boost)
    const p = pulse.current
    if (p) {
      const f = (time * 0.12) % 1
      const point = trend[Math.min(trend.length - 1, Math.floor(f * (trend.length - 1)))]
      p.position.copy(point)
    }
    root.current?.scale.setScalar(1 + boost * 0.04)
  })

  return (
    <group ref={root}>
      <GridFloor position={[0, 0, 0]} size={120} cell={2} color={COLORS.gold} opacity={0.32} radius={34} />
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[18.5, 0.5, 5]} />
        <primitive object={m.metalDark} attach="material" />
      </mesh>

      <instancedMesh ref={bars} args={[undefined, undefined, BARS.length]} frustumCulled={false} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#134d39" metalness={0.85} roughness={0.25} emissive={COLORS.accent} emissiveIntensity={0.18} />
      </instancedMesh>
      <instancedMesh ref={caps} args={[undefined, undefined, BARS.length]} frustumCulled={false}>
        <boxGeometry args={[1, 0.14, 1]} />
        <primitive object={m.gold} attach="material" />
      </instancedMesh>

      <Line points={trend} color={COLORS.mint} lineWidth={2.2} />
      <mesh ref={pulse}>
        <sphereGeometry args={[0.28, 16, 12]} />
        <primitive object={m.glowMint} attach="material" />
      </mesh>

      <group position={[0, 6, 0]}>
        <ShardField
          zone={ZONE.projects}
          count={Math.round(14 * q.density) + 4}
          shape="coin"
          radius={[8, 11]}
          height={[-3, 9]}
          size={[0.55, 0.9]}
          speed={0.8}
          seed={91}
          material={m.gold}
        />
      </group>
      <ShardField zone={ZONE.projects} count={Math.round(26 * q.density)} radius={[6, 14]} height={[0, 16]} size={[0.05, 0.13]} seed={92} material={m.glowGold} />
    </group>
  )
}
