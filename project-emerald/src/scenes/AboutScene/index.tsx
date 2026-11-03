import { useEffect, useMemo, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { world } from '@/state/world'
import { ZONE, ZONE_ORIGIN } from '@/config/layout'
import { COLORS } from '@/config/tuning'
import { ABOUT } from '@/data/profile'
import { damp } from '@/lib/math'
import { setCursor3D } from '@/lib/dom'
import { hoverInterest } from '@/state/actions'
import { getMaterials } from '../common/materials'
import { GridFloor, PillarField, ShardField } from '../common/primitives'
import { useQuality, useZoneFrame } from '../common/Zone'

const COUNT = ABOUT.interests.length
const ORBIT_RADIUS = 7.2

function NodeGeometry({ index }: { index: number }) {
  switch (index % 6) {
    case 0:
      return <boxGeometry args={[1.3, 1.3, 1.3]} />
    case 1:
      return <octahedronGeometry args={[1, 0]} />
    case 2:
      return <dodecahedronGeometry args={[0.9, 0]} />
    case 3:
      return <icosahedronGeometry args={[0.95, 0]} />
    case 4:
      return <tetrahedronGeometry args={[1.1, 0]} />
    default:
      return <torusGeometry args={[0.7, 0.26, 12, 32]} />
  }
}

/**
 * Interest constellation: six nodes orbit a wireframe core, one for each interest in the About
 * copy. Hovering a node highlights the matching chip in the DOM and vice versa.
 */
export function AboutScene() {
  const q = useQuality()
  const m = getMaterials()
  const nodes = useRef<Array<THREE.Mesh | null>>([])
  const core = useRef<THREE.Group>(null)

  const linePositions = useMemo(() => new Float32Array(COUNT * 6), [])
  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    return g
  }, [linePositions])
  const wire = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.1, 1)), [])
  useEffect(
    () => () => {
      lineGeometry.dispose()
      wire.dispose()
    },
    [lineGeometry, wire],
  )

  useZoneFrame(ZONE.about, (time, dt, _state, raw) => {
    if (core.current) {
      core.current.rotation.y += dt * 0.18
      core.current.rotation.x += dt * 0.07
    }
    for (let i = 0; i < COUNT; i++) {
      const mesh = nodes.current[i]
      if (!mesh) continue
      const a = time * 0.14 + (i / COUNT) * Math.PI * 2
      const x = Math.cos(a) * ORBIT_RADIUS
      const z = Math.sin(a) * ORBIT_RADIUS * 0.85
      const y = Math.sin(a * 1.0 + i) * 2.4
      mesh.position.set(x, y, z)
      mesh.rotation.x += dt * 0.5
      mesh.rotation.y += dt * 0.7

      const hovered = world.hoverInterest === i ? 1 : 0
      mesh.scale.setScalar(damp(mesh.scale.x, 1 + hovered * 0.55, 8, raw))
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = damp(mat.emissiveIntensity, 0.35 + hovered * 2.6, 8, raw)

      linePositions[i * 6 + 3] = x
      linePositions[i * 6 + 4] = y
      linePositions[i * 6 + 5] = z
    }
    lineGeometry.attributes.position.needsUpdate = true
  })

  const over = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    hoverInterest(i)
    setCursor3D(true)
  }
  const out = () => {
    hoverInterest(-1)
    setCursor3D(false)
  }

  return (
    <group position={ZONE_ORIGIN.about}>
      <group ref={core}>
        <lineSegments geometry={wire}>
          <lineBasicMaterial color={COLORS.mint} transparent opacity={0.45} />
        </lineSegments>
        <mesh>
          <icosahedronGeometry args={[0.9, 1]} />
          <primitive object={m.glowAccent} attach="material" />
        </mesh>
      </group>

      <lineSegments geometry={lineGeometry} frustumCulled={false}>
        <lineBasicMaterial color={COLORS.mint} transparent opacity={0.3} />
      </lineSegments>

      {ABOUT.interests.map((label, i) => (
        <mesh
          key={label}
          ref={(el) => {
            nodes.current[i] = el
          }}
          castShadow
          onPointerOver={over(i)}
          onPointerOut={out}
        >
          <NodeGeometry index={i} />
          <meshStandardMaterial color="#1d5a45" metalness={0.9} roughness={0.25} emissive={COLORS.accent} emissiveIntensity={0.35} flatShading />
        </mesh>
      ))}

      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.85, 1]}>
        <torusGeometry args={[ORBIT_RADIUS, 0.015, 6, 200]} />
        <primitive object={m.glowMint} attach="material" />
      </mesh>

      <GridFloor position={[0, -8, 0]} size={160} cell={3} opacity={0.18} radius={55} />
      <ShardField zone={ZONE.about} count={Math.round(54 * q.density)} radius={[12, 34]} height={[-6, 16]} size={[0.15, 0.6]} seed={31} />
      <ShardField zone={ZONE.about} count={Math.round(30 * q.density)} radius={[8, 30]} height={[-6, 14]} size={[0.05, 0.14]} seed={32} material={m.glowMint} />
      <PillarField count={Math.round(40 * q.density)} radius={[30, 90]} height={[12, 52]} width={[2.5, 8]} floorY={-8} center={[0, 0, -12]} seed={8} />
    </group>
  )
}
