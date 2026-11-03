import { useEffect, useMemo, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { world } from '@/state/world'
import { SKILL_RING_RADIUS, ZONE, ZONE_ORIGIN, skillNodePosition } from '@/config/layout'
import { COLORS } from '@/config/tuning'
import { SKILL_CATEGORIES } from '@/data/skills'
import { damp } from '@/lib/math'
import { isBackgroundTarget, setCursor3D } from '@/lib/dom'
import { selectCategory } from '@/state/actions'
import { getMaterials } from '../common/materials'
import { GridFloor, PillarField, ShardField } from '../common/primitives'
import { useQuality, useZoneFrame } from '../common/Zone'

const COUNT = SKILL_CATEGORIES.length
const SAT_RADIUS = 3.3

function CategoryGeometry({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <boxGeometry args={[1.9, 1.9, 1.9]} />
    case 1:
      return <octahedronGeometry args={[1.6, 0]} />
    case 2:
      return <dodecahedronGeometry args={[1.5, 0]} />
    case 3:
      return <icosahedronGeometry args={[1.5, 0]} />
    case 4:
      return <tetrahedronGeometry args={[1.8, 0]} />
    default:
      return <torusKnotGeometry args={[1, 0.34, 80, 10]} />
  }
}

function CategoryNode({ index }: { index: number }) {
  const category = SKILL_CATEGORIES[index]
  const position = skillNodePosition(index, COUNT)
  const group = useRef<THREE.Group>(null)
  const body = useRef<THREE.Mesh>(null)
  const satellites = useRef<THREE.Group>(null)
  const orbit = useRef<THREE.Mesh>(null)
  const m = getMaterials()

  useZoneFrame(ZONE.skills, (time, dt, _state, raw) => {
    const active = world.activeCategory === index ? 1 : 0
    const g = group.current
    if (g) g.scale.setScalar(damp(g.scale.x, 1 + active * 0.35, 5, raw))

    const b = body.current
    if (b) {
      b.rotation.y += dt * (0.3 + active * 0.5)
      b.rotation.x += dt * 0.12
      const mat = b.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = damp(mat.emissiveIntensity, 0.25 + active * 1.7, 5, raw)
    }

    const sg = satellites.current
    if (sg) {
      const s = damp(sg.scale.x, Math.max(active, 0.001), 4, raw)
      sg.scale.setScalar(s)
      sg.visible = s > 0.01
      sg.children.forEach((child, i) => {
        const a = time * 0.55 + (i / category.skills.length) * Math.PI * 2
        child.position.set(Math.cos(a) * SAT_RADIUS, Math.sin(a * 1.3 + i) * 0.7, Math.sin(a) * SAT_RADIUS)
        const hovered = active && world.hoverTech === i ? 1 : 0
        child.scale.setScalar(damp(child.scale.x, 1 + hovered * 1.1, 8, raw))
        child.rotation.y += dt
      })
    }
    if (orbit.current) orbit.current.visible = active === 1
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setCursor3D(true)
  }

  return (
    <group position={position}>
      <group ref={group}>
        <mesh
          ref={body}
          castShadow
          onClick={(e) => {
            if (!isBackgroundTarget(e.nativeEvent)) return
            e.stopPropagation()
            selectCategory(index)
          }}
          onPointerOver={over}
          onPointerOut={() => setCursor3D(false)}
        >
          <CategoryGeometry index={index} />
          <meshStandardMaterial color="#1d5a45" metalness={0.92} roughness={0.22} emissive={COLORS.accent} emissiveIntensity={0.25} flatShading />
        </mesh>
        <mesh ref={orbit} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <torusGeometry args={[SAT_RADIUS, 0.012, 6, 120]} />
          <primitive object={m.glowMint} attach="material" />
        </mesh>
        <group ref={satellites} scale={0.001}>
          {category.skills.map((skill) => (
            <mesh key={skill.name}>
              <octahedronGeometry args={[0.3, 0]} />
              <primitive object={skill.status === 'exploring' ? m.glowGold : m.glowMint} attach="material" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

/**
 * Technology ecosystem: six category crystals on an orbital ring. Selecting a category (in the
 * interface or by clicking a crystal) glides the camera to it and unfolds its technologies as
 * orbiting satellites.
 */
export function SkillsScene() {
  const q = useQuality()
  const m = getMaterials()
  const spokes = useMemo(() => {
    const pts: number[] = []
    for (let i = 0; i < COUNT; i++) {
      const [x, y, z] = skillNodePosition(i, COUNT)
      pts.push(0, 0, 0, x, y, z)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  const wire = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.7, 1)), [])
  const core = useRef<THREE.Group>(null)
  useEffect(
    () => () => {
      spokes.dispose()
      wire.dispose()
    },
    [spokes, wire],
  )

  useZoneFrame(ZONE.skills, (_time, dt) => {
    if (core.current) {
      core.current.rotation.y += dt * 0.25
      core.current.rotation.z += dt * 0.1
    }
  })

  return (
    <group position={ZONE_ORIGIN.skills}>
      <group ref={core}>
        <lineSegments geometry={wire}>
          <lineBasicMaterial color={COLORS.mint} transparent opacity={0.55} />
        </lineSegments>
        <mesh>
          <icosahedronGeometry args={[0.7, 1]} />
          <primitive object={m.glowAccent} attach="material" />
        </mesh>
      </group>
      <lineSegments geometry={spokes}>
        <lineBasicMaterial color={COLORS.mint} transparent opacity={0.22} />
      </lineSegments>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.8, 1]}>
        <torusGeometry args={[SKILL_RING_RADIUS, 0.015, 6, 220]} />
        <primitive object={m.glowMint} attach="material" />
      </mesh>

      {Array.from({ length: COUNT }, (_, i) => (
        <CategoryNode key={i} index={i} />
      ))}

      <GridFloor position={[0, -9, 0]} size={180} cell={3} opacity={0.2} radius={60} />
      <ShardField zone={ZONE.skills} count={Math.round(60 * q.density)} radius={[14, 38]} height={[-7, 18]} size={[0.15, 0.6]} seed={51} />
      <ShardField zone={ZONE.skills} count={Math.round(34 * q.density)} radius={[10, 34]} height={[-7, 16]} size={[0.05, 0.14]} seed={52} material={m.glowMint} />
      <PillarField count={Math.round(40 * q.density)} radius={[34, 90]} height={[14, 52]} width={[2.5, 8]} floorY={-9} center={[0, 0, -10]} seed={17} />
    </group>
  )
}
