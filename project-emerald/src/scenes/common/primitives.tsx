import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Center, Text3D } from '@react-three/drei'
import * as THREE from 'three'
import { world } from '@/state/world'
import type { Vec3 } from '@/config/layout'
import { mulberry32 } from '@/lib/math'
import { beamFragment, beamVertex, gridFragment, gridVertex } from './shaders'
import { useZoneFrame } from './Zone'

export const FONT_URL = `${import.meta.env.BASE_URL}fonts/lora-medium.typeface.json`

/* ------------------------------------ Beam ------------------------------------ */
interface BeamProps {
  position: Vec3
  height?: number
  radius?: number
  color?: string
  intensity?: number
}

/** A volumetric-style light shaft: an additive cone with view-dependent falloff. */
export function Beam({ position, height = 20, radius = 3, color = '#00DFA0', intensity = 0.35 }: BeamProps) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
      uTime: { value: 0 },
    }),
    [color, intensity],
  )
  return (
    <mesh
      position={position}
      renderOrder={2}
      onBeforeRender={() => {
        if (material.current) material.current.uniforms.uTime.value = world.time
      }}
    >
      <coneGeometry args={[radius, height, 40, 1, true]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={beamVertex}
        fragmentShader={beamFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/* ---------------------------------- GridFloor ---------------------------------- */
interface GridFloorProps {
  position: Vec3
  size?: number
  cell?: number
  color?: string
  opacity?: number
  radius?: number
}

/** Anti-aliased grid drawn entirely in the fragment shader, fading with distance from its centre. */
export function GridFloor({ position, size = 160, cell = 2, color = '#00DFA0', opacity = 0.35, radius = 60 }: GridFloorProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uCell: { value: cell },
      uOpacity: { value: opacity },
      uRadius: { value: radius },
      uCenter: { value: new THREE.Vector3() },
      uTime: { value: 0 },
    }),
    [color, cell, opacity, radius],
  )
  return (
    <mesh
      ref={mesh}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      onBeforeRender={() => {
        const m = material.current
        if (!m || !mesh.current) return
        m.uniforms.uTime.value = world.time
        // The fade is measured in world space, so read the mesh's final world position.
        m.uniforms.uCenter.value.setFromMatrixPosition(mesh.current.matrixWorld)
      }}
    >
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={gridVertex}
        fragmentShader={gridFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

/* ---------------------------------- MetalText ---------------------------------- */
interface MetalTextProps {
  children: string
  material: THREE.Material
  size?: number
  depth?: number
  position?: Vec3
  rotation?: Vec3
}

/** Real extruded, bevelled 3D typography (pre-converted Lora typeface, see scripts/). */
export function MetalText({ children, material, size = 1, depth = 0.3, position = [0, 0, 0], rotation = [0, 0, 0] }: MetalTextProps) {
  return (
    <group position={position} rotation={rotation}>
      <Center>
        <Text3D
          font={FONT_URL}
          size={size}
          height={depth}
          curveSegments={8}
          bevelEnabled
          bevelSize={0.02 * size}
          bevelThickness={0.03 * size}
          bevelSegments={3}
          letterSpacing={0.02}
          castShadow
        >
          {children}
          <primitive object={material} attach="material" />
        </Text3D>
      </Center>
    </group>
  )
}

/* ---------------------------------- ShardField ---------------------------------- */
type ShardMode = 'orbit' | 'rain' | 'stream'
type ShardShape = 'octa' | 'tetra' | 'box' | 'coin'

interface ShardFieldProps {
  zone: number
  count: number
  shape?: ShardShape
  mode?: ShardMode
  center?: Vec3
  /** orbit: radial range · rain/stream: horizontal spread. */
  radius: [number, number]
  /** y range (orbit: offset range · rain: fall range). */
  height: [number, number]
  size: [number, number]
  stretch?: Vec3
  speed?: number
  seed?: number
  /** Loop length for stream mode. */
  length?: number
  material?: THREE.Material
  color?: string
  emissive?: string
  castShadow?: boolean
}

/**
 * Thousands of drifting objects in a single draw call. Three motion modes cover orbiting shards,
 * falling data-rain and streaming speed lines.
 */
export function ShardField({
  zone,
  count,
  shape = 'octa',
  mode = 'orbit',
  center = [0, 0, 0],
  radius,
  height,
  size,
  stretch = [1, 1, 1],
  speed = 1,
  seed = 1,
  length = 80,
  material,
  color = '#1f5a45',
  emissive = '#00DFA0',
  castShadow = false,
}: ShardFieldProps) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // per-instance: angle, radius, y, scale, phase, spin
  const data = useMemo(() => {
    const rand = mulberry32(seed * 977)
    const arr = new Float32Array(count * 6)
    for (let i = 0; i < count; i++) {
      arr[i * 6] = rand() * Math.PI * 2
      arr[i * 6 + 1] = radius[0] + rand() * (radius[1] - radius[0])
      arr[i * 6 + 2] = height[0] + rand() * (height[1] - height[0])
      arr[i * 6 + 3] = size[0] + rand() * (size[1] - size[0])
      arr[i * 6 + 4] = rand()
      arr[i * 6 + 5] = 0.2 + rand() * 0.8
    }
    return arr
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, seed, radius[0], radius[1], height[0], height[1], size[0], size[1]])

  const update = (time: number) => {
    const m = mesh.current
    if (!m) return
    const [cx, cy, cz] = center
    const span = Math.max(height[1] - height[0], 0.001)
    for (let i = 0; i < count; i++) {
      const angle = data[i * 6]
      const r = data[i * 6 + 1]
      const y0 = data[i * 6 + 2]
      const s = data[i * 6 + 3]
      const phase = data[i * 6 + 4]
      const spin = data[i * 6 + 5]

      if (mode === 'orbit') {
        const a = angle + time * 0.06 * speed * (0.4 + phase)
        dummy.position.set(cx + Math.cos(a) * r, cy + y0 + Math.sin(time * 0.4 + phase * 6.283) * 0.6, cz + Math.sin(a) * r)
        dummy.rotation.set(time * spin * 0.6 + phase * 6, time * spin * 0.4 + phase * 3, phase * 2)
      } else if (mode === 'rain') {
        const fall = (y0 - height[0] + time * speed * (2 + phase * 3)) % span
        dummy.position.set(cx + Math.cos(angle) * r, cy + height[1] - fall, cz + Math.sin(angle) * r)
        dummy.rotation.set(0, 0, 0)
      } else {
        const flow = (phase * length + time * speed * (10 + phase * 14)) % length
        dummy.position.set(cx + Math.cos(angle) * r, cy + y0, cz + length / 2 - flow)
        dummy.rotation.set(0, 0, 0)
      }
      dummy.scale.set(s * stretch[0], s * stretch[1], s * stretch[2])
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }

  useLayoutEffect(() => {
    update(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mode])

  useZoneFrame(zone, (time) => update(time))

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false} castShadow={castShadow}>
      {shape === 'octa' && <octahedronGeometry args={[1, 0]} />}
      {shape === 'tetra' && <tetrahedronGeometry args={[1, 0]} />}
      {shape === 'box' && <boxGeometry args={[1, 1, 1]} />}
      {shape === 'coin' && <cylinderGeometry args={[1, 1, 0.16, 36]} />}
      {material ? (
        <primitive object={material} attach="material" />
      ) : (
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.22} metalness={0.85} roughness={0.3} flatShading />
      )}
    </instancedMesh>
  )
}

/* ---------------------------------- PillarField ---------------------------------- */
interface PillarFieldProps {
  count: number
  center?: Vec3
  radius: [number, number]
  height: [number, number]
  width: [number, number]
  floorY?: number
  seed?: number
  /** Half-width of the lane along the Z axis that stays free so the camera never clips a pillar. */
  corridor?: number
}

/** Static monolith silhouettes that give the world its sense of architectural scale. */
export function PillarField({ count, center = [0, 0, 0], radius, height, width, floorY = 0, seed = 3, corridor = 14 }: PillarFieldProps) {
  const mesh = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const rand = mulberry32(seed * 1301)
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    for (let i = 0; i < count; i++) {
      let a = 0
      let r = radius[0]
      let px = 0
      for (let attempt = 0; attempt < 12; attempt++) {
        a = rand() * Math.PI * 2
        r = radius[0] + rand() * (radius[1] - radius[0])
        px = center[0] + Math.cos(a) * r
        if (Math.abs(px) > corridor) break
      }
      const h = height[0] + rand() * (height[1] - height[0])
      const w = width[0] + rand() * (width[1] - width[0])
      dummy.position.set(px, floorY + h / 2, center[2] + Math.sin(a) * r)
      dummy.rotation.set(0, rand() * Math.PI, 0)
      dummy.scale.set(w, h, w * (0.6 + rand() * 0.8))
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      color.setHSL(0.42 + rand() * 0.04, 0.45, 0.07 + rand() * 0.07)
      m.setColorAt(i, color)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, seed, corridor])

  useEffect(() => {
    const m = mesh.current
    return () => m?.dispose()
  }, [])

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffffff" metalness={0.75} roughness={0.5} />
    </instancedMesh>
  )
}
